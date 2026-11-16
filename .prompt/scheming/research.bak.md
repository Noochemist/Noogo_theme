# RedStyle 主题 · 设计调研与技术方案

> 目标：一个 Hugo 主题，支持 5 种社交平台风格切换（小红书 / 知乎 / 公众号 / Medium / Quora），
> 通过 `hugo.toml` 参数配置；SPA 由 swup 驱动；代码模块化、特性隔离。

---

## 一、整体架构

```
┌───────────────────────────────────────────────────────┐
│                    hugo.toml                           │
│  [params.style]  →  xhs | zhihu | wechat | medium ... │
│  [params.fonts]  →  标题/正文/导航/代码              │
│  [params.features] → darkMode / search / toc / spa ...│
└──────────────┬────────────────────────────────────────┘
               │ hugo template .Site.Params 读取
               ▼
┌───────────────────────────────────────────────────────┐
│                  layouts/*.html                        │
│  baseof.html  →  统一骨架                             │
│  home.html    →  首页模板                             │
│  page.html    →  文章页模板                           │
│  _/partials/  →  可复用片段                           │
└──────────────┬────────────────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────────────────┐
│                 assets/css/ + assets/js/               │
│  核心框架 (独立于风格)  →  base.css  layout.css  ...   │
│  风格层 (可切换)       →  style-xhs.css  style-medium  │
│  特性模块 (可开关)     →  darkmode.js  toc.js  ...     │
│  SPA 层                →  swup / spa-client.js         │
└───────────────────────────────────────────────────────┘
```

### 隔离原则

| 维度 | 隔离方式 |
|------|---------|
| 风格 × 功能 | 每个风格一套独立 CSS 文件；功能模块（响应式、暗黑、搜索）写在 base 层，风格层只覆写变量 |
| CSS 隔离 | 使用 CSS Custom Properties + 风格专属前缀 `.style-xhs { --brand: #FB3252 }` |
| JS 隔离 | 每个特性一个文件，通过初始化函数 + 事件绑定连接，去掉文件即失去功能 |
| 模板隔离 | 通过 hugo `partialCached` + 条件判断 `{{ if eq .Site.Params.style "xhs" }}` 选择片段 |
| 构建隔离 | Hugo `css.Build` + `js.Build` 按需打包，风格 A 不被风格 B 加载 |

---

## 二、五种社交平台风格设计特征

### 2.1 小红书 (xhs) — 图片驱动 / 瀑布流 / 红色系

| 维度 | 值 |
|------|---|
| 品牌色 | `#FB3252`（采样自截图）、`#FF2442` |
| 背景 | 纯白 + 粉红软调 `#FFE8EC` |
| 字体 | 中文无衬线（苹方/思源黑体），标题粗 600+ |
| 布局 | 双列/五列瀑布流，卡片封面 3:4~4:5 竖版 |
| 导航 | 顶部 Logo + 搜索框 + 打开App，左侧垂直导航 |
| 卡片信息 | 封面 → 2 行标题 → 作者头像昵称 + 点赞数 |
| 详情页 | 左主图（3:4 固定高度）+ 右侧滚动评论栏（固定宽度） |
| 圆角 | 卡片 10~14px，按钮 18~22px |
| 阴影 | 轻 `0 2px 8px rgba(0,0,0,0.04)` |

**模板映射：**
- 首页：`home-xhs.html` → 瀑布流卡片
- 详情页：`page-xhs.html` → 左图右评论
- 侧栏：`partials/sidebar-xhs.html`

**CSS 变量层：**
```css
.style-xhs {
  --brand: #FB3252;
  --brand-hover: #E02345;
  --brand-soft: #FFE8EC;
  --card-radius: 10px;
  --card-shadow: 0 1px 4px rgba(0,0,0,0.04);
  --grid-cols: 5;
}
```

---

### 2.2 知乎 (zhihu) — 问答驱动 / 列表 / 蓝色系

| 维度 | 值 |
|------|---|
| 品牌色 | `#0066FF`（知乎蓝） |
| 背景 | 纯白 + 浅灰 `#F6F6F6` |
| 字体 | 中文无衬线，正文 15px，行高 1.8 |
| 布局 | 单列列表流，每个条目有标题 + 作者 + 摘要 + 标签 |
| 导航 | 顶栏 Logo + 搜索 + 提问 + 通知 + 头像 |
| 内容区 | 问题列表、回答列表、专栏文章列表 |
| 详情页 | 问题标题 + 回答长文（支持数学公式、代码块） |
| 交互 | 赞同 / 反对 / 收藏 / 分享，评论折叠 |
| 特色 | 「写回答」悬浮按钮、热榜侧边栏 |

**模板映射：**
- 首页：`home-zhihu.html` → 问答列表流 + 热榜侧栏
- 详情页：`page-zhihu.html` → 问题 + 回答正文
- 热榜：`partials/hotlist-zhihu.html`

---

### 2.3 公众号 (wechat) — 阅读驱动 / 单栏 / 绿色系

| 维度 | 值 |
|------|---|
| 品牌色 | `#07C160`（微信绿） |
| 背景 | 纯白，文章内容区有最大宽度限制 |
| 字体 | 中文衬线/无衬线混合，正文 15~16px，行高 1.75~2.0 |
| 布局 | 单栏居中，最大宽度 677px |
| 导航 | 极简顶栏，公众号头像 + 名称，无侧边栏 |
| 文章结构 | 标题（居中）→ 作者 → 正文 → 赞赏码 → 相关推荐 |
| 特色 | 「在看」按钮、「分享」引导、阅读量显示 |

**关键约束：** 公众号风格的核心是「沉浸式阅读」，页面元素要极少，留白多。

---

### 2.4 Medium — 写作驱动 / 单栏 / 黑白色系

| 维度 | 值 |
|------|---|
| 品牌色 | `#000000` / `#242424`（纯黑白） |
| 背景 | 纯白 `#FFFFFF`，正文区浅灰 `#FAFAFA` |
| 字体 | 衬线正文（Source Serif / Georgia）+ 无衬线标题（Inter） |
| 布局 | 单栏居中，最大宽度 680px |
| 导航 | 极简顶栏（Logo + 搜索 + 头像），无左侧栏 |
| 排版 | 大标题居中、首字下沉可选、段落间距大 |
| 特色 | 固定左侧目录（sticky TOC 滚动高亮）、clap（鼓掌）可多次点击 |

---

### 2.5 Quora — 知识驱动 / 双栏 / 红棕色调

| 维度 | 值 |
|------|---|
| 品牌色 | `#B92B27`（Quora 红棕） |
| 背景 | 浅灰 `#F6F7F9`，内容区白 |
| 字体 | 中文无衬线（Roboto / 苹方），正文 14~15px |
| 布局 | 三栏（左导航 + 中内容 + 右推荐），内容栏最大 680px |
| 导航 | 左侧垂直导航（Home / Answer / Space / Notification） |
| 特色 | 问题 → 多个回答、Related Questions 侧栏、Space 社区 |

---

### 五种风格对比一览

| 风格 | 主色 | 布局 | 导航位置 | 卡片？ | 内容核心 |
|------|------|------|---------|--------|---------|
| 小红书 | 红 | 瀑布流 5列 | 左+顶 | ✅ 封面卡 | 图片/笔记 |
| 知乎 | 蓝 | 列表 单列 | 顶+右热榜 | ❌ 问答条目 | 问答 |
| 公众号 | 绿 | 单栏居中 | 极简顶 | ❌ 文章 | 阅读沉浸 |
| Medium | 黑 | 单栏居中 | 极简顶 | ❌ 长文 | 写作表达 |
| Quora | 红棕 | 三栏 | 左侧垂直 | ❌ 问答 | 知识社区 |

---

## 三、SPA 实现方案 — swup

### 3.1 swup（用户指定）

swup 是一个轻量级 SPA 导航库，核心原理是：
**拦截 `<a>` 点击 → fetch 目标页面 HTML → 替换 `<main>` 容器内容 → 保留 `<head>` / `<nav>` 等非容器区域**。

**与 Turbo / barba 的差异：**
| 维度 | swup | Turbo (Hotwire) | barba.js |
|------|------|-----------------|----------|
| 体积 | ~3KB gzipped | ~10KB | ~15KB |
| 数据源 | 直接 fetch HTML | 直接 fetch HTML | 直接 fetch HTML |
| 服务器要求 | 纯静态即可 | 纯静态即可 | 纯静态即可 |
| CSS 输出格式 | 无需自定义 | 无需自定义 | 无需自定义 |
| 插件生态 | 丰富（preload / forms / scroll 等） | 丰富 | 丰富 |

**关键优点：不需要生成自定义 JSON 输出格式，不需要 Hugo `outputFormats` 改动**。

**接入方式：**
```bash
npm init          # 初始化 package.json
npm install swup
```
Hugo 通过 `js.Build` 从 `node_modules/swup` 打包进主题。

**初始化代码（assets/js/spa/swup-loader.js）：**
```js
import Swup from 'swup';
import SwupPreloadPlugin from '@swup/preload-plugin';
import SwupScrollPlugin from '@swup/scroll-plugin';
import SwupAnimatePlugin from '@swup/animate-plugin';

const swup = new Swup({
  containers: ['#main-content'],   // ← baseof.html 中用 id="main-content" 标记主容器
  plugins: [
    new SwupPreloadPlugin(),       // 鼠标悬停 <a> 时预加载
    new SwupScrollPlugin(),        // 切换后自动还原滚动位置
    new SwupAnimatePlugin({        // 页面切换过渡动画
      animationSelector: '[class*="transition-"]',
    }),
  ],
  skipPopStateHandling: () => false,
});
```

**baseof.html 中标记主容器：**
```html
<body>
  {{ partial "nav.html" . }}    <!-- swup 不替换这部分 -->
  <main id="main-content">      <!-- swup 只替换这里 -->
    {{ block "main" . }}{{ end }}
  </main>
  {{ partial "footer.html" . }} <!-- swup 不替换这部分 -->
</body>
```

**核心职责：**
- 拦截 `<a href>` 默认行为 → fetch 新页面 HTML
- 替换 `#main-content` 内部内容，保留顶栏/侧栏/页脚
- 更新 `<title>` 和 `<meta>` 标签
- 处理前进后退按钮（popstate）
- 鼠标悬停预加载、滚动位置保持、切换动画

### 3.2 备选方案（降级链）

如果 swup 在某些场景下不满足需求，可依次降级：

| 优先级 | 方案 | 说明 |
|--------|------|------|
| 1 | **swup（首选）** | 用户指定，最轻量，无需 Hugo 配置改动 |
| 2 | **Turbo (Hotwire)** | kopi 主题验证过，成熟稳定 |
| 3 | **自己实现 fetch + history API** | ~3KB，可控性最强 |

---

## 四、技术架构总览

### 4.1 构建工具链

| 工具 | 用途 | 方案 |
|------|------|------|
| **Hugo Pipes** | CSS 构建、minify、fingerprint | `css.Build` + `resources.Get` |
| **Hugo Pipes** | JS 构建、minify、打包 | `js.Build` + `resources.Get` |
| **npm + node_modules** | swup 等前端依赖 | `npm install` → Hugo `js.Build` 打包 |
| **Chroma** | 代码语法高亮 | Hugo 内建 |
| **KaTeX** | 数学公式（构建时渲染） | 可选，Void 方案 |

### 4.2 CSS 架构（模块化）

```
assets/css/
├── main.css              ← 入口：@import 所有组件
│
├── base/                 ← 核心框架（风格无关）
│   ├── reset.css         # CSS reset / normalize
│   ├── variables.css     # CSS Custom Properties 骨架
│   ├── typography.css    # 基础排版（由字体参数控制）
│   ├── layout.css        # Flex/Grid 布局基座
│   └── accessible.css    # 无障碍（focus/aria）
│
├── features/             ← 功能模块（风格无关，可按需加载）
│   ├── darkmode.css      # 暗黑模式覆盖变量
│   ├── responsive.css    # 响应式断点
│   ├── syntax.css        # Chroma 语法高亮
│   ├── toc.css           # 目录
│   ├── shortcodes.css    # 短代码样式
│   ├── print.css         # 打印友好
│   └── code-copy.css     # 代码块复制按钮
│
└── styles/               ← 风格层（五选一）
    ├── _base-style.css   # 风格变量定义骨架
    ├── xhs.css           # 小红书：--brand、grid-cols=5、card-radius
    ├── zhihu.css         # 知乎
    ├── wechat.css        # 公众号
    ├── medium.css        # Medium
    └── quora.css         # Quora
```

**CSS 加载顺序（由 hugo 参数控制）：**
```
reset → variables → typography → layout
  → features/*  (根据 features 参数条件加载)
  → styles/xhs.css (根据 style 参数加载)
  → darkmode.css  (如开启)
```

### 4.3 JS 架构（模块化）

```
assets/js/
├── main.js               ← 入口：动态 import 各模块
│
├── core/                 ← 核心
│   ├── dom-utils.js      # 轻量 DOM 操作封装
│   ├── event-bus.js      # 事件总线（模块间解耦）
│   └── init.js           # 初始化逻辑
│
├── features/             ← 功能模块
│   ├── darkmode.js       # 暗黑模式切换
│   ├── search.js         # 站内搜索
│   ├── toc.js            # 目录滚动高亮
│   ├── code-copy.js      # 代码块复制
│   ├── font-switch.js    # 字体切换（开发预览用）
│   └── smooth-scroll.js  # 平滑滚动
│
├── style-behaviors/      ← 风格交互
│   ├── xhs.js            # 瀑布流收藏点击
│   ├── zhihu.js          # 回答展开/收起
│   ├── wechat.js         # 目录锚点
│   ├── medium.js         # clap 动画 / 目录高亮
│   └── quora.js          # 关注、问题折叠
│
└── spa/                  ← 运行时基础设施（改变加载模式，非可插拔功能）
    └── swup-loader.js    # swup 初始化 + 插件配置（从 node_modules/swup 打包）
```

> **分层规则**：`spa/` 和 `core/` 是运行时底层，`features/` 是可插拔功能，
> 依赖方向为 `spa → core → features`，即 features 假设运行时已就绪，互不依赖。

**JS 加载：**
```go
{{ $spa := site.Params.features.spa | default true }}
{{ if $spa }}
  {{ with resources.Get "js/spa/swup-loader.js" | js.Build (dict "minify" hugo.IsProduction) }}
    <script src="{{ .RelPermalink }}" defer></script>
  {{ end }}
{{ end }}
```

### 4.4 Hugo 模板结构

> **设计原则：**
> - 直接在 `layouts/` 根目录放模板文件，**不使用** `_default/` 子目录
> - 五个核心模板：`baseof.html`（骨架）、`home.html`（首页）、`page.html`（文章页）、`taxonomy.html`（分类列表页，如 `/tags/`）、`term.html`（标签详情页，如 `/tags/blue/`）
> - `single.html` / `list.html` 仅作为 Hugo 默认 fallback，尽量不使用

```
layouts/
├── baseof.html           ← 统一骨架（所有风格共用），swup 替换范围 <main id="main-content">
├── home.html             ← 首页路由：根据 style 参数 include 对应 home-{style}.html 子模板
├── page.html             ← 文章详情页：根据 style 参数 include 对应 page-{style}.html 子模板
├── taxonomy.html         ← 分类/标签列表页（/tags/、/categories/）
├── term.html             ← 单个标签详情页（/tags/blue/）
├── 404.html              ← 404 页面
│
├── partials/             ← 可复用片段（按功能域分组）
│   ├── head/
│   │   ├── head.html     # <head> 整体
│   │   ├── css.html      # CSS 构建 + 加载（根据 style 参数拼接风格层）
│   │   ├── js.html       # JS 构建 + 加载
│   │   └── meta.html     # OpenGraph / Schema.org / SEO
│   │
│   ├── nav/              ← 五种风格的导航栏
│   │   ├── nav-xhs.html
│   │   ├── nav-zhihu.html
│   │   ├── nav-wechat.html
│   │   ├── nav-medium.html
│   │   └── nav-quora.html
│   │
│   ├── features/         ← 可开关的功能片段
│   │   ├── toc.html
│   │   ├── dark-toggle.html
│   │   ├── search.html
│   │   ├── comments.html
│   │   └── social.html
│   │
│   └── shared/           ← 跨风格共享组件
│       ├── author.html   # 作者卡片
│       └── post-card.html # 文章卡片（用于列表页）
│
├── home/                 ← 五种风格的首页主体（由 home.html 路由 include）
│   ├── home-xhs.html
│   ├── home-zhihu.html
│   ├── home-wechat.html
│   ├── home-medium.html
│   └── home-quora.html
│
├── page/                 ← 五种风格的文章页主体（由 page.html 路由 include）
│   ├── page-xhs.html
│   ├── page-zhihu.html
│   ├── page-wechat.html
│   ├── page-medium.html
│   └── page-quora.html
│
└── _markup/              ← Hugo render hooks（Markdown 渲染拦截）
    ├── render-image.html     # 响应式图片 srcset
    └── render-codeblock.html # 代码块增强（复制按钮 / 语言标签）
```

**首页路由示例（layouts/home.html）：**
```go
{{ define "main" }}
  {{ $style := site.Params.style | default "xhs" }}
  {{ partial (printf "home/home-%s.html" $style) . }}
{{ end }}
```

**文章页路由示例（layouts/page.html）：**
```go
{{ define "main" }}
  {{ $style := site.Params.style | default "xhs" }}
  {{ partial (printf "page/page-%s.html" $style) . }}
{{ end }}
```

---

## 五、hugo.toml 参数设计

详见 `hugo.example.toml`（同目录），核心参数分组：

| 分组 | 参数 | 说明 |
|------|------|------|
| `[params]` | `style` | 风格选择：`xhs` / `zhihu` / `wechat` / `medium` / `quora` |
| `[params.fonts]` | `title`, `body`, `nav`, `code` | 字体族配置 |
| `[params.features]` | `darkMode`, `spa`, `search`, `toc`, `readingTime` ... | 功能开关 |
| `[params.nav.main]` | `name`, `pageRef`, `weight` | **动态导航**：用户任意增减条目，模板自动渲染 |
| `[params.social]` | `github`, `twitter`, `email` ... | 社交链接 |
| `[params.meta]` | `description`, `keywords`, `author` | SEO |

### 导航菜单动态加载机制

**设计原则：导航条目完全由 `hugo.toml` 参数驱动，模板不硬编码任何导航项。**

用户在 `hugo.toml` 中写几个 `[[params.nav.main]]` 数组项，主题就渲染几个按钮。
**默认启用 3 项：首页 / 文章 / 关于**。
**可选 3 项：合集 / 推荐 / 项目**（在配置文件中注释掉，用户取消注释即可启用）。

> ⚠️ 注意：这些导航指向的是 `content/` 下的一级**目录**（Section），
> 例如 `pageRef = "/projects"` 对应 `content/projects/`，不是 Hugo Taxonomy。
> 主题内不注册任何自定义 taxonomy，仅保留 Hugo 默认的 categories 和 tags。

模板渲染伪代码：
```go
{{ range site.Params.nav.main | default slice }}
  {{ $link := .pageRef }}
  {{ $label := .name }}
  {{ partial "nav/nav-item.html" (dict "link" $link "label" $label "ctx" .) }}
{{ end }}
```

各风格的导航片段（`partials/nav/nav-{style}.html`）内部调用这段循环代码，
顶栏渲染为水平按钮组、侧边栏渲染为垂直列表，条目来源完全相同。

### Front Matter 日期字段规范

主题支持**双日期字段**，用于更精细的时间线展示：

| 字段名 | 类型 | 含义 | Hugo 内置对应 | 模板读值 |
|--------|------|------|--------------|---------|
| `date` | 日期 | Hugo 标准日期（fallback）| `.Date` | `.Date` |
| `created` | 日期 | **撰写日期**：这篇文章被写下来的时间 | 无 | `.Params.created \| default .Date` |
| `published` | 日期 | **发表日期**：公开发布的时间（可晚于 created）| 无 | `.Params.published \| default .Date` |
| `updated` | 日期 | 最后修改时间（可选）| 无 | `.Params.updated` |

> **命名选择说明：** 撰写日期使用 `created` 而非 `wrote`，
> 因为 `created` 语义更通用（不仅局限于"写作"动作，图片、笔记、项目条目都有"创建"时间），
> 且与 Hugo 生态（如 `gitinfo.AuthorDate` 首次提交）更自然对应。

**archetypes/default.md front matter 示例：**
```yaml
---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
created: {{ .Date }}
published: {{ .Date }}
updated: ""
date: {{ .Date }}
draft: true
tags: []
categories: []
---
```

---

## 六、实现顺序

### Phase 0：基础设施（先搭骨架）

| 序号 | 任务 | 产物 |
|------|------|------|
| 0.1 | 搭建 Hugo 主题目录 | `layouts/`, `assets/`, `archetypes/`, `hugo.toml` |
| 0.2 | 写 `baseof.html` 骨架 | 所有风格共用的 HTML 骨架 |
| 0.3 | CSS reset + variables + typography | 基础样式层 |
| 0.4 | JS core 层 | dom-utils, event-bus, init |

### Phase 1：风格系统（核心抽象）

| 序号 | 任务 | 产物 |
|------|------|------|
| 1.1 | 实现 5 个风格的 CSS 变量文件 | `styles/*.css` |
| 1.2 | 实现风格路由（模板条件判断） | 根据 `style` 参数加载对应 partials |
| 1.3 | 写第一个完整风格：小红书 | `home-xhs.html` + `page-xhs.html` + `nav-xhs.html` |
| 1.4 | 验证风格隔离：切换参数 → 风格完全改变但功能不变 | 手动切换测试 |

### Phase 2：SPA（swup 集成）

| 序号 | 任务 | 产物 |
|------|------|------|
| 2.1 | `npm init && npm install swup @swup/preload-plugin @swup/scroll-plugin` | package.json + node_modules |
| 2.2 | 写 `assets/js/spa/swup-loader.js` | SPA 初始化 + 插件配置 |
| 2.3 | `baseof.html` 中标记 `<main id="main-content">` 容器 | swup 替换范围确认 |
| 2.4 | 测试：无刷新导航 + 后退按钮 + 预加载 + 滚动还原 | 浏览器 devtools Network 面板验证 |

> swup 方案优势：**无需 Hugo `outputFormats` 改动，无需 JSON 模板，无需 Hugo Modules import**。
> 比 loficode 的 JSON 输出方案少 2 个任务。

### Phase 3：功能模块（逐个实现）

按 `feature_6themes_summary.md` 高频特性排序：

| 序号 | 模块 | 对应 6themes 覆盖 |
|------|------|-----------------|
| 3.1 | 响应式布局 | 6/6 ✅ 已在 Phase 0 基础层 |
| 3.2 | 暗黑/亮色模式 | 4/6 |
| 3.3 | 颜色方案定制 | 4/6 |
| 3.4 | 语法高亮 + 代码块复制 | 3/6 + 2/6 |
| 3.5 | SEO / OpenGraph / Schema | 3/6 |
| 3.6 | 阅读时间 / 字数统计 | 3/6 |
| 3.7 | 字体定制（nav / body / title / code）| 3/6 |
| 3.8 | 目录 TOC（Medium / Quora 依赖） | 2/6 |
| 3.9 | 搜索（Pagefind 或本地索引）| 2/6 |
| 3.10 | 评论系统（可配置 Disqus / Utterances）| 3/6 |
| 3.11 | 数学公式 KaTeX | 2/6（知乎/Quora 依赖）|
| 3.12 | 短代码（callout / image / code-fold）| 4/6 |
| 3.13 | 无障碍 WCAG | 3/6 |
| 3.14 | 打印友好 | 1/6 |
| 3.15 | RSS 全文输出 | 3/6 |

### Phase 4：剩余 4 种风格

在 Phase 1 完成小红书后，依次实现：

| 顺序 | 风格 | 关键差异点 |
|------|------|-----------|
| 4.1 | Medium | 衬线字体、单栏居中、sticky TOC |
| 4.2 | 知乎 | 问答列表、热榜侧栏、数学公式 |
| 4.3 | Quora | 三栏布局、Space 社区 |
| 4.4 | 公众号 | 极简导航、最大宽度 677px、沉浸式阅读 |

### Phase 5：打磨与验证

| 序号 | 任务 |
|------|------|
| 5.1 | 五种风格互相切换测试，确认隔离完整 |
| 5.2 | 响应式断点测试（1440 / 1024 / 768 / 375） |
| 5.3 | Lighthouse 性能测试，目标 < 50KB CSS + < 30KB JS gzipped |
| 5.4 | 无障碍检查（axe-core）|
| 5.5 | 每种风格在浏览器中截图验证 |

---

## 七、风险与决策记录

| 项 | 决策 | 理由 | 风险 |
|----|------|------|------|
| CSS 框架 | **纯原生 CSS + Custom Properties** | Void 主题方案，Hugo Pipes 原生支持 | 学习成本低，但需自行维护变量一致性 |
| JS 框架 | **ESM + 原生 import / dynamic import** | loficode 方案，Hugo js.Build 支持 | 无构建工具（Vite/rollup），tree-shaking 有限 |
| SPA | **swup 优先，Turbo 备选** | 用户指定，轻量 3KB，纯 HTML fetch | swup 插件版本兼容性需验证 |
| 搜索 | **Pagefind（可选集成）** | hugo-foxx 用过 | 需额外 npx pagefind 步骤 |
| 评论 | **disqus / utterances / mastodon** | hugo-foxx 的 Fediverse 方案 + Void 的 Disqus | 每风格默认值不同 |
| 数学 | **KaTeX 构建时渲染** | Void 方案，无需客户端 JS | Hugo KaTeX partial 需引入 |
| 字体 | **自托管，不依赖 Google Fonts** | Void 方案，GDPR 合规 | 需准备字体文件 |

---

## 八、目录结构（最终）

```
drhugo_theme/
├── hugo.toml                        ← 主题主配置
├── archetypes/
│   └── default.md            ← 含 created（撰写）+ published（发表）双日期字段
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── base/ (reset, variables, typography, layout, accessible)
│   │   ├── features/ (darkmode, responsive, syntax, toc, shortcodes, print, code-copy)
│   │   └── styles/ (xhs.css, zhihu.css, wechat.css, medium.css, quora.css)
│   └── js/
│       ├── main.js
│       ├── core/ (dom-utils, event-bus, init)
│       ├── features/ (darkmode, search, toc, code-copy, smooth-scroll)
│       ├── style-behaviors/ (xhs, zhihu, wechat, medium, quora)
│       └── spa/ (swup-loader)
├── layouts/
│   ├── baseof.html
│   ├── home.html              # 首页路由（include home-{style}.html）
│   ├── page.html              # 文章页路由（include page-{style}.html）
│   ├── taxonomy.html          # 分类/标签列表页
│   ├── term.html              # 单个标签详情页
│   ├── 404.html
│   ├── partials/
│   │   ├── head/ (head, css, js, meta)
│   │   ├── nav/ (nav-xhs, nav-zhihu, nav-wechat, nav-medium, nav-quora)
│   │   ├── features/ (toc, dark-toggle, search, comments, social)
│   │   └── shared/ (author, post-card)
│   ├── home/ (home-xhs, home-zhihu, home-wechat, home-medium, home-quora)
│   ├── page/ (page-xhs, page-zhihu, page-wechat, page-medium, page-quora)
│   └── _markup/ (render-image.html, render-codeblock.html)
├── data/
│   └── styles.yaml                  ← 五种风格元数据表
├── static/
│   ├── favicon.ico
│   └── fonts/                       ← 自托管字体
└── LICENSE / README
```

---

## 九、预估工作量

| Phase | 任务数 | 预估 |
|-------|--------|------|
| Phase 0 基础设施 | 4 | 0.5 天 |
| Phase 1 风格系统 + 小红书 | 4 | 1.5 天 |
| Phase 2 SPA (swup) | 4 | 1 天 |
| Phase 3 功能模块（15项） | 15 | 3 天 |
| Phase 4 剩余 4 风格 | 4 | 2 天 |
| Phase 5 打磨 | 5 | 1 天 |
| **合计** | **36** | **~9 天** |