import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { chromium } from '../tests/playwright-runtime.js';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(fs.readFileSync('index.html')), '327d2941518821d6dc60e22ba842e43086557c90bfa5c21ee9bcfa3f3c7a65bb', 'Baseline original imutável');
const contract = JSON.parse(fs.readFileSync('docs/evidence/original-shell-structure.json'));
const manifest = JSON.parse(fs.readFileSync('docs/evidence/original-shell-assets.json'));
const browser = await chromium.launch({channel:process.env.APEX_BROWSER || 'msedge',headless:true});
try {
  const page = await browser.newPage();
  const result = await page.evaluate(({html, regions}) => {
    const d = new DOMParser().parseFromString(html,'text/html');
    const top = ['.mf-header','.mf-product-hero','#personalizar','.apex-trust-principles','#opiniones','#como-lo-hacemos','#faqs','#trabajos','.mf-product-trust','.mf-footer'];
    return {
      regions:regions.map(r=>{const nodes=[...d.querySelectorAll(r.selector)];return {id:r.id,count:nodes.length,images:nodes.reduce((sum,n)=>sum+n.querySelectorAll('img').length,0),svgs:nodes.reduce((sum,n)=>sum+n.querySelectorAll('svg').length,0)};}),
      order:top.every((selector,i)=>!i || Boolean(d.querySelector(top[i-1]).compareDocumentPosition(d.querySelector(selector)) & Node.DOCUMENT_POSITION_FOLLOWING)),
      scripts:[...d.scripts].map(n=>({src:n.getAttribute('src'),text:n.textContent.trim()})),
      external:[...d.querySelectorAll('*')].flatMap(n=>[...n.attributes].filter(a=>a.name!=='xmlns'&&/https?:\/\/|admin-ajax|add-to-cart=|wp-json|nonce/i.test(a.value)&&!(n.matches('meta[property="og:image"],meta[property="og:image:secure_url"],meta[name="twitter:image"]')&&a.name==='content'&&a.value==='https://res.cloudinary.com/dhbrxzt5a/image/upload/f_jpg,q_auto,w_1200/v1789223149/f977f9d7-a728-44f0-bac0-ea535a5a783c_hwle18.webp')).map(a=>({tag:n.tagName,attr:a.name,value:a.value}))),
      handlers:d.querySelectorAll('[onclick],[onload],[onerror],iframe,object,embed').length,
      brokenAnchors:[...d.querySelectorAll('a[href^="#"]')].filter(a=>a.hash.length>1&&!d.getElementById(a.hash.slice(1))).map(a=>a.getAttribute('href')),
      resources:[...d.querySelectorAll('img[src],link[href],script[src]')].flatMap(n=>[n.getAttribute('src')||n.getAttribute('href'),...(n.getAttribute('srcset')||'').split(',').map(s=>s.trim().split(/\s+/)[0])]).filter(Boolean),
      counts:{hero:d.querySelectorAll('[data-mf-product-slide]').length,thumbs:d.querySelectorAll('[data-mf-product-thumb]').length,products:d.querySelectorAll('[data-product]').length,process:d.querySelectorAll('.mf-product-how-card').length,gallery:d.querySelectorAll('#trabajos img').length,faq:d.querySelectorAll('.mf-product-faq-item').length,miniReviews:d.querySelectorAll('[data-mf-mini-slide]').length,reviews:d.querySelectorAll('.mf-review-card').length,specialObjects:d.querySelectorAll('[data-mf-card-kind=extras] [data-mf-special-accessory-input]').length},
    };
  }, {html:fs.readFileSync('dev.html','utf8'),regions:contract.regions});
  const removed = new Set(['mini-reviews','minis','gift','social-proof']);
  for (const original of contract.regions) {
    const actual = result.regions.find(r=>r.id===original.id);
    if (removed.has(original.id)) assert.equal(actual.count,0,original.id+' removido da oferta comercial');
    else assert.equal(actual.count,original.count,original.id+' containers preservados');
  }
  assert.ok(result.order,'Original top-level scroll order');
  assert.deepEqual(result.counts,{hero:6,thumbs:6,products:4,process:9,gallery:22,faq:7,miniReviews:0,reviews:0,specialObjects:35});
  assert.deepEqual(result.scripts,[{src:'/js/main.js',text:''}]);
  assert.deepEqual(result.external,[]);assert.equal(result.handlers,0);assert.deepEqual(result.brokenAnchors,[]);
  for(const path of new Set(result.resources)) {assert.ok(path.startsWith('/'),'Local resource '+path);assert.ok(fs.existsSync('.'+path),'Resource exists '+path);}
  for (const asset of manifest.filter(a=>a.file)) {
    const bytes=fs.readFileSync(asset.file);assert.ok(bytes.length>0,asset.file);
    assert.equal(sha(bytes),asset.localizedSha256,asset.file+' localized hash');
    if(['image','font'].includes(asset.kind))assert.equal(sha(bytes),asset.sha256,asset.file+' original bytes preserved');
    assert.ok(['ORIGIN_REVIEW_REQUIRED','FONT_LICENSE_REVIEW'].includes(asset.review),asset.file+' review provenance');
  }
  const report={passed:true,baseline:contract.baseline,regions:result.regions,counts:result.counts,removedCommercialRegions:[...removed],localizedFiles:manifest.filter(a=>a.file).length,assetsVerified:true,orderVerified:true,localResourcesOnly:true};
  fs.mkdirSync('test-results/original-shell',{recursive:true});fs.writeFileSync('test-results/original-shell/structural-comparison.json',JSON.stringify(report,null,2));
  console.log('PASS: regiões comerciais, ordem, contagens e '+report.localizedFiles+' arquivos locais verificados contra o baseline.');
} finally {await browser.close();}
