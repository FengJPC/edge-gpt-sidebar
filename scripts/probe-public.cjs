// Opt-in live public-web smoke test. Never uses accounts, model APIs or daily profiles.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const cases=[
 {name:'Example HTML',url:'https://example.com/',pattern:'Example'},
 {name:'MDN Fetch guide',url:'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',pattern:'credentials'},
 {name:'Chrome permission documentation',url:'https://developer.chrome.com/docs/extensions/reference/api/permissions',pattern:'request'},
 {name:'Chrome verified locale URL',url:'https://developer.chrome.com/docs/extensions/reference/api/permissions?hl=zh-cn',pattern:'request'},
 {name:'arXiv abstract',url:'https://arxiv.org/abs/1706.03762',pattern:'attention'},
 {name:'arXiv PDF',url:'https://arxiv.org/pdf/1706.03762',pattern:'attention'},
 {name:'Project Chinese README',url:'https://raw.githubusercontent.com/FengJPC/edge-gpt-sidebar/main/README.md',pattern:'联网'},
 {name:'Bloch theorem',url:'https://en.wikipedia.org/wiki/Bloch%27s_theorem',pattern:'\\psi'},
 {name:'Controlled remote redirect',url:'https://httpbin.org/redirect-to?url=https%3A%2F%2Fexample.com%2F',pattern:'Example'},
 {name:'Controlled remote HTTP404',url:'https://httpbin.org/status/404',pattern:'missing'},
 {name:'W3C legacy document',url:'https://www.w3.org/TR/html401/charset.html',pattern:'character'}
];
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');if(only)cases.splice(0,cases.length,...cases.filter(c=>only.includes(c.name)));
(async()=>{
 const runID=new Date().toISOString().replace(/[:.]/g,'-'),out=path.join(root,'artifacts','public-live-'+runID);fs.mkdirSync(out,{recursive:true});
 const testExtension=path.join(out,'extension'),profile=path.join(out,'profile');fs.cpSync(path.join(root,'extension'),testExtension,{recursive:true});
 const origins=[...new Set(cases.map(c=>new URL(c.url).origin+'/*'))];
 const manifest=JSON.parse(fs.readFileSync(path.join(testExtension,'manifest.json'),'utf8'));manifest.host_permissions=[...new Set([...manifest.host_permissions,...origins])];fs.writeFileSync(path.join(testExtension,'manifest.json'),JSON.stringify(manifest,null,2));
 const fingerprints=Object.fromEntries(['public-reader.js','public-tools.js','public-sources.js','pdf-reader.js','web-diagnostics.js'].map(n=>[n,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'extension',n))).digest('hex')]));
 const ctx=await chromium.launchPersistentContext(profile,{executablePath:process.env.EDGE_EXECUTABLE_PATH||path.join(process.env['ProgramFiles(x86)']||'C:/Program Files (x86)','Microsoft/Edge/Application/msedge.exe'),headless:true,args:[`--disable-extensions-except=${testExtension}`,`--load-extension=${testExtension}`]});
 const report={started_at:new Date().toISOString(),mode:'live_public_tools_without_model_API',permission_setup:'Temporary extension copy predeclares only the listed HTTPS hosts. Reader permission callback verifies those actual grants, not the production all-HTTPS preference. Network responses and all extraction/cache/find/chunk code are real.',source_fingerprints:fingerprints,results:[],response_details:[],page_errors:[],network:[],model_api_requests:0};
 try{
  const worker=ctx.serviceWorkers()[0]||await ctx.waitForEvent('serviceworker',{timeout:20000}),id=new URL(worker.url()).host;
  await worker.evaluate(async()=>{await chrome.storage.local.clear();await chrome.storage.session.clear();});
  const page=await ctx.newPage();const cdp=await ctx.newCDPSession(page),urls=new Map();await cdp.send('Network.enable');cdp.on('Network.requestWillBeSent',e=>urls.set(e.requestId,e.request.url));cdp.on('Network.responseReceivedExtraInfo',e=>{const location=Object.entries(e.headers).find(([k])=>k.toLowerCase()==='location')?.[1];if(location)report.response_details.push({url:urls.get(e.requestId),http_status:e.statusCode,location});});page.on('pageerror',e=>report.page_errors.push(e.message));
  // Fail closed if any accidental authorization/model call is attempted.
  await ctx.route('https://api.openai.com/**',route=>{report.model_api_requests++;return route.abort();});await ctx.route('https://auth.openai.com/**',route=>route.abort());
  page.on('request',request=>{if(!request.url().startsWith('https://'))return;const headers=request.headers();report.network.push({url:request.url(),method:request.method(),sent_cookie:!!headers.cookie,sent_authorization:!!headers.authorization,sent_referrer:!!headers.referer});});
  await page.goto(`chrome-extension://${id}/sidepanel.html`);await page.waitForFunction(()=>document.getElementById('prompt'));
  for(const item of cases){
   const result=await page.evaluate(async item=>{
    const {executePublic}=await import('./public-tools.js'),{readPublic}=await import('./public-reader.js'),{newChat}=await import('./chats.js');
    const chat=globalThis.liveProbeChat||(globalThis.liveProbeChat=newChat()),events=[],controller=new AbortController();
    let inspection=null;const reader=(url,options)=>readPublic(url,{...options,fetcher:async(url,opts)=>{const response=await fetch(url,opts);if(response.ok&&/text\/html/i.test(response.headers.get('content-type')||'')){const raw=await response.clone().text();inspection={math_images:(raw.match(/<img\b[^>]*>/gi)||[]).filter(tag=>/math/i.test(tag)).slice(0,3).map(tag=>tag.slice(0,1500)),anchor_count:(raw.match(/<a\b/gi)||[]).length,mathml_count:(raw.match(/<math\b/gi)||[]).length};}return response;},hasPermission:()=>chrome.permissions.contains({origins:[new URL(url).origin+'/*']})});
    const invoke=async(name,args)=>executePublic(chat,{name,namespace:'public_web',call_id:'live_'+crypto.randomUUID(),arguments:JSON.stringify(args)},{reader,signal:controller.signal,onDiagnostic:e=>events.push(e)});
    const first=await invoke('read_url',{url:item.url,refresh:false}),r=first.result;let found,chunk,reused;
    if(r.source_id){found=(await invoke('find_in_source',{source_id:r.source_id,pattern:item.pattern})).result;if(r.next_offset!==null)chunk=(await invoke('read_source',{source_id:r.source_id,offset:r.next_offset,length:3000})).result;reused=(await invoke('read_url',{url:item.url,refresh:false})).result;}
    const source=(chat.publicSources||[]).find(s=>s.source_id===r.source_id);
    return {name:item.name,url:item.url,inspection,read:{...r,text:undefined},sample:r.text?.slice(0,600)||'',replacement_characters:source?.text.split('\ufffd').length-1||0,found,chunk:chunk?{...chunk,text:undefined,sample:chunk.text.slice(0,200)}:null,reused:reused?{...reused,text:undefined}:null,diagnostic_events:events};
   },item);
   report.results.push(result);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
   console.log(JSON.stringify({name:item.name,status:result.read.status,http_status:result.read.http_status,content_kind:result.read.content_kind,stored_chars:result.read.stored_chars,matches:result.found?.match_count,cache_reused:result.reused?.cached,error:result.read.error_message,duration_ms:result.read.duration_ms}));
  }
  await page.evaluate(async()=>{const response=await chrome.runtime.sendMessage({type:'chats',action:{op:'load'}});const c=globalThis.liveProbeChat;c.id=response.store.active;c.title='Live public tool test';c.messages=[{role:'user',content:'Live test of public webpage/PDF reading; no model API used.'}];await chrome.runtime.sendMessage({type:'chats',action:{op:'save',chat:c}});});
  await page.reload();await page.locator('#settings').click();await page.locator('#viewPublicSources').click();await page.setViewportSize({width:460,height:950});await page.screenshot({path:path.join(out,'snapshots.png')});
  report.finished_at=new Date().toISOString();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({report:path.join(out,'report.json'),screenshot:path.join(out,'snapshots.png'),model_api_requests:report.model_api_requests,page_errors:report.page_errors,credential_headers_sent:report.network.some(r=>r.sent_cookie||r.sent_authorization)}));
 }finally{await ctx.close();const target=path.resolve(profile),rel=path.relative(out,target);if(rel&&!rel.startsWith('..')&&!path.isAbsolute(rel)&&path.basename(target)==='profile')fs.rmSync(target,{recursive:true,force:true,maxRetries:10,retryDelay:200});}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
