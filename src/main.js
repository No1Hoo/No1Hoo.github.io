import './styles/global.css';
import * as THREE from 'three';
import { gsap } from 'gsap';

const fallbackContent = {
  meta: {
    title: '吴子杰 Zijie Wu — AI Aquaculture Systems',
    description: '吴子杰 Zijie Wu：海南大学水产硕士，AI 赋能研发工程师，水产产业数字化与 AI 工作流实践者。',
  },
  brand: { mark: 'ZW', name: 'Zijie Wu / WUZIJIE' },
  hero: {
    eyebrow: 'AI × Aquaculture × Product',
    name: '吴子杰',
    latinName: 'Zijie Wu',
    lede: '海南大学（211 / 双一流）水产硕士，具备科研研发、项目管理、技术文档写作与 AI 工作流实践复合背景。擅长把 AI 工具融入技术调研、方案设计、专利材料、研发文档和自动化工作流。',
    primaryAction: { label: '查看完整简历 ↗', href: '/resume/wuzijie-resume.pdf' },
    secondaryAction: { label: '联系我', href: '#contact' },
    profileImage: { src: '/assets/zijie-wu-headshot.webp', alt: '吴子杰证件照' },
    profileMeta: ['广东湛江', '目标地区：海南省 / 大湾区城市', 'AI R&D Workflow Builder'],
  },
  work: { eyebrow: 'Selected work', title: '把行业判断变成可以演示、可以迭代的项目。' },
  projects: [
    {
      title: '智渔观察',
      copy: '基于 Next.js、React、TypeScript、Prisma、SQLite 搭建水产产业情报网站 MVP，支持信息聚合、管理后台、RSS / 网页采集、AI 摘要与定时采集。',
      tags: ['Next.js', 'React', 'TypeScript', 'Prisma', 'SQLite'],
      link: 'https://github.com/No1Hoo/zhiyu-observatory',
      action: 'Open Repository ↗',
      color: '#d9ff57',
    },
    {
      title: 'Chinese Patent Drafting Skill',
      copy: '面向 Codex 的中文发明专利撰写 Skill，用于专利草稿起草、现有技术对比、权利要求策略分析、附图生成与提交前 QA。',
      tags: ['Codex Skill', 'Patent Drafting', 'Prompt Engineering', 'QA'],
      link: '',
      action: '',
      color: '#8ef9ff',
    },
    {
      title: 'No1Hoo.github.io',
      copy: '原生 HTML / CSS / JS 个人主页与作品集网站，线上地址 zijiewu.eu.cc，集中展示个人介绍、项目作品、科研经历与 AI 实践。',
      tags: ['Three.js', 'GSAP', 'Vite', 'GitHub Pages', 'WebGL'],
      link: 'https://github.com/No1Hoo/No1Hoo.github.io',
      action: 'View Source ↗',
      color: '#ffc86b',
    },
  ],
};

async function loadSiteContent() {
  try {
    const response = await fetch(`/content/site.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
    return { ...fallbackContent, ...await response.json() };
  } catch (error) {
    console.warn('Using fallback portfolio content.', error);
    return fallbackContent;
  }
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value !== undefined) element.textContent = value;
}

function setLink(selector, link) {
  const element = document.querySelector(selector);
  if (!element || !link) return;
  element.textContent = link.label || '';
  element.href = link.href || '#';
}

function renderLinkList(containerSelector, links = []) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.replaceChildren(...links.map((link) => {
    const anchor = document.createElement('a');
    anchor.className = 'contact-link';
    anchor.href = link.href || '#';
    anchor.textContent = link.label || link.href || '';
    if (/^https?:\/\//.test(anchor.href) || link.href?.endsWith('.pdf')) {
      anchor.target = '_blank';
      anchor.rel = 'noopener';
    }
    return anchor;
  }));
}

function renderArticleList(containerSelector, items = [], variant = 'plain') {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.replaceChildren(...items.map((item) => {
    const article = document.createElement('article');
    if (variant === 'timeline') {
      const time = document.createElement('time');
      time.textContent = item.time || '';
      const title = document.createElement('h3');
      title.textContent = item.title || '';
      const copy = document.createElement('p');
      copy.textContent = item.copy || '';
      article.append(time, title, copy);
      return article;
    }
    const title = document.createElement('span');
    title.textContent = item.title || '';
    const copy = document.createElement('p');
    copy.textContent = item.copy || '';
    article.append(title, copy);
    return article;
  }));
}

function renderSiteContent(content) {
  document.title = content.meta?.title || fallbackContent.meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = content.meta?.description || fallbackContent.meta.description;

  setText('.brand span', content.brand?.mark);
  setText('.brand strong', content.brand?.name);
  setText('.hero .eyebrow', content.hero?.eyebrow);
  const heroTitle = document.querySelector('#hero-title');
  if (heroTitle) {
    heroTitle.replaceChildren(document.createTextNode(content.hero?.name || ''), document.createElement('span'));
    heroTitle.querySelector('span').textContent = content.hero?.latinName || '';
  }
  setText('.lede', content.hero?.lede);
  setLink('.hero-actions a:first-child', content.hero?.primaryAction);
  setLink('.hero-actions a:last-child', content.hero?.secondaryAction);
  const profileImage = document.querySelector('.profile-card img');
  if (profileImage && content.hero?.profileImage) {
    profileImage.src = content.hero.profileImage.src;
    profileImage.alt = content.hero.profileImage.alt || '';
  }
  const profileMeta = document.querySelector('.profile-meta');
  if (profileMeta) {
    profileMeta.replaceChildren(...(content.hero?.profileMeta || []).map((text) => {
      const span = document.createElement('span');
      span.textContent = text;
      return span;
    }));
  }

  setText('#work .eyebrow', content.work?.eyebrow);
  setText('#work-title', content.work?.title);
  setText('#system .eyebrow', content.system?.eyebrow);
  setText('#system-title', content.system?.title);
  renderArticleList('.system-grid', content.system?.items);

  const metrics = document.querySelector('.metrics');
  if (metrics) {
    metrics.replaceChildren(...(content.metrics || []).map((item) => {
      const article = document.createElement('article');
      const strong = document.createElement('strong');
      strong.textContent = item.value || '';
      const span = document.createElement('span');
      span.textContent = item.label || '';
      article.append(strong, span);
      return article;
    }));
  }

  setText('#resume .eyebrow', content.resume?.eyebrow);
  setText('#resume-title', content.resume?.title);
  renderArticleList('.resume-cards', content.resume?.items);
  setText('#journey .eyebrow', content.journey?.eyebrow);
  setText('#journey-title', content.journey?.title);
  renderArticleList('.timeline', content.journey?.items, 'timeline');
  setText('.research .eyebrow', content.research?.eyebrow);
  setText('#research-title', content.research?.title);
  renderArticleList('.research-list', content.research?.items);
  setText('#contact .eyebrow', content.contact?.eyebrow);
  setText('#contact-title', content.contact?.title);
  renderLinkList('.contact-row', content.contact?.links);
  const footerSpans = document.querySelectorAll('footer span');
  if (footerSpans[0]) footerSpans[0].textContent = content.footer?.left || '';
  if (footerSpans[1]) footerSpans[1].textContent = content.footer?.right || '';
}

async function init() {
const siteContent = await loadSiteContent();
renderSiteContent(siteContent);
const projects = siteContent.projects?.length ? siteContent.projects : fallbackContent.projects;

const canvas = document.querySelector('#stage');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#030405', 0.055);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 12);

const pointer = new THREE.Vector2();
const targetPointer = new THREE.Vector2();
const startedAt = performance.now();
let activeIndex = 0;
let targetRotation = 0;

const root = new THREE.Group();
scene.add(root);

const panelUniforms = [];
const panelGroup = new THREE.Group();
root.add(panelGroup);

const panelGeometry = new THREE.PlaneGeometry(3.4, 2.1, 48, 32);
const vertexShader = `
  uniform float uTime;
  uniform float uActive;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float wave = sin((uv.x * 8.0) + uTime * 1.4) * 0.055;
    wave += cos((uv.y * 7.0) - uTime * 1.2) * 0.035;
    transformed.z += wave * (0.35 + uActive);
    vDepth = transformed.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uActive;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vDepth;

  float line(vec2 uv, float scale) {
    vec2 grid = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
    return 1.0 - min(min(grid.x, grid.y), 1.0);
  }

  void main() {
    vec2 uv = vUv;
    float vignette = smoothstep(0.82, 0.18, distance(uv, vec2(0.5)));
    float scan = sin((uv.y + uTime * 0.08) * 90.0) * 0.035;
    float grid = line(uv + vec2(sin(uTime * 0.18) * 0.02, 0.0), 9.0) * 0.16;
    float edge = smoothstep(0.015, 0.08, uv.x) * smoothstep(0.015, 0.08, uv.y);
    edge *= smoothstep(0.015, 0.08, 1.0 - uv.x) * smoothstep(0.015, 0.08, 1.0 - uv.y);
    vec3 base = vec3(0.025, 0.03, 0.034);
    vec3 color = mix(base, uColor, 0.25 + uActive * 0.42);
    color += uColor * (grid + scan + max(vDepth, 0.0) * 0.45);
    color *= vignette;
    float alpha = 0.28 + uActive * 0.48;
    alpha *= edge;
    gl_FragColor = vec4(color, alpha);
  }
`;

projects.forEach((project, index) => {
  const uniforms = {
    uTime: { value: 0 },
    uActive: { value: index === 0 ? 1 : 0 },
    uColor: { value: new THREE.Color(project.color) },
  };
  panelUniforms.push(uniforms);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(panelGeometry, material);
  const angle = (index / projects.length) * Math.PI * 2;
  const radius = 4.6;
  mesh.position.set(Math.sin(angle) * radius, Math.sin(index * 0.7) * 0.55, Math.cos(angle) * radius);
  mesh.rotation.y = angle + Math.PI;
  mesh.userData.index = index;
  panelGroup.add(mesh);
});

const rails = new THREE.Group();
root.add(rails);
for (let i = 0; i < 7; i += 1) {
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 80 }, (_, point) => {
      const t = point / 79;
      const angle = t * Math.PI * 2 + i * 0.34;
      const radius = 2.8 + i * 0.38;
      return new THREE.Vector3(Math.sin(angle) * radius, (t - 0.5) * 7, Math.cos(angle) * radius);
    }),
    true
  );
  const tube = new THREE.TubeGeometry(curve, 96, 0.006 + i * 0.001, 6, true);
  const material = new THREE.MeshBasicMaterial({
    color: i % 2 ? '#dfe7dd' : '#7ce9ff',
    transparent: true,
    opacity: 0.16,
  });
  rails.add(new THREE.Mesh(tube, material));
}

const particleGeometry = new THREE.BufferGeometry();
const particleCount = 900;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i += 1) {
  const ring = Math.random() * Math.PI * 2;
  const radius = 2 + Math.random() * 7;
  positions[i * 3] = Math.sin(ring) * radius;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
  positions[i * 3 + 2] = Math.cos(ring) * radius;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    color: '#d7fff6',
    size: 0.014,
    transparent: true,
    opacity: 0.42,
  })
);
scene.add(particles);

const titleEl = document.querySelector('#project-title');
const copyEl = document.querySelector('#project-copy');
const indexEl = document.querySelector('#project-index');
const tagsEl = document.querySelector('#project-tags');
const linkEl = document.querySelector('#project-link');
const countEl = document.querySelector('.project-count');

function renderProject() {
  const project = projects[activeIndex];
  indexEl.textContent = String(activeIndex + 1).padStart(2, '0');
  countEl.lastChild.textContent = ` / ${String(projects.length).padStart(2, '0')}`;
  titleEl.textContent = project.title;
  copyEl.textContent = project.copy;
  tagsEl.replaceChildren(...project.tags.map((tag) => {
    const span = document.createElement('span');
    span.textContent = tag;
    return span;
  }));
  if (project.link) {
    linkEl.hidden = false;
    linkEl.href = project.link;
    linkEl.textContent = project.action;
  } else {
    linkEl.hidden = true;
    linkEl.removeAttribute('href');
    linkEl.textContent = '';
  }
  document.documentElement.style.setProperty('--accent', project.color);

  panelUniforms.forEach((uniforms, index) => {
    gsap.to(uniforms.uActive, {
      value: index === activeIndex ? 1 : 0,
      duration: 0.9,
      ease: 'power3.out',
    });
  });
}

function setProject(index) {
  activeIndex = (index + projects.length) % projects.length;
  targetRotation = -(activeIndex / projects.length) * Math.PI * 2;
  renderProject();
}

document.querySelector('#prev-project').addEventListener('click', () => setProject(activeIndex - 1));
document.querySelector('#next-project').addEventListener('click', () => setProject(activeIndex + 1));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') setProject(activeIndex - 1);
  if (event.key === 'ArrowRight') setProject(activeIndex + 1);
});

let wheelLock = false;
window.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) < 18 || wheelLock) return;
  wheelLock = true;
  setProject(activeIndex + Math.sign(event.deltaY));
  window.setTimeout(() => {
    wheelLock = false;
  }, 620);
}, { passive: true });

window.addEventListener('pointermove', (event) => {
  targetPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  targetPointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  const elapsed = (performance.now() - startedAt) / 1000;
  pointer.lerp(targetPointer, 0.075);
  root.rotation.y += (targetRotation - root.rotation.y) * 0.065;
  root.rotation.x += ((pointer.y * 0.08) - root.rotation.x) * 0.04;
  root.position.x += ((pointer.x * -0.42) - root.position.x) * 0.05;
  rails.rotation.y = elapsed * 0.04;
  particles.rotation.y = elapsed * -0.018;
  particles.rotation.x = Math.sin(elapsed * 0.18) * 0.04;
  panelUniforms.forEach((uniforms) => {
    uniforms.uTime.value = elapsed;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

renderProject();
animate();
}

init().catch((error) => {
  console.error('Portfolio initialization failed.', error);
});
