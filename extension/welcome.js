import {t,setLanguage,captureUI} from './i18n.js';
const translateStatic=captureUI(document.body);
function updateLanguage(prefs){setLanguage(prefs?.language);translateStatic();document.documentElement.lang=prefs?.language==='en'?'en':'zh-CN';document.title=t('GPT 侧边栏');}
updateLanguage((await chrome.storage.local.get('uiPrefs')).uiPrefs);
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.uiPrefs)updateLanguage(changes.uiPrefs.newValue);});
const open = document.getElementById('open');
open.disabled = true;
chrome.windows.getCurrent().then(win => {
  open.disabled = false;
  open.onclick = () => {
    // Keep the click gesture: obtain the window before the user clicks.
    chrome.sidePanel.open({windowId: win.id}).then(() => {
      document.getElementById('status').textContent = t('已向 Edge 请求打开侧栏')+'.';
    }, e => {
      document.getElementById('status').textContent = t('侧栏打开失败：') + e.message;
    });
  };
});
