const owner = 'No1Hoo';
const repo = 'No1Hoo.github.io';
const contentUrl = '../content/site.json';
const sourceTargets = [
  { branch: 'main', path: 'public/content/site.json' },
  { branch: 'gh-pages', path: 'content/site.json' },
];

const tokenInput = document.querySelector('#token');
const jsonEditor = document.querySelector('#json-editor');
const fieldEditor = document.querySelector('#field-editor');
const statusEl = document.querySelector('#status');

let siteData = {};

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = type;
}

function getToken() {
  return tokenInput.value.trim();
}

function setAtPath(target, path, value) {
  let cursor = target;
  path.slice(0, -1).forEach((key) => {
    cursor = cursor[key];
  });
  cursor[path.at(-1)] = value;
}

function walkStrings(value, path = [], fields = []) {
  if (typeof value === 'string') {
    fields.push({ path, value });
    return fields;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, [...path, index], fields));
    return fields;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => walkStrings(item, [...path, key], fields));
  }
  return fields;
}

function pathLabel(path) {
  return path.map((part) => typeof part === 'number' ? `[${part}]` : part).join('.');
}

function renderFields() {
  const fields = walkStrings(siteData);
  fieldEditor.replaceChildren(...fields.map((field) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'field';
    const label = document.createElement('small');
    label.textContent = pathLabel(field.path);
    const textarea = document.createElement('textarea');
    textarea.value = field.value;
    textarea.dataset.path = JSON.stringify(field.path);
    wrapper.append(label, textarea);
    return wrapper;
  }));
}

function syncJsonFromData() {
  jsonEditor.value = JSON.stringify(siteData, null, 2);
}

function readJsonEditor() {
  const parsed = JSON.parse(jsonEditor.value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON 根节点必须是对象。');
  }
  return parsed;
}

function applyFields() {
  const next = structuredClone(siteData);
  fieldEditor.querySelectorAll('textarea').forEach((textarea) => {
    setAtPath(next, JSON.parse(textarea.dataset.path), textarea.value);
  });
  siteData = next;
  syncJsonFromData();
  setStatus('字段修改已应用到右侧 JSON。保存前可以继续校验。', 'ok');
}

async function loadPublicContent() {
  setStatus('正在读取线上内容...');
  const response = await fetch(`${contentUrl}?v=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`读取失败：HTTP ${response.status}`);
  siteData = await response.json();
  syncJsonFromData();
  renderFields();
  setStatus('已读取线上内容。可以开始编辑。', 'ok');
}

function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function githubRequest(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error('请先填写 GitHub Token。');
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `GitHub API 请求失败：HTTP ${response.status}`);
  }
  return payload;
}

async function getFileSha(target) {
  const path = `/repos/${owner}/${repo}/contents/${encodeURIComponent(target.path).replaceAll('%2F', '/')}?ref=${target.branch}`;
  const payload = await githubRequest(path);
  return payload.sha;
}

async function saveFile(target, jsonText) {
  const sha = await getFileSha(target);
  const path = `/repos/${owner}/${repo}/contents/${encodeURIComponent(target.path).replaceAll('%2F', '/')}`;
  return githubRequest(path, {
    method: 'PUT',
    body: JSON.stringify({
      message: `cms: update site content (${target.branch})`,
      content: utf8ToBase64(`${jsonText}\n`),
      sha,
      branch: target.branch,
    }),
  });
}

async function saveToGithub() {
  siteData = readJsonEditor();
  renderFields();
  const jsonText = JSON.stringify(siteData, null, 2);
  setStatus('正在保存到 main 和 gh-pages...');
  for (const target of sourceTargets) {
    setStatus(`正在保存 ${target.branch}:${target.path}...`);
    await saveFile(target, jsonText);
  }
  setStatus('GitHub 内容保存完成。GitHub Pages 可能有缓存；腾讯云镜像需重新构建部署，预渲染文本也在下次部署更新。', 'ok');
}

document.querySelector('#save-token').addEventListener('click', () => {
  setStatus('Token 仅留在当前页面内存，刷新或关闭页面即清除。', 'ok');
});

document.querySelector('#logout').addEventListener('click', () => {
  localStorage.removeItem('portfolio-admin-token');
  tokenInput.value = '';
  setStatus('Token 已清除。', 'ok');
});

document.querySelector('#load-live').addEventListener('click', () => {
  loadPublicContent().catch((error) => setStatus(error.message, 'error'));
});

document.querySelector('#apply-fields').addEventListener('click', () => {
  try {
    applyFields();
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

document.querySelector('#format-json').addEventListener('click', () => {
  try {
    siteData = readJsonEditor();
    syncJsonFromData();
    renderFields();
    setStatus('JSON 已格式化。', 'ok');
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

document.querySelector('#validate-json').addEventListener('click', () => {
  try {
    siteData = readJsonEditor();
    renderFields();
    setStatus('JSON 校验通过。', 'ok');
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

document.querySelector('#save-github').addEventListener('click', () => {
  saveToGithub().catch((error) => setStatus(error.message, 'error'));
});

localStorage.removeItem('portfolio-admin-token');
tokenInput.value = '';
loadPublicContent().catch((error) => setStatus(error.message, 'error'));
