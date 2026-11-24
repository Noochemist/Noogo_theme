# HugMedia

> **HugMedia = Hugo + Social Media**：以「社交平台视觉」为核心的 Hugo 主题。内置中英日韩越五语，提供 `xhs` / `zhihu` / `wechat` / `medium` / `quora` 五种社交风格，切换仅改 `params.style` 一个参数。

> HugMedia = Hugo + Social Media: a Hugo theme centred on social-platform visual languages — five languages (zh-hans / en / ja / ko / vi) out of the box, and five switchable platform styles: `xhs`, `zhihu`, `wechat`, `medium`, `quora`. Switching styles is a one-parameter change.

> **状态 / Status**：`xhs` 风格与全部功能模块已实现（多语言、SPA、暗黑、目录、阅读时间、语法高亮/复制、KaTeX、Mermaid、Pagefind 搜索与高亮、评论、社交、分享、分页 + 双向无限滚动、无障碍、打印）。`zhihu` / `wechat` / `medium` / `quora` 为骨架——配置与 CSS 已预置，模板待接线。

> Status: the `xhs` style and all feature modules are implemented (multilingual, SPA, dark mode, TOC, reading time, syntax highlighting/copy, KaTeX, Mermaid, Pagefind search & hit highlighting, comments, social, share, pagination + bidirectional infinite scroll, accessible, print). The other four styles are scaffolds — config & CSS pre-loaded, templates pending.

---

## 目录 / TOC
- [安装 / Installation](#安装--installation)
- [快速开始 / Quick Start](#快速开始--quick-start)
- [特性与配置 / Features & Configuration](#特性与配置--features--configuration)
- [规划 / Roadmap](#规划--roadmap)
- [许可证 / License](#许可证--license)

## 安装 / Installation

两种方式：作为集合仓库的子模块引入（便于跟随更新），或直接克隆主题目录。

Two ways: pull HugMedia in as a submodule of the collection repo (easy to track updates), or clone the theme directory directly.

```bash
# 方式一：Git Submodule（推荐）/ recommended
cd your-hugo-site
git submodule add git@github.com:Noochemist/Noogo_theme.git themes/HugMedia
git submodule update --init --recursive

# 方式二：Git Clone
git clone --depth 1 git@github.com:Noochemist/Noogo_theme.git themes/HugMedia
```

## 快速开始 / Quick Start

站点根 `hugo.toml` 引入主题并设定风格即可：

```toml
baseURL        = 'https://example.org/'
title          = 'My Blog'
defaultContentLanguage = 'zh-hans'
theme          = 'HugMedia'

[params]
  style = 'xhs'   # 可选：xhs | zhihu | wechat | medium | quora
```

随后进入主题的 `exampleSite` 运行 `hugo server` 即可预览演示。

Then run `hugo server` inside the theme's `exampleSite` to preview the demo.

## 特性与配置 / Features & Configuration

### 风格切换 / Style Switching
核心能力。`params.style` 一键切换整站风格；`xhs` 已完整实现，其余四个为骨架（未实现时回退 `xhs` 渲染，不会报错）。

The core feature — switch the whole site's look via `params.style`. `xhs` is fully implemented; the other four are scaffolds (unknown styles fall back to `xhs` rather than erroring).

### 多语言 / Multilingual
基于 Hugo 原生多语言，每语独立 `contentDir` 隔离内容，同构对译；可扩充任意语言。语言切换器使用简称（`shortLabel`）+ 国旗图标，下拉显示全称。

5 languages with dedicated `contentDir` each; any language can be added. The language switcher shows a short label + flag, with full names in the dropdown.

```toml
defaultContentLanguage = 'zh-hans'

[languages]
  [languages.zh-hans]
    title = 'My Blog'
    contentDir = 'content/zh-hans'
    weight = 1
  [languages.en]
    title = 'My Blog EN'
    contentDir = 'content/en'
    weight = 2
```

### 字体配置 / Fonts
`[params.fonts]` 配置 title / body / nav / code 四个字体栈；按 拉丁→简→繁→日→韩 回退顺序写进同一栈，一套变量覆盖中英日韩混排。

Configure four font stacks; the latin → Simplified → Traditional → Japanese → Korean fallback order lives in one stack, covering mixed-script text with a single set of variables.

### 菜单导航 / Menus
Hugo 原生 `[[menu.main]]`：增删菜单项自动反映到导航；`pageRef` 指向对应 Section；当前页高亮由内部 partial 处理，图标按风格/菜单项自动加载。

### 短代码 / Shortcodes
`audio` / `video`（可选 `poster`）/ `bilibili`（可选 `height`）/ `callout` / `code-fold` / `figure` / `image`，覆盖常见媒体嵌入与排版场景。

### 文章封面 / Cover Image
Leaf Bundle 中放置 `cover.*`（如 `cover.jpg`）即自动成为列表卡片封面，无需配置；无封面时回退「大标题 + 居中节选」的文字排版封面。

Drop a `cover.*` file into a post's leaf bundle and it is picked up automatically; without one, the card falls back to a text-composed cover (large title + centered excerpt).

### 作者与社交 / Author & Social
`[params.author]` 配置名称/头像/简介/邮箱；`[params.social]` 覆盖国内外主流平台，留空即不显示对应图标。

### 站内搜索 / Site Search
[Pagefind](https://pagefind.app) 离线索引（`pagefind.yml` 只索引文章目录），支持空格多关键字模糊匹配、五语分词与命中高亮，无需外部服务。主题自带 `npm run build` 已串联 `hugo` 与 `pagefind`。

### 分享 / Share
文章页顶栏分享卡片：`[params.share].platforms` 配置平台列表（默认启用 weibo / qq / x / reddit / mastodon / facebook / telegram / linkedin / whatsapp），点击跳转对应分享端点；「更多」按钮调用浏览器原生系统分享，浏览器不支持时自动降级为复制链接。

### 分页 / Pagination & Infinite Scroll
列表页内置**双向无限滚动 + 页码直达**：上滑加载下一页、回拉加载上一页、分页条直接跳转；无 JS / SEO 抓取时退回传统静态分页链接。

```toml
[pagination]
  pagerSize = 3     # 每页条目数 / items per page
  path = 'page'     # 分页 URL 段 / paged URL segment

[params.features]
  infiniteScroll = true
```

## 规划 / Roadmap
- 其余 4 种风格模板接线（zhihu / wechat / medium / quora）。
- 打磨验证：风格切换、断点、Lighthouse、无障碍、截图。
- 统计 analytics（开关已预留，默认关）。

Remaining: wire up the other four styles' templates; polish/validation (style switching, breakpoints, Lighthouse, accessibility, screenshots); analytics module (switch reserved, off by default).

## 许可证 / License

HugMedia 以 [MIT](../LICENCE.md) 发布，可自由使用、修改与分发，副本需保留版权与许可声明。

HugMedia is released under the [MIT](../LICENCE.md) license. You are free to use, modify and distribute it, provided the copyright and permission notice is retained in all copies.

---

Copyright (c) 2026, dustandrain.