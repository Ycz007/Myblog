# Myblog

## 博客外观

视觉布局参考 [Firefly](https://github.com/CuteLeaf/Firefly)：浅绿色背景、横幅、侧栏与圆角卡片。页面使用原有 Vue 组件实现，没有引入 Firefly 的 Astro 代码或功能。

- 背景图：当前是本地占位图 `src/assets/banner.svg`。把自己的图片放进 `src/assets/`，修改 `src/assets/main.css` 的 `--blog-banner: url('./你的图片.jpg')`，横幅与侧栏封面会一起更新。
- 配色：在 `src/assets/base.css` 中修改 `--accent`、`--accent-soft` 等变量；暗色配色跟随系统。
- 横幅文字、侧栏介绍：在 `src/App.vue` 中修改。
- Markdown 排版：在 `src/assets/main.css` 的 `.markdown-body` 样式中修改。

搜索、标签筛选、日期排序、路由及 Markdown 加载逻辑保持原有实现。

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
