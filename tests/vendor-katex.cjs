const https=require('node:https'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function get(url){return new Promise((resolve,reject)=>https.get(url,r=>{if(r.statusCode!==200)return reject(new Error('HTTP '+r.statusCode));const chunks=[];r.on('data',d=>chunks.push(d));r.on('end',()=>resolve(Buffer.concat(chunks)));}).on('error',reject));}
(async()=>{
 const pkg=JSON.parse(await get('https://registry.npmjs.org/katex/0.19.0'));
 const bytes=await get(pkg.dist.tarball);
 if('sha512-'+crypto.createHash('sha512').update(bytes).digest('base64')!==pkg.dist.integrity)throw new Error('Integrity mismatch');
 const temp=fs.mkdtempSync(path.join(root,'katex-vendor-'));fs.writeFileSync(path.join(temp,'package.tgz'),bytes);
 execFileSync('tar',['-xzf',path.join(temp,'package.tgz'),'-C',temp]);
 const dest=path.join(root,'extension','vendor','katex');fs.mkdirSync(dest,{recursive:true});
 for(const f of ['katex.mjs','katex.min.css'])fs.copyFileSync(path.join(temp,'package','dist',f),path.join(dest,f));
 fs.cpSync(path.join(temp,'package','dist','fonts'),path.join(dest,'fonts'),{recursive:true});
 fs.copyFileSync(path.join(temp,'package','LICENSE'),path.join(dest,'LICENSE'));
 fs.writeFileSync(path.join(dest,'source.json'),JSON.stringify({version:pkg.version,url:pkg.dist.tarball,integrity:pkg.dist.integrity},null,2));
 const rel=path.relative(root,temp);if(rel&&!rel.startsWith('..')&&!path.isAbsolute(rel))fs.rmSync(temp,{recursive:true,force:true});
 console.log('Vendored KaTeX '+pkg.version+' with verified package integrity');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
