# 吴子杰 · 个人网站

- 主站：https://zijiewu.eu.cc/
- 腾讯云镜像：https://43.138.179.175/portfolio/

以科研项目、技术成果和 AI 应用实践为主线的中文作品集。基于现有 Vite 静态站改造；不依赖外部字体、分析服务或 WebGL。设计参考与事实边界见 [DESIGN-NOTES.md](./DESIGN-NOTES.md)。

## 本地运行

```sh
npm ci --include=dev
npm run dev
node --test tests/content.test.js
npm run build
```

内容：`public/content/site.json`；结构：`src/render.js`；样式：`src/styles/global.css`。
构建时预渲染正文，浏览器再读取同源 JSON。GitHub 内容后台保留在 `/admin/`，Token 只在页面内存中使用。旧 PDF 仍在原路径并标明为历史版本，智渔观察保留为静态概念演示。

## 发布与回退

GitHub Pages 使用 `gh-pages` 分支，而非 main。核对源码分支与工作树后提交源码，再执行 `npm run deploy` 发布构建产物。

腾讯云发布相同 dist 产物到独立版本目录，以 Caddy `handle_path /portfolio/*` 提供访问。添加路由前备份 Caddy 配置，校验通过后 reload。不得覆盖现有简历服务根路径、fishery 路由和 assets 站点。

重新发布时使用新的版本目录并验证后切换路由；回退使用原版本目录/已备份 Caddy 配置。不要把整个私有资料目录上传。CMS 直接保存只更新 GitHub JSON，腾讯云需再次部署，预渲染 HTML 也需重新构建。

大陆域名访问仍受备案及网络条件影响。当前镜像使用服务器 IP 的 HTTPS 子路径，不代表已完成独立域名备案或全运营商测速。
