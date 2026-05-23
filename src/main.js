import './styles/global.css';
import * as THREE from 'three';
import { gsap } from 'gsap';

const projects = [
  {
    title: '智渔观察',
    copy: '水产产业情报网站 MVP，聚焦水产养殖技术、智能设备、AI 应用、饲料苗种、动保趋势和价格观察。',
    tags: ['Next.js', 'React', 'Prisma', 'AI Coding', 'Aquaculture'],
    link: 'https://github.com/No1Hoo/zhiyu-observatory',
    action: 'Open Repository ↗',
    color: '#d9ff57',
  },
  {
    title: '个人品牌网站',
    copy: '基于 GitHub Pages 的个人主页，用 Three.js、GSAP、语义化 HTML 和响应式 CSS 构建沉浸式作品集展示。',
    tags: ['Three.js', 'GSAP', 'Vite', 'GitHub Pages', 'WebGL'],
    link: 'https://github.com/No1Hoo/No1Hoo.github.io',
    action: 'View Source ↗',
    color: '#8ef9ff',
  },
  {
    title: '深远海养殖方案',
    copy: '围绕绿鳍马面鲀、红鳍笛鲷等深水网箱养殖场景，参与技术规程优化、养殖方案设计和项目申报。',
    tags: ['Aquaculture', 'Protocol', 'Research', 'Technical Writing'],
    link: '',
    action: '',
    color: '#ffc86b',
  },
  {
    title: '渔业管道研发',
    copy: '参与深海养殖管材、小棚虾养殖管道系统、渔业增氧管等方向的市场调研、结构设计和试制协调。',
    tags: ['R&D', 'SolidWorks', 'Product', 'Market Research'],
    link: '',
    action: '',
    color: '#ff8fb8',
  },
];

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
