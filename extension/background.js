import {canUseToken} from './token-policy.js';
import {authorizationError} from './auth-errors.js';
import {t,setLanguage} from './i18n.js';
import {activePage,browserMaterial} from './browser-material.js';
import {AUTH, API, CALLBACK, randomToken, challenge, authorizationUrl, parseCallback, verifyIdToken, modelsFrom} from './core.js';
import {chatAction} from './chats.js';
import {diagnosticAction} from './web-diagnostics.js';
import {loadRegistrations,loginRegistration,rememberRegistration,disconnectRegistration} from './registrations.js';
let chatQueue=Promise.resolve(),diagnosticQueue=Promise.resolve();
let finishing = false, renewing, authEpoch = 0;
// Serialize credential writes with logout/login so an old refresh cannot erase
// or overwrite a newly connected account between its read and write.
let authQueue = Promise.resolve();
function authMutation(action) { const job = authQueue.then(action); authQueue = job.catch(()=>{}); return job; }
async function setup() {
  await loadRegistrations(chrome.storage.local);
  setLanguage((await chrome.storage.local.get('uiPrefs')).uiPrefs?.language);
  await chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true});
  await chrome.action.setTitle({title:t('打开 GPT 侧边栏')});
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({id: 'send-selection', title: t('发送到 GPT 侧边栏'), contexts: ['selection']});
}
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.uiPrefs){setLanguage(changes.uiPrefs.newValue?.language);chrome.contextMenus.update('send-selection',{title:t('发送到 GPT 侧边栏')},()=>void chrome.runtime.lastError);chrome.action.setTitle({title:t('打开 GPT 侧边栏')});}});
chrome.runtime.onInstalled.addListener(setup);
chrome.runtime.onStartup.addListener(setup);
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'send-selection' || !tab?.windowId) return;
  // Must open synchronously within the user gesture, before awaiting storage.
  const opening = chrome.sidePanel.open({windowId: tab.windowId});
  chrome.storage.local.set({selectionDraft: {id: crypto.randomUUID(), text: String(info.selectionText || '').slice(0, 20000), title: tab.title || '', url: /^https?:/.test(info.pageUrl || '') ? info.pageUrl : ''}});
  opening.then(() => chrome.storage.local.remove('panelError'), e => chrome.storage.local.set({panelError: '侧栏未能打开：' + e.message + '。选文已保存在草稿中；请点击扩展图标重试。'}));
});
async function status(text) { await chrome.storage.local.set({authStatus: text}); }
async function tokenRequest(fields) {
  const r = await fetch(AUTH + '/api/accounts/oauth/token', {method: 'POST', body: new URLSearchParams(fields), credentials: 'omit', signal: AbortSignal.timeout(30000)});
  if (!r.ok) throw await authorizationError(r, fields.grant_type);
  return r.json();
}
async function login(selected) {
  const epoch=++authEpoch;
  const registration = await loginRegistration(chrome.storage.local, selected);
  if(epoch!==authEpoch)return;
  const saved = await chrome.storage.local.get(['hostId', 'credential']);
  const hostId = saved.hostId || 'urn:uuid:' + crypto.randomUUID();
  await chrome.storage.local.set({hostId});
  const verifier = randomToken();
  const pending = {state: randomToken(), nonce: randomToken(), verifier, challenge: await challenge(verifier), created: Date.now(), clientId: registration?.clientId, subject: registration?.subject, loginHint: registration?.email};
  const tab = await chrome.tabs.create({url: chrome.runtime.getURL('login-start.html')});
  if(epoch!==authEpoch)return;
  pending.tabId = tab.id;
  await authMutation(async()=>{
    if(epoch!==authEpoch)return;
    await chrome.storage.session.set({pending});
    if(epoch!==authEpoch)return;
    await status('请在刚打开的 OpenAI 官方页面完成登录和授权。');
    if(epoch!==authEpoch)return;
    await chrome.tabs.update(tab.id, {url: authorizationUrl(pending, hostId)});
  });
}
chrome.webNavigation.onBeforeNavigate.addListener(async details => {
  if (details.frameId !== 0) return;
  const epoch=authEpoch;
  const {pending} = await chrome.storage.session.get('pending');
  if (epoch!==authEpoch || !pending || details.tabId !== pending.tabId || finishing===pending.state) return;
  let callback;
  try { callback = parseCallback(details.url, pending, details.tabId); } catch (e) {
    await chrome.storage.session.remove('pending'); await status(e.message); return;
  }
  if (!callback) return;
  finishing = pending.state;
  await chrome.storage.session.remove('pending');
  try {
    // Remove the authorization code from the address bar before network work.
    await chrome.tabs.update(details.tabId, {url: chrome.runtime.getURL('callback.html')});
    if(epoch!==authEpoch)return;
    await status('已收到登录回调，正在验证官方授权。');
    const tokens = await tokenRequest({grant_type: 'authorization_code', client_id: callback.clientId, code: callback.code, code_verifier: pending.verifier, redirect_uri: CALLBACK, resource: API});
    if(epoch!==authEpoch)return;
    const identity = await verifyIdToken(tokens.id_token, callback.clientId, pending.nonce);
    if (pending.subject && pending.subject !== identity.subject) throw new Error('所选应用登记属于其他账号，请选择对应账号重新登录。');
    if (!String(tokens.scope || '').split(' ').includes('chatgpt.tokens.use.direct')) throw new Error('登录成功，但没有授权使用 ChatGPT 套餐。');
    if (!tokens.access_token || !tokens.refresh_token || !Number.isFinite(tokens.expires_in)) throw new Error('官方授权返回不完整。');
    await authMutation(async () => {
      if(epoch!==authEpoch)return;
      const old = (await chrome.storage.local.get('credential')).credential;
      if(epoch!==authEpoch)return;
      if (old && (old.subject !== identity.subject || old.clientId !== callback.clientId)) throw new Error('重新登录的账号与原账号不一致。请先退出，再连接新账号。');
      await rememberRegistration(chrome.storage.local, {...identity, clientId: callback.clientId});
      if(epoch!==authEpoch)return;
      await chrome.storage.local.set({credential: {...identity, clientId: callback.clientId, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, expiresAt: Date.now() + tokens.expires_in * 1000, earliestRefreshAt: tokens.earliest_refresh_at || 0}, authStatus: '账号已连接，可以选择模型并聊天。'});
    });
  } catch (e) { if(epoch!==authEpoch)return; if(e.diagnostic)await chrome.storage.local.set({authDiagnostic:e.diagnostic}); await status('连接未完成：' + e.message); }
  finally { if(finishing===pending.state)finishing = false; }
}, {url: [{urlPrefix: CALLBACK}]});
async function accessToken() {
  // Acquire the shared flight BEFORE reading storage. Otherwise a delayed read
  // may start a second refresh with an already rotated, one-use refresh token.
  if (!renewing) renewing = (async () => {
    const {credential: c} = await chrome.storage.local.get('credential');
    if (!c) throw new Error('请先连接 ChatGPT 账号。');
    if (canUseToken(c)) return c.accessToken;
    let t;
    try { t = await tokenRequest({grant_type: 'refresh_token', client_id: c.clientId, refresh_token: c.refreshToken, resource: API}); }
    catch(e) {
      await authMutation(async () => {
        const current = (await chrome.storage.local.get('credential')).credential;
        if (!current || current.refreshToken !== c.refreshToken) return;
        if (e.diagnostic) await chrome.storage.local.set({authDiagnostic:e.diagnostic});
        if (e.unusable) await disconnectRegistration(chrome.storage.local);
        await status(e.message);
      });
      throw e;
    }
    if (!t.access_token || !t.refresh_token || !Number.isFinite(t.expires_in) || (t.scope && !t.scope.split(' ').includes('chatgpt.tokens.use.direct'))) throw new Error('刷新授权返回不完整，请重新登录。');
    await authMutation(async () => {
      const current = (await chrome.storage.local.get('credential')).credential;
      if (!current || current.refreshToken !== c.refreshToken) throw new Error('账号已更改，已取消保存刷新结果。');
      await chrome.storage.local.set({credential: {...c, accessToken: t.access_token, refreshToken: t.refresh_token, expiresAt: Date.now() + t.expires_in * 1000, earliestRefreshAt: t.earliest_refresh_at || 0}, authStatus:'账号已连接，可以选择模型并聊天。'});
    });
    return t.access_token;
  })().finally(() => { renewing = null; });
  return renewing;
}
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(''))) return;
  (async () => {
    if(msg.type==='activePage')return {target:await activePage()};if(msg.type==='browserMaterial')return browserMaterial(msg.mode,msg.target);if(msg.type==='chats'){const job=chatQueue.then(()=>chatAction(chrome.storage.local,msg.action));chatQueue=job.catch(()=>{});return job;}
    if(msg.type==='webDiagnostics'){const job=diagnosticQueue.then(()=>diagnosticAction(chrome.storage.local,msg.action));diagnosticQueue=job.catch(()=>{});return job;}
    if (msg.type === 'accounts') return {registry: await loadRegistrations(chrome.storage.local)};
    if (msg.type === 'login') { await login(msg.clientId); return {}; }
    if (msg.type === 'logout') { ++authEpoch; await authMutation(async()=>{await chrome.storage.session.remove('pending');await disconnectRegistration(chrome.storage.local); await status('已断开本机连接；可在 ChatGPT 设置中撤销应用授权。');}); return {}; }
    if (msg.type === 'token') return {token: await accessToken()};
    if (msg.type === 'models') {
      const r = await fetch(API + '/models', {headers: {Authorization: 'Bearer ' + await accessToken()}, signal: AbortSignal.timeout(30000)});
      if (!r.ok) throw new Error('读取模型失败：HTTP ' + r.status);
      return {models: modelsFrom(await r.json())};
    }
    throw new Error('未知操作。');
  })().then(data => reply({ok: true, ...data}), e => reply({ok: false, error: e.message}));
  return true;
});
