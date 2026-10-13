import {getDocument,GlobalWorkerOptions} from './vendor/pdfjs/pdf.mjs';
GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/pdf.worker.mjs',import.meta.url).href;
export async function pdfContent(bytes,{signal}={}){
 const task=getDocument({data:bytes,isEvalSupported:false,useWasm:false,cMapUrl:new URL('./vendor/pdfjs/cmaps/',import.meta.url).href,cMapPacked:true,standardFontDataUrl:new URL('./vendor/pdfjs/standard_fonts/',import.meta.url).href});let doc;
 const abort=()=>task.destroy().catch(()=>{});signal?.addEventListener('abort',abort,{once:true});
 try{if(signal?.aborted)throw new DOMException('Stopped','AbortError');doc=await task.promise;let text='',pages=0;const count=Math.min(doc.numPages,60);
  for(let n=1;n<=count&&text.length<120000;n++){if(signal?.aborted)throw new DOMException('Stopped','AbortError');const page=await doc.getPage(n);const content=await page.getTextContent();text+='\n\n[第 '+n+' 页]\n'+content.items.map(i=>i.str+(i.hasEOL?'\n':' ')).join('');page.cleanup();pages=n;}
  if(!text.replace(/\[第 \d+ 页\]/g,'').trim())throw new Error('PDF 没有可提取的文字，可能是扫描版；请改用截图。');
  return {text:text.slice(0,120000),extracted_chars:text.length,page_count:doc.numPages,pages_read:pages,truncated:doc.numPages>pages||text.length>120000};
 }catch(e){if(e.name==='PasswordException')throw new Error('PDF 需要密码，请先解锁后再上传。');throw e;}finally{signal?.removeEventListener('abort',abort);await task.destroy();}
}
export async function pdfText(bytes){const content=await pdfContent(bytes);return content.text+(content.truncated?'\n[内容已截断：最多 60 页、120000 字符]':'');}
