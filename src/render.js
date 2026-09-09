export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeUrl(value) {
 const url = String(value ?? '').trim();
 return /^(https:\/\/|mailto:|#|\.\/)/i.test(url) && !/[\\\u0000-\u0020]/.test(url) ? escapeHtml(url) : '#contact';
}
const e = escapeHtml;
const head = (number, title, note) => `<div class="section-heading"><p class="eyebrow">${number} / ${note}</p><h2>${title}</h2></div>`;
export function renderSite(d) {
 return `
 <header class="site-header"><a class="brand" href="#top"><span class="monogram">ZW.</span><span>吴子杰 <small>Zijie Wu</small></span></a>
 <nav aria-label="主导航"><a href="#work">作品</a><a href="#approach">能力</a><a href="#journey">经历</a><a href="#research">成果</a><a href="#contact" class="nav-contact">联系我 ↗</a></nav></header>
 <main id="main">
 <section class="hero" id="top" aria-labelledby="hero-title">
 <div class="hero-copy"><p class="eyebrow">${e(d.hero.eyebrow)}</p><p class="intro-name">你好，我是${e(d.hero.name)}。</p>
 <h1 id="hero-title">${d.hero.headline.map(line=>`<span>${e(line)}</span>`).join('')}</h1>
 <p class="lede">${e(d.hero.lede)}</p><div class="actions"><a class="button" href="#work">浏览精选作品 <span>↓</span></a><a class="text-link" href="#journey">了解我的经历 ↗</a></div>
 </div><figure class="portrait"><div class="portrait-frame"><img src="${safeUrl(d.hero.profileImage.src)}" alt="${e(d.hero.profileImage.alt)}" width="900" height="1125" fetchpriority="high"></div><figcaption><strong>${e(d.hero.latinName)}</strong><span>${e(d.hero.note)}</span></figcaption></figure>
 </section>
 <div class="index-strip"><span>科研项目管理</span><span>技术标准与成果材料</span><span>AI 产品与内容运营</span><a href="#work">SELECTED WORK ↓</a></div>
 <section id="work" class="section">${head('01','做过的事，正在打磨的作品。','SELECTED WORK')}
 <div class="projects">${d.projects.map((p,i)=>`<article class="project project-${i}"><div class="project-top"><p class="eyebrow">${e(p.category)}</p><span aria-hidden="true">↗</span></div><h3>${e(p.title)}</h3><p class="project-subtitle">${e(p.subtitle)}</p><p>${e(p.copy)}</p><ul class="tags">${p.tags.map(t=>`<li>${e(t)}</li>`).join('')}</ul><details><summary>实践细节</summary><p>${e(p.detail)}</p></details>${p.link?`<a class="text-link" href="${safeUrl(p.link)}" target="_blank" rel="noopener noreferrer">${e(p.action)}</a>`:'<p class="channel-note">微信搜索：深蓝渔业雷达</p>'}</article>`).join('')}</div>
 <div class="more-work"><span>更多探索</span><a href="https://github.com/No1Hoo" target="_blank" rel="noopener noreferrer">GitHub / No1Hoo ↗</a><a href="./zhiyu/">智渔观察 · 静态概念演示 ↗</a></div>
 </section>
 <section id="approach" class="section approach">${head('02','从任务到交付，衔接每一个环节。','HOW I WORK')}
 <div class="capabilities">${d.capabilities.map((c,i)=>`<article><span class="cap-number">0${i+1}</span><div><h3>${e(c.title)}</h3><p>${e(c.copy)}</p></div></article>`).join('')}</div>
 <article class="case-study"><div class="case-intro"><p class="eyebrow">PROJECT IN PRACTICE</p><h3>${e(d.caseStudy.title)}</h3><p class="case-role">${e(d.caseStudy.role)}</p><p>${e(d.caseStudy.copy)}</p><small>项目：${e(d.caseStudy.name)}</small></div><ol class="case-steps">${d.caseStudy.steps.map(s=>`<li><h4>${e(s.title)}</h4><p>${e(s.copy)}</p></li>`).join('')}</ol></article>
 </section>
 <section id="journey" class="section journey">${head('03','专业积累，是跨界实践的起点。','EXPERIENCE & EDUCATION')}<div class="journey-layout"><div><h3 class="group-title">工作经历</h3>${d.journey.map(j=>`<article class="timeline-item"><time>${e(j.time)}</time><h3>${e(j.title)}</h3><p class="role">${e(j.role)}</p><p>${e(j.copy)}</p></article>`).join('')}</div><div class="education"><h3 class="group-title">教育背景</h3>${d.education.map(j=>`<article class="timeline-item"><time>${e(j.time)}</time><h3>${e(j.title)}</h3><p>${e(j.role)}</p><p class="muted">${e(j.copy)}</p></article>`).join('')}<a class="text-link" href="./resume/wuzijie-resume.pdf" target="_blank" rel="noopener">历史 PDF 简历 · 改版前版本 ↗</a><p class="small-note">当前履历请以本页为准。最新定向简历可通过邮件索取。</p></div></div></section>
 <section id="research" class="section">${head('04','以成果，回应专业。','RESEARCH & OUTPUT')}
 <div class="metrics">${d.metrics.map(m=>`<article><strong>${e(m.value)}</strong><div><h3>${e(m.label)}</h3><p>${e(m.note)}</p></div></article>`).join('')}</div>
 <article class="featured-paper" aria-labelledby="featured-paper-title"><p class="eyebrow">代表作 / ${e(d.research[0].note)}</p><h3 id="featured-paper-title">${e(d.research[0].title)}</h3><p class="paper-citation">${e(d.research[0].citation)}</p><a class="text-link" href="${safeUrl(d.research[0].link)}" target="_blank" rel="noopener noreferrer">阅读论文原文 ↗</a></article>
 <details class="research-details"><summary>其他代表性论文与专利申请 <span>＋</span></summary><div class="research-list">${d.research.slice(1).map(r=>`<article><p>${e(r.note)}</p><h3>${e(r.title)}</h3></article>`).join('')}</div></details><p class="small-note">成果口径截至 ${e(d.updated)}。论文不含硕士学位论文；专利申请状态不等同于授权。仅展示履历摘要，不公开原始证明与未公开技术材料。</p></section>
 <section id="contact" class="contact"><p class="eyebrow">LET’S TALK</p><h2>${e(d.contact.title)}</h2><p>${e(d.contact.copy)}</p><a class="email-link" href="${safeUrl('mailto:'+d.contact.email)}">${e(d.contact.email)} ↗</a><div class="contact-bottom"><a href="https://github.com/No1Hoo" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://43.138.179.175/portfolio/">腾讯云入口 ↗</a><a href="#top">回到顶部 ↑</a></div></section>
 </main><footer><span>© 2026 吴子杰 · Zijie Wu</span><span>Research thoughtfully. Build usefully.</span></footer>`;
}
