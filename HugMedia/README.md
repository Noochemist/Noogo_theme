# HugMedia

> **HugMedia = Hugo + Social Media**，一套以「社交平台视觉」为核心的 Hugo 主题集合型主题。开箱即用中英多语言，并提供 `xhs`(小红书)、`zhihu`(知乎)、`wechat`(公众号)、`medium`、`quora` 五种社交风格，切换仅需改动 `params.style` 一个参数。

> **HugMedia = Hugo + Social Media**, a Hugo theme centred on *social-platform visual languages*. It ships multilingual (zh + en) support out of the box and offers five switchable platform styles: `xhs` (Xiaohongshu), `zhihu` (Zhihu), `wechat` (WeChat Official Account), `medium`, and `quora` — switching only requires changing a single parameter, `params.style`.

> ⚠️ **开发状态 / Status**：主题仍处于积极开发中（当前为第一阶段的骨架与 `xhs` 风格实现）。下文标注为「已实现」的条目可直接使用；标注为「规划中」的条目对应配置开关已预留，将在后续阶段陆续生效。
> The theme is still under active development (currently Phase 1 scaffolding with the `xhs` style implemented). Entries marked **Implemented** are ready to use; entries marked **Roadmap** have their config switches reserved and will take effect in later phases.

---

## 目录 / Table of Contents
- [安装 / Installation](#安装--installation)
- [快速开始 / Quick Start](#快速开始--quick-start)
- [特性与配置 / Features & Configuration](#特性与配置--features--configuration)
  - [风格切换 / Style Switching](#风格切换--style-switching)
  - [多语言 / Multilingual](#多语言--multilingual)
  - [字体配置 / Fonts](#字体配置--fonts)
  - [菜单导航 / Menus](#菜单导航--menus)
  - [短代码 / Shortcodes](#短代码--shortcodes)
  - [文章封面 / Cover Image](#文章封面--cover-image)
  - [作者与社交 / Author & Social](#作者与社交--author--social)
  - [站内搜索 / Site Search](#站内搜索--site-search)
  - [无限滚动分页 / Pagination & Infinite Scroll](#无限滚动分页--pagination--infinite-scroll)
- [路线图 / Roadmap](#路线图--roadmap)
- [许可证 / License](#许可证--license)

---

## 安装 / Installation

> 你可以用以下任一方式将 HugMedia 接入你的 Hugo 站点。

> You can add HugMedia to your Hugo site using either of the following methods.

### 方式一：Git Submodule（推荐）/ Method 1: Git Submodule (recommended)

> 以主题集合仓库为来源，将 HugMedia 作为子模块引入，便于将来跟随本主题集合的版本更新。

> Pull HugMedia in as a submodule of the collection repository, so you can follow future updates easily.

```bash
cd your-hugo-site
git submodule add git@github.com:Noochemist/Noogo_theme.git themes/HugMedia
git submodule update --init --recursive
```

### 方式二：Git Clone / Method 2: Git Clone

> 直接克隆主题目录，适合快速尝试或无需跟随更新的场景。

> Clone the theme directory directly, handy for quick tries or when you do not need to track updates.

```bash
cd your-hugo-site
git clone --depth 1 git@github.com:Noochemist/Noogo_theme.git themes/HugMedia
```

> 以上命令中的仓库地址请替换为实际托管地址。

> Replace the repository URL above with your actual hosting address.

---

## 快速开始 / Quick Start

> 在站点根目录的 `hugo.toml` 中引入主题并设定风格即可：

> Enable the theme and set a style in the site root `hugo.toml`:

```toml
baseURL        = 'https://example.org/'
title          = 'My Blog'
defaultContentLanguage = 'zh-hans'
theme          = 'HugMedia'

[params]
  style = 'xhs'   # 可选：xhs | zhihu | wechat | medium | quora
```

> 之后可在主题的 `exampleSite` 中运行 `hugo server` 查看演示效果。

> You can run `hugo server` inside the theme's `exampleSite` to preview the demo.

---

## 特性与配置 / Features & Configuration

### 风格切换 / Style Switching

> 核心能力。通过 `params.style` 一键切换整站视觉风格。已实现 `xhs`；`zhihu` / `wechat` / `medium` / `quora` 为骨架（布局与样式已占位，细节在后续阶段完善）。

> The core feature. Switch the whole site's visual style through `params.style`. `xhs` is fully implemented; `zhihu` / `wechat` / `medium` / `quora` are scaffolds (layouts and styles are in place, to be refined in later phases).

```toml
[params]
  style = 'xhs'   # 可选：xhs | zhihu | wechat | medium | quora
```

---

### 多语言 / Multilingual

> 基于 Hugo 原生多语言，采用「每种语言独立 contentDir」的方式隔离内容。默认中文优先、英文为辅，可扩展任意语言。

> Based on Hugo's native multilingual support, content is isolated per language through a dedicated `contentDir` per language. Chinese is the default, English secondary, and any language can be added.

```toml
defaultContentLanguage = 'zh-hans'

[languages]
  [languages.zh-hans]
    title      = 'My Blog'
    contentDir = 'content/zh-hans'
    label      = '中文'
    weight     = 1
  [languages.en]
    title      = 'My Blog EN'
    contentDir = 'content/en'
    label      = 'English'
    weight     = 2
```

---

### 字体配置 / Fonts

> 通过 `[params.fonts]` 分别配置标题、正文、导航与代码四个字体栈。各栈把拉丁→简体→繁体→日→韩各脚本字体按回退顺序写进同一个栈，一套变量即可覆盖中英日韩混排。

> Configure four font stacks — title, body, nav and code — under `[params.fonts]`. Put the latin → Simplified → Traditional → Japanese → Korean fonts in the same stack in fallback order, so a single set of variables covers Chinese/English/Japanese/Korean mixed text.

```toml
[params.fonts]
  title = '"Noto Serif SC", "Georgia", serif'
  body  = '"Noto Sans SC", "Helvetica Neue", sans-serif'
  nav   = '"Noto Sans SC", "Helvetica Neue", sans-serif'
  code  = '"JetBrains Mono", "Fira Code", monospace'
```

---

### 菜单导航 / Menus

> 使用 Hugo 原生 `[[menu.main]]` 定义整站导航。动态加载：增删菜单项即自动反映到导航中；`pageRef` 指向对应 Section。当前页高亮由内部 partial 处理。

> Define your whole-site navigation with Hugo's native `[[menu.main]]`. It loads dynamically — add or remove a menu item and the navigation updates automatically; `pageRef` points to the corresponding Section. Active-page highlighting is handled by an internal partial.

```toml
[[menu.main]]
  identifier = "home"
  name       = "首页"
  pageRef    = "/"
  weight     = 10

[[menu.main]]
  identifier = "posts"
  name       = "文章"
  pageRef    = "/posts"
  weight     = 20
```

---

### 短代码 / Shortcodes

主题内置以下短代码，覆盖常见的媒体嵌入场景。

The theme ships the following shortcodes for common media-embedding cases.

| 短代码 / Shortcode | 说明 / Description | 示例 / Example |
| --- | --- | --- |
| `audio` | 音频播放器 | `{{< audio "/path/to.mp3" >}}` |
| `video` | 视频播放器（可选 `poster`） | `{{< video "/path/to.mp4" poster="/cover.jpg" >}}` |
| `bilibili` | 哔哩哔哩视频（可选 `height`） | `{{< bilibili "BV1xxx" >}}` 或 `{{< bilibili "BV1xxx" height="360" >}}` |

> 例：在正文中插入一段音频——
> Example — embed an audio clip in a post:

```markdown
{{< audio "https://example.org/media/intro.mp3" >}}
```

---

### 文章封面 / Cover Image

> 文章列表卡片会优先展示封面图。这是主题层通用机制、与当前风格无关：采用 Hugo **页面资源** 约定，在一篇文章的叶子目录（Leaf Bundle）中放置以 `cover` 命名的图片文件即可自动生效，无需任何配置。

> List cards prefer a cover image. This is a theme-wide mechanism independent of the current style. It follows Hugo's **page-resource** convention: drop a file named after `cover` into the post's leaf-bundle directory and it will be picked up automatically — no configuration needed.

```text
content/posts/my-post/
├── index.md      # 文章正文（Leaf Bundle 的入口文件）
└── cover.jpg     # 封面图（cover.* 均可，如 cover.png / cover.webp）
```

> 未提供封面图片时，列表卡片自动回退为「文字排版封面」——大号标题 + 居中节选正文，无需额外处理。

> If no cover image is supplied, the card automatically falls back to a text-composed cover — a large title with a centered excerpt of the post — with nothing extra to configure.

---

### 作者与社交 / Author & Social

> 站点作者信息与社交链接（用于作者卡片、页脚等）。`social` 覆盖国内外主流平台，留空即不显示对应图标。

> Site author info and social links (used by the author card, footer, etc.). `social` covers major domestic and international platforms; leave a value empty to hide its icon.

```toml
[params.author]
  name     = "Your Name"
  avatar   = "/images/avatar.jpg"
  bio      = "热爱分享，关注技术、设计与生活"
  email    = "me@example.org"

[params.social]
  github = "https://github.com/yourname"
  twitter = "https://twitter.com/yourname"
  rss     = "/index.xml"
```

---

### 站内搜索 / Site Search

> 基于 [Pagefind](https://pagefind.app) 的离线站内搜索。构建期对站点生成静态索引，前端按需加载并支持空格多关键字模糊匹配、多语言（中英日韩越）分词与命中高亮，无需外部服务，可将索引部署到任意静态主机。

> Offline site search powered by [Pagefind](https://pagefind.app). A static index is generated at build time; the front end loads it on demand with space-separated multi-keyword fuzzy matching, multilingual (zh/en/ja/ko/vi) tokenization, and hit highlighting — no external service required, deployable to any static host.

```bash
# 安装依赖
npm install
# 构建站点
hugo --minify
# 生成搜索索引（pagefind.yml 已配置：只索引文章目录 + 排除代码/评论/目录）
npx pagefind
```

> 开关：`[params.features].search = true`（默认开启）。搜索 UI 由共享组件提供，仅使用通用类 `search-ui__*`，输入框视觉归各风格（如 `.xhs-search`），与风格完全解耦。主题自带的 `npm run build` 已串联 `hugo` 与 `pagefind`。

> Toggle: `[params.features].search = true` (default on). The search UI comes from a shared component that uses only generic `search-ui__*` classes; the input's look belongs to each style (e.g. `.xhs-search`), keeping it fully style-agnostic. The theme's `npm run build` already chains `hugo` with `pagefind`.

---

### 无限滚动分页 / Pagination & Infinite Scroll

> 列表页面（首页、归档、标签页、分类页）内置 **双向无限滚动 + 页码直达**：向下滑到列表尾部继续上滑即可加载下一页，回拉到顶自动加载上一页，也可通过底部固定的分页控件直接输入页码跳转。无 JavaScript / SEO 抓取时退回传统静态分页链接。

> List pages — home, archives, tag and category pages — ship a **bidirectional infinite scroll with direct page-number navigation**: swipe up at the list bottom to load the next page, pull back to the top to load the previous one, or jump straight to any page via the bottom-pinned pagination bar. Without JavaScript (or for SEO crawlers) it degrades to plain static paging links.

```toml
[pagination]
  pagerSize = 3     # 每页条目数 / items per page
  path     = 'page' # 分页 URL 段 / paged URL segment

[params.features]
  infiniteScroll = true   # 开关 / toggle
```

> 交互细节：
> - 上滑超过视口约 2/5 才触发加载下一页，不足则松手回弹当前页；最后一页提示“到底啦”。
> - 回拉到顶自动预取上一页，并补偿滚动位置，阅读不跳变。
> - 分页控件固定钉底、只占内容列，位于页脚上方；加载中 / 已全部加载 / 失败状态就地提示。
> - 主题遵守渐进增强：无 JS 时「上一页/下一页」链接仍原生可点。

> Interaction details:
> - Swiping up past about 2/5 of the viewport loads the next page; releasing below that threshold springs back to the current page. The last page shows an “end of list” hint.
> - Pulling back to the top prefetches the previous page and compensates scroll position so reading never jumps.
> - The pagination bar is pinned to the bottom within the content column, above the footer; loading / all-loaded / error states are shown in place.
> - Progressive enhancement: without JS, the prev/next links remain natively clickable.

---

## 路线图 / Roadmap

> 以下功能开关已在 `[params.features]` 中预留，将在后续开发阶段陆续实现并在此文档同步补充配置示例：暗黑模式 (`darkMode`)、SPA 无刷新导航 (`spa`)、文章目录 (`toc`)、阅读时间 (`readingTime`)、语法高亮 (`syntaxHighlight`)、代码复制 (`codeCopy`)、KaTeX 数学公式 (`math`)、Mermaid 图表 (`mermaid`)、评论系统 (`comments`)、社交图标 (`socialLinks`)、打印友好 (`printFriendly`)、无障碍 (`accessible`)、统计 (`analytics`)。

> The following switches are reserved under `[params.features]` and will be implemented over upcoming phases, with config examples appended here: dark mode (`darkMode`), SPA navigation (`spa`), TOC (`toc`), reading time (`readingTime`), syntax highlighting (`syntaxHighlight`), code copy (`codeCopy`), KaTeX math (`math`), Mermaid diagrams (`mermaid`), comments (`comments`), social icons (`socialLinks`), print-friendly styles (`printFriendly`), accessibility (`accessible`), and analytics (`analytics`).

---

## 许可证 / License

> HugMedia 以 [MIT](../LICENCE.md) 许可证发布。可以自由使用、修改与分发，但需在副本中保留版权与许可声明。

> HugMedia is released under the [MIT](../LICENCE.md) license. You are free to use, modify and distribute it, provided the copyright and permission notice is retained in all copies.