import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const inventory=JSON.parse(fs.readFileSync('test-results/original-shell/inventory.json'));
const records=new Map(),hashes=new Map();const cache='test-results/original-shell/downloads';fs.mkdirSync(cache,{recursive:true});
const clean=u=>u?.replaceAll('&amp;','&').replaceAll('&#038;','&');
function group(url){const f=path.basename(new URL(url).pathname);return /paso\d|proceso/.test(f)?'process':/individual-principal/.test(f)?'hero':/ejemplo-/.test(f)?'examples':/extra-|peana|iman|caja|regalo/.test(f)?'extras':/tipo-/.test(f)?'products':/woff|ttf/.test(f)?'ui/fonts':'configurator';}
async function download(url,kind='image'){
 url=clean(url);if(!url||!/^https:\/\//.test(url))return;if(records.has(url))return records.get(url);
 const rec={url,kind,status:'pending',review:kind==='font'?'FONT_LICENSE_REVIEW':'ORIGIN_REVIEW_REQUIRED'};records.set(url,rec);
 const cacheFile=path.join(cache,crypto.createHash('sha256').update(url).digest('hex'));
 try{let bytes;if(fs.existsSync(cacheFile))bytes=fs.readFileSync(cacheFile);else{let response;for(let i=0;i<3;i++){try{response=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0'}});if(response.ok)break;}catch{if(i===2)throw Error('timeout');}}
 if(!response?.ok)throw Error('HTTP '+response?.status);bytes=Buffer.from(await response.arrayBuffer());fs.writeFileSync(cacheFile,bytes);}
 const hash=crypto.createHash('sha256').update(bytes).digest('hex');rec.sha256=hash;rec.bytes=bytes.length;rec.status='localized';
 const f=path.basename(new URL(url).pathname).replace(/[^a-zA-Z0-9._-]/g,'-');rec.file=hashes.get(hash)||((kind==='css'?'css/original/':'assets/'+group(url)+'/')+f);
 if(!hashes.has(hash)){if(fs.existsSync(rec.file)&&crypto.createHash('sha256').update(fs.readFileSync(rec.file)).digest('hex')!==hash)rec.file=rec.file.replace(/(\.[^.]+)$/, '-'+hash.slice(0,8)+'$1');fs.mkdirSync(path.dirname(rec.file),{recursive:true});fs.writeFileSync(rec.file,bytes);hashes.set(hash,rec.file);}return rec;
 }catch(e){rec.status='unavailable';rec.reason=e.message;return rec;}
}
async function batch(items,handler){let cursor=0;await Promise.all(Array.from({length:6},async()=>{while(cursor<items.length){const item=items[cursor++];await handler(item);}}));}
const styles=[...new Set(inventory.css.filter(x=>x.url.includes('/themes/mifunko/')).map(x=>clean(x.url)))];
await batch(styles,u=>download(u,'css'));console.log('CSS estrutural consultado: '+styles.length);
let images=[];for(const img of inventory.images){if(img.classes?.includes('custom-logo') || /logo|favicon|trustpilot|revi-logo|logotipo|facebook\.com\/tr/i.test(img.url||'')){records.set(img.url,{url:img.url,kind:'branding',status:'excluded',reason:'Marca concorrente pura'});continue;}if(img.url)images.push(img.url);if(img.srcset)images.push(...img.srcset.split(',').map(x=>x.trim().split(/\s+/)[0]));}
for(const r of records.values())if(r.kind==='css'&&r.status==='localized'){const text=fs.readFileSync(r.file,'utf8');for(const m of text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)){if(!m[1].startsWith('data:'))images.push(new URL(m[1],r.url).href);}}
for(const style of inventory.styles)for(const m of style.text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)){if(m[1].startsWith('https:')&&!/pixel|tracker/.test(m[1]))images.push(m[1]);}
images=[...new Set(images.map(clean))].filter(u=>/^https:\/\//.test(u));await batch(images,u=>download(u));
// Preserve the original typefaces locally, without Google requests at runtime.
for(const url of [...new Set(inventory.css.filter(x=>x.url.includes('fonts.googleapis.com')).map(x=>clean(x.url)))]){
 const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});let css=await response.text();
 const fonts=[...css.matchAll(/url\(([^)]+)\)/g)].map(x=>x[1].replace(/["']/g,''));await batch(fonts,u=>download(u,'font'));
 for(const u of fonts){const r=records.get(u);if(r?.file)css=css.replaceAll(u,'/'+r.file);}
 const file=url.includes('Material')?'css/original/material-icons.css':'css/original/fonts.css';fs.writeFileSync(file,css);records.set(url,{url,kind:'css-fonts',file,status:'localized',review:'FONT_LICENSE_REVIEW'});
}
for(const r of records.values())if(r.kind==='css'&&r.file){let css=fs.readFileSync(r.file,'utf8');css=css.replace(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g,(full,u)=>{if(u.startsWith('data:'))return full;const record=records.get(new URL(u,r.url).href);return record?.file?'url(/'+record.file+')':full;});fs.writeFileSync(r.file,css);}
for(const record of records.values())if(record.file)record.localizedSha256=crypto.createHash('sha256').update(fs.readFileSync(record.file)).digest('hex');
const output=[...records.values()];fs.mkdirSync('docs/evidence',{recursive:true});fs.writeFileSync('docs/evidence/original-shell-assets.json',JSON.stringify(output,null,2));
console.log(JSON.stringify({urls:output.length,localized:output.filter(x=>x.status==='localized').length,uniqueFiles:new Set(output.filter(x=>x.file).map(x=>x.file)).size,unavailable:output.filter(x=>x.status==='unavailable'),excluded:output.filter(x=>x.status==='excluded')},null,2));
