import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { renderSite } from './src/render.js';
export default defineConfig({
 base:'./',
 plugins:[{
  name:'prerender-portfolio',
  transformIndexHtml(html) {
   const data=JSON.parse(readFileSync(new URL('./public/content/site.json',import.meta.url),'utf8'));
   return html.replace('<!--SITE_CONTENT-->',renderSite(data));
  },
  generateBundle(){
   this.emitFile({type:'asset',fileName:'zhiyu/index.html',source:readFileSync(new URL('./zhiyu/index.html',import.meta.url),'utf8')});
  }
 }],
 build:{outDir:'dist',assetsDir:'assets',sourcemap:false},
 server:{port:5173,open:false}
});
