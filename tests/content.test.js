import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { renderSite, escapeHtml, safeUrl } from '../src/render.js';
const data = JSON.parse(readFileSync(new URL('../public/content/site.json', import.meta.url), 'utf8'));
test('public content renders without a browser or remote service', () => {
 const html = renderSite(data);
 for (const text of ['渔儿小助手','深蓝渔业雷达','项目全流程推进','非授权数']) assert.ok(html.includes(text));
 assert.equal((html.match(/<h1 /g)||[]).length,1);
 assert.ok(!html.includes('undefined'));
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size);
 for(const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]),match[1]);
 for(const match of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) {
  const path=match[1];
  assert.ok(existsSync(new URL('../public/'+path,import.meta.url)) || path==='zhiyu/',path);
 }
});
test('content editor cannot inject markup or executable links',()=>{
 assert.equal(escapeHtml('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
 for(const value of ['javascript:alert(1)','data:text/html,x','//evil.example','https:\\evil.example']) assert.equal(safeUrl(value),'#contact');
 assert.equal(safeUrl('https://github.com/No1Hoo'),'https://github.com/No1Hoo');
 const malicious=structuredClone(data); malicious.hero.name='<script>alert(1)</script>';
 assert.ok(!renderSite(malicious).includes('<script>'));
});
test('evidence counts distinguish applications from grants',()=>{
 assert.deepEqual(data.metrics.map(m=>m.value),['9','2','6']);
 assert.match(data.metrics[2].note,/5 件受理，1 件公开审中/);
});
test('Q1 first-author paper is the visible lead research item',()=>{
 const html=renderSite(data);
 assert.match(data.research[0].title,/^Safety evaluation/);
 assert.equal(data.research[0].note,'SCI Q1 · 第一作者');
 assert.equal(data.research[0].link,'https://doi.org/10.1016/j.fsi.2024.109569');
 const featured=html.slice(html.indexOf('<article class="featured-paper"'),html.indexOf('<details class="research-details"'));
 assert.ok(featured.includes(data.research[0].title));
 assert.ok(!featured.includes('第三作者'));
 assert.ok(html.indexOf(data.research[0].title)<html.indexOf('Macroalgae Improve'));
});
