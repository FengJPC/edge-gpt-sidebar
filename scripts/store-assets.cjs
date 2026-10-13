// Render the project-owned vector icon; this uses no account or browser profile.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.EDGE_EXECUTABLE_PATH||path.join(process.env['ProgramFiles(x86)']||'C:/Program Files (x86)','Microsoft/Edge/Application/msedge.exe'),headless:true});
 try{
  const page=await browser.newPage();
  await page.setContent('<style>html,body{margin:0;background:transparent}svg{width:100vw;height:100vh;display:block}</style>'+fs.readFileSync(path.join(root,'store/icon.svg'),'utf8'));
  fs.mkdirSync(path.join(root,'extension/icons'),{recursive:true});
  for(const size of [16,32,48,128,300]){await page.setViewportSize({width:size,height:size});await page.screenshot({path:path.join(root,size===300?'store/logo-300.png':`extension/icons/icon-${size}.png`),omitBackground:true});}
  console.log('Rendered icons: 16, 32, 48, 128 px; store logo: 300 px');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
