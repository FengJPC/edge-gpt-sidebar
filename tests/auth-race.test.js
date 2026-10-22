import assert from 'node:assert/strict';
import {AUTH,CALLBACK,b64url} from '../extension/core.js';
function memory(initial={}){const state=structuredClone(initial);return {state,async get(keys){return Object.fromEntries((Array.isArray(keys)?keys:[keys]).map(k=>[k,structuredClone(state[k])]));},async set(v){Object.assign(state,structuredClone(v));},async remove(keys){for(const k of Array.isArray(keys)?keys:[keys])delete state[k];}};}
const local=memory(),session=memory(),noop={addListener(){}};
let messageHandler,navigationHandler,release,entered;
const barrier=new Promise(r=>release=r),started=new Promise(r=>entered=r);
globalThis.chrome={storage:{local,session,onChanged:noop},sidePanel:{setPanelBehavior:async()=>{}},action:{setTitle:async()=>{}},contextMenus:{removeAll:async()=>{},create(){},onClicked:noop},runtime:{id:'fixture',getURL:p=>'chrome-extension://fixture/'+p,onInstalled:noop,onStartup:noop,onMessage:{addListener(f){messageHandler=f;}}},tabs:{create:async()=>({id:10}),update:async()=>{}},webNavigation:{onBeforeNavigate:{addListener(f){navigationHandler=f;}}}};
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'fixture'};
let pending;
globalThis.fetch=async(url,opts)=>{
 if(url===AUTH+'/.well-known/jwks.json')return {ok:true,json:async()=>({keys:[jwk]})};
 if(url!==AUTH+'/api/accounts/oauth/token')throw new Error('Unexpected network target');
 entered();await barrier;
 const parts=[{alg:'RS256',kid:'fixture'},{iss:AUTH,aud:opts.body.get('client_id'),nonce:pending.nonce,sub:'fixture-user',exp:Math.floor(Date.now()/1000)+3600}].map(v=>b64url(new TextEncoder().encode(JSON.stringify(v))));
 const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(parts.join('.')));
 return {ok:true,json:async()=>({access_token:'FAKE',refresh_token:'FAKE',id_token:parts.join('.')+'.'+b64url(sig),scope:'openid chatgpt.tokens.use.direct',expires_in:3600})};
};
await import('../extension/background.js');
const rpc=m=>new Promise(r=>messageHandler(m,{id:'fixture',url:'chrome-extension://fixture/sidepanel.html'},r));
await rpc({type:'login'});pending=session.state.pending;
const finish=navigationHandler({frameId:0,tabId:10,url:CALLBACK+'?'+new URLSearchParams({state:pending.state,code:'FAKE',client_id:'oaiapp_fixture'})});
await started;await rpc({type:'logout'});
const disconnectedImmediately=!local.state.credential;
release();await finish;
assert.equal(disconnectedImmediately,true);
assert.equal(!!local.state.credential,false,'late authorization callback must not reconnect after logout');
assert.ok(local.state.authStatus.includes('已断开'));
