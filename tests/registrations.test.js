import test from 'node:test';
import assert from 'node:assert/strict';
import {NEW_ACCOUNT,loadRegistrations,rememberRegistration,loginRegistration,disconnectRegistration} from '../extension/registrations.js';
import {AUTH,CALLBACK,authorizationUrl,b64url} from '../extension/core.js';

function memory(initial = {}) {
  const state = structuredClone(initial);
  return {state, async get(keys) {return Object.fromEntries((Array.isArray(keys) ? keys : [keys]).map(k => [k,structuredClone(state[k])]));}, async set(values) {Object.assign(state,structuredClone(values));}, async remove(keys) {for (const k of Array.isArray(keys) ? keys : [keys]) delete state[k];}};
}
const account = {clientId:'oaiapp_existing',subject:'user-a',email:'same@example.test',name:'A'};
const credential = {...account,accessToken:'FAKE-ACCESS',refreshToken:'FAKE-REFRESH',idToken:'FAKE-ID',expiresAt:Date.now()+3600000};

test('legacy credentials migrate without secrets; disconnect preserves the client and host across repeated logins', async () => {
  const storage = memory({credential,hostId:'urn:uuid:existing-host',chatStore:{fixture:true}});
  await disconnectRegistration(storage);
  assert.equal(storage.state.credential,undefined);
  assert.equal(storage.state.hostId,'urn:uuid:existing-host');
  assert.deepEqual(storage.state.chatStore,{fixture:true});
  for (let i = 0; i < 3; i++) {
    assert.deepEqual(await loginRegistration(storage),account);
    await rememberRegistration(storage,credential);
    await storage.set({credential});
    await disconnectRegistration(storage);
  }
  const registry = await loadRegistrations(storage);
  assert.deepEqual(registry.accounts,[account]);
  assert.equal(registry.selected,account.clientId);
  assert.ok(!JSON.stringify(registry).includes('FAKE-'));
  assert.ok(!JSON.stringify(registry).includes('Token'));
});

test('account/workspace mappings remain distinct even with the same email; invalid selection never creates a fresh client', async () => {
  const storage = memory();
  await rememberRegistration(storage,credential);
  const other = {...account,clientId:'oaiapp_other_workspace',subject:'user-b'};
  await rememberRegistration(storage,other);
  assert.deepEqual(await loginRegistration(storage,account.clientId),account);
  assert.deepEqual(await loginRegistration(storage,other.clientId),other);
  assert.equal((await loadRegistrations(storage)).accounts.length,2);
  await assert.rejects(loginRegistration(storage,'missing-client'),/不存在/);
  await assert.rejects(rememberRegistration(storage,{...account,subject:'intruder'}),/不匹配/);
  assert.equal(await loginRegistration(storage,NEW_ACCOUNT),null);
});

test('a connected account cannot be switched or replaced by a new registration until disconnected', async () => {
  const storage = memory({credential});
  await assert.rejects(loginRegistration(storage,NEW_ACCOUNT),/先断开/);
  await assert.rejects(loginRegistration(storage,'oaiapp_other'),/先断开/);
  assert.equal((await loginRegistration(storage)).clientId,account.clientId);
});

test('saved registration records are projected onto non-secret fields and reject placeholder clients', async () => {
  const storage = memory({accountRegistrations:{selected:account.clientId,accounts:[credential,credential,{...credential,clientId:'dynamic_agent_client'}],accessToken:'SHOULD-NOT-KEEP'}});
  assert.deepEqual((await loadRegistrations(storage)).accounts,[account]);
  assert.ok(!JSON.stringify(storage.state).includes('FAKE-'));
  assert.ok(!JSON.stringify(storage.state).includes('SHOULD-NOT-KEEP'));
});

test('returning authorization uses the issued client, host and login hint; new authorization has no stale account hint', () => {
  const fields = {state:'fresh-state',nonce:'fresh-nonce',challenge:'fresh-pkce',clientId:account.clientId,loginHint:account.email};
  const returning = new URL(authorizationUrl(fields,'urn:uuid:host'));
  assert.equal(returning.searchParams.get('client_id'),account.clientId);
  assert.equal(returning.searchParams.get('login_hint'),account.email);
  assert.equal(returning.searchParams.get('ext_agent_host_id'),'urn:uuid:host');
  assert.equal(returning.searchParams.has('agent_name_hint'),false);
  const fresh = new URL(authorizationUrl({...fields,clientId:undefined},'urn:uuid:host'));
  assert.equal(fresh.searchParams.get('client_id'),'dynamic_agent_client');
  assert.equal(fresh.searchParams.has('login_hint'),false);
});

test('real background routes reuse clients after logout, allow explicit new accounts and validate the saved account identity', async () => {
  const previousChrome = globalThis.chrome, previousFetch = globalThis.fetch;
  const local = memory({credential,hostId:'urn:uuid:fixture-host'}), session = memory();
  let messageHandler,navigationHandler,lastAuthorization,tabId=10,subject='user-a';
  const noopEvent = {addListener() {}};
  globalThis.chrome = {
    storage:{local,session,onChanged:noopEvent},
    sidePanel:{setPanelBehavior:async()=>{},open:async()=>{}},action:{setTitle:async()=>{}},
    contextMenus:{removeAll:async()=>{},create(){},update(){},onClicked:noopEvent},
    runtime:{id:'fixture',getURL:path=>'chrome-extension://fixture/'+path,onInstalled:noopEvent,onStartup:noopEvent,onMessage:{addListener(fn){messageHandler=fn;}}},
    tabs:{create:async()=>({id:++tabId}),update:async(id,update)=>{if(update.url.startsWith(AUTH)) lastAuthorization=new URL(update.url);}},
    webNavigation:{onBeforeNavigate:{addListener(fn){navigationHandler=fn;}}},
  };
  const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'fixture'};
  globalThis.fetch=async(url,options)=>{
    if(url===AUTH+'/.well-known/jwks.json')return {ok:true,json:async()=>({keys:[jwk]})};
    assert.equal(url,AUTH+'/api/accounts/oauth/token');
    const clientId=options.body.get('client_id');
    const pending=callbackPending;
    const parts=[b64url(new TextEncoder().encode(JSON.stringify({alg:'RS256',kid:'fixture'}))),b64url(new TextEncoder().encode(JSON.stringify({iss:AUTH,aud:clientId,nonce:pending.nonce,sub:subject,email:account.email,exp:Math.floor(Date.now()/1000)+3600})))];
    const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(parts.join('.')));
    return {ok:true,json:async()=>({access_token:'FAKE-ACCESS-NEW',refresh_token:'FAKE-REFRESH-NEW',id_token:parts.join('.')+'.'+b64url(signature),scope:'openid chatgpt.tokens.use.direct',expires_in:3600})};
  };
  let callbackPending;
  const rpc=message=>new Promise(resolve=>messageHandler(message,{id:'fixture',url:'chrome-extension://fixture/sidepanel.html'},resolve));
  async function finish(clientId) {
    callbackPending=session.state.pending;
    await navigationHandler({frameId:0,tabId:callbackPending.tabId,url:CALLBACK+'?'+new URLSearchParams({state:callbackPending.state,code:'FAKE-ONE-USE',client_id:clientId})});
  }
  try {
    await import('../extension/background.js?registration-tests');
    for(let i=0;i<2;i++) {
      assert.equal((await rpc({type:'logout'})).ok,true);
      assert.equal(local.state.credential,undefined);
      assert.equal((await rpc({type:'login'})).ok,true);
      assert.equal(lastAuthorization.searchParams.get('client_id'),account.clientId);
      assert.equal(lastAuthorization.searchParams.get('ext_agent_host_id'),'urn:uuid:fixture-host');
      await finish(account.clientId);
      assert.equal(local.state.credential.subject,'user-a');
      assert.equal(local.state.accountRegistrations.accounts.length,1);
    }
    await rpc({type:'logout'});
    assert.equal((await rpc({type:'login',clientId:NEW_ACCOUNT})).ok,true);
    assert.equal(lastAuthorization.searchParams.get('client_id'),'dynamic_agent_client');
    subject='user-b';await finish('oaiapp_b');
    assert.equal(local.state.accountRegistrations.accounts.length,2);
    await rpc({type:'logout'});
    await rpc({type:'login',clientId:account.clientId});
    await finish(account.clientId); // A valid signature for a different subject must still fail.
    assert.equal(local.state.credential,undefined);
    assert.match(local.state.authStatus,/属于其他账号/);
    subject='user-a';await rpc({type:'login',clientId:account.clientId});await finish(account.clientId);
    assert.equal(local.state.credential.subject,'user-a');
    assert.equal(local.state.accountRegistrations.accounts.length,2);
    const publicAccounts=await rpc({type:'accounts'});
    assert.equal(publicAccounts.ok,true);
    assert.ok(!JSON.stringify(publicAccounts).includes('FAKE-'));
  } finally {globalThis.chrome=previousChrome;globalThis.fetch=previousFetch;}
});
