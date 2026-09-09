import './styles/global.css';
import { renderSite } from './render.js';
// Full content is pre-rendered. A failed request never erases the page.
fetch('./content/site.json', {cache:'no-cache'})
 .then(r => {if(!r.ok) throw new Error('Content unavailable'); return r.json();})
 .then(data => {
   const markup = renderSite(data);
   const site = document.querySelector('#site');
   if (!site.contains(document.activeElement) && !document.querySelector('details[open]')) site.innerHTML = markup;
   document.title = data.meta.title;
   document.querySelector('meta[name="description"]').content = data.meta.description;
 }).catch(() => {});
