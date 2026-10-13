export function extractPage(){
 const root=document.querySelector('article,main,[role="main"]')||document.body;
 const copy=root.cloneNode(true);
 const originals=[...root.querySelectorAll('*')],copies=[...copy.querySelectorAll('*')];
 for(let i=0;i<originals.length;i++){const style=getComputedStyle(originals[i]);if(style.display==='none'||style.visibility==='hidden')copies[i].remove();}
 copy.querySelectorAll('script,style,noscript,nav,header,footer,form,input,textarea,select,button,[hidden],[aria-hidden="true"],[contenteditable="true"]').forEach(n=>n.remove());
 copy.querySelectorAll('p,div,li,h1,h2,h3,tr,section').forEach(n=>n.append(document.createTextNode('\n')));
 const text=(copy.innerText||copy.textContent||'').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
 return {name:document.title||'当前网页',url:location.href,text:text.slice(0,120000)+(text.length>120000?'\n[已截断，仅提供前 120000 字符]':''),pdf:document.contentType==='application/pdf'};
}
export async function activePage(){
 const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true});
 if(!tab?.id||!/^https?:/.test(tab.url||''))throw new Error('请先在左侧打开网页，再从扩展图标打开侧栏。浏览器内部页和本地 PDF 请用上传按钮。');
 return {id:tab.id,windowId:tab.windowId,url:tab.url,title:tab.title};
}
export async function browserMaterial(mode,target){
 const tab=await chrome.tabs.get(target.id);
 if(tab.url!==target.url)throw new Error('页面已切换，请重新点击读取或截图。');
 if(mode==='screenshot'){
  const [active]=await chrome.tabs.query({active:true,windowId:target.windowId});
  if(active?.id!==target.id)throw new Error('截图前页面已切换，请重试。');
  let image;try{image=await chrome.tabs.captureVisibleTab(target.windowId,{format:'jpeg',quality:65});}catch{throw new Error('请在该网页点击一次工具栏中的扩展图标，授予当前页面的临时访问权限，然后重试截图。');}
  const after=await chrome.tabs.get(target.id);if(after.url!==target.url||!after.active)throw new Error('截图时页面已切换，已丢弃截图。');
  return {material:{id:crypto.randomUUID(),name:'截图：'+target.title,url:target.url,image}};
 }
 const origin=new URL(target.url).origin+'/*';
 if(!await chrome.permissions.contains({origins:[origin]})){
  // activeTab may already permit injection. Never grant broad hosts silently.
  try{const [r]=await chrome.scripting.executeScript({target:{tabId:target.id},func:extractPage});if(r.result&&!r.result.pdf&&!/\.pdf(?:[?#]|$)/i.test(target.url)){if((await chrome.tabs.get(target.id)).url!==target.url)throw new Error('页面已切换');if(!r.result.text)throw new Error('没有找到正文');return {material:{id:crypto.randomUUID(),...r.result}};}}catch{}
  throw new Error('尚未获得当前网站的读取权限，请点击「读网页/PDF」按钮授权后重试。');
 }
 let data;
 try{const [r]=await chrome.scripting.executeScript({target:{tabId:target.id},func:extractPage});data=r.result;}catch(e){if(!/\.pdf(?:[?#]|$)/i.test(target.url))throw new Error('无法读取该网页，可改用截图或上传文件。');}
 if(data?.pdf||/\.pdf(?:[?#]|$)/i.test(target.url)){
  const r=await fetch(target.url,{credentials:'omit',signal:AbortSignal.timeout(30000)});
  if(!r.ok)throw new Error('PDF 下载失败：HTTP '+r.status+'，可下载后上传。');
  if(Number(r.headers.get('content-length'))>20000000)throw new Error('PDF 超过 20 MB，请上传较小的文件。');
  const reader=r.body.getReader();let size=0,chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>20000000)throw new Error('PDF 超过 20 MB');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}
  const bytes=new Uint8Array(size);let pos=0;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}
  if((await chrome.tabs.get(target.id)).url!==target.url)throw new Error('下载 PDF 时页面已切换，请重试。');
  let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return {pdf:btoa(binary),name:target.title||'当前 PDF',url:target.url};
 }
 const after=await chrome.tabs.get(target.id);if(after.url!==target.url)throw new Error('读取时页面已切换，请重试。');
 if(!data?.text)throw new Error('未找到网页正文，可改用截图。');
 return {material:{id:crypto.randomUUID(),...data}};
}
