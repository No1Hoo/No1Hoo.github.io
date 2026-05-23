import './styles/global.css';
import * as THREE from 'three';

const startedAt = performance.now();

// Scroll tracking
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// Setup renderer exactly like Codex
const canvas = document.querySelector('#webgl-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x030405, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030405, 0.055);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 12);

const pointer = new THREE.Vector2();
const targetPointer = new THREE.Vector2();
const root = new THREE.Group();
scene.add(root);

// Particles like Codex
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 900;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
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

// Rails like Codex
const rails = new THREE.Group();
root.add(rails);
for (let i = 0; i < 7; i++) {
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

// Shader panels exactly like Codex
const panelUniforms = [];
const panelGroup = new THREE.Group();
root.add(panelGroup);

const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float wave = sin((uv.x * 8.0) + uTime * 1.4) * 0.055;
    wave += cos((uv.y * 7.0) - uTime * 1.2) * 0.035;
    transformed.z += wave * 0.35;
    vDepth = transformed.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
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
    vec3 color = mix(base, uColor, 0.42);
    color += uColor * (grid + scan + max(vDepth, 0.0) * 0.45);
    color *= vignette;
    float alpha = 0.48;
    alpha *= edge;
    gl_FragColor = vec4(color, alpha);
  }
`;

const panelGeometry = new THREE.PlaneGeometry(3.4, 2.1, 48, 32);
const panelColors = ['#8ef9ff', '#f7ff6a', '#ff8fb8', '#9dffb8'];

panelColors.forEach((color, index) => {
  const uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
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
  const angle = (index / panelColors.length) * Math.PI * 2;
  const radius = 4.6;
  mesh.position.set(Math.sin(angle) * radius, Math.sin(index * 0.7) * 0.55, Math.cos(angle) * radius);
  mesh.rotation.y = angle + Math.PI;
  panelGroup.add(mesh);
});

// Pointer tracking
window.addEventListener('pointermove', (event) => {
  targetPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  targetPointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop with scroll effect
function animate() {
  requestAnimationFrame(animate);

  const elapsed = (performance.now() - startedAt) / 1000;

  // Calculate scroll progress (0 to 1)
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;

  pointer.lerp(targetPointer, 0.075);

  // Mouse controlled rotation
  root.rotation.y += (pointer.x * 0.08 - root.rotation.y) * 0.065;
  root.rotation.x += (pointer.y * 0.08 - root.rotation.x) * 0.04;
  root.position.x += (pointer.x * -0.42 - root.position.x) * 0.05;

  // Scroll based effects
  const scrollRotation = scrollProgress * Math.PI * 0.5;
  root.rotation.y += (scrollRotation - root.rotation.y) * 0.02;

  // Rails rotation with time + scroll
  rails.rotation.y = elapsed * 0.04 + scrollProgress * Math.PI * 0.3;

  // Particles with scroll
  particles.rotation.y = elapsed * -0.018 + scrollProgress * Math.PI * 0.5;
  particles.rotation.x = Math.sin(elapsed * 0.18) * 0.04 + scrollProgress * 0.2;

  // Camera moves with scroll
  camera.position.y = 1.2 - scrollProgress * 1.5;
  camera.position.z = 12 + scrollProgress * 2;
  camera.rotation.x = scrollProgress * 0.1;

  panelUniforms.forEach((uniforms) => {
    uniforms.uTime.value = elapsed;
  });

  renderer.render(scene, camera);
}

animate();

// Init reveal animations
const io = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add('in');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = Math.min(i % 6 * 65, 320) + 'ms';
  io.observe(el);
});

console.log('%c Zijie Wu — interactive portfolio ', 'background:#d9ff57;color:#030405;padding:8px 12px;border-radius:6px;font-weight:900');