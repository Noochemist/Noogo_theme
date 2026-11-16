# Hugo Themes Features — Consolidated

> 将 6 个主题的 Features 合并整理，按功能类别分组，剔除重复表述。
> 标注每个特性在哪些主题中出现。

---

## 1. 响应式布局 (Responsive Design)

所有主题都宣称自己支持响应式。

| 主题 | 原文措辞 |
|------|---------|
| ananke | Responsive layouts and accessible markup |
| hugo-foxx | （未单独强调，但整体设计即支持） |
| kopi | （未单独强调） |
| loficode | 📱 Fully Responsive: Beautiful on all devices from mobile to desktop |
| terminal | fully responsive |
| void | 🎨 Tailwind CSS design · fully responsive |

**覆盖率：6/6（100%）**

---

## 2. 暗黑/亮色模式 (Dark/Light Mode)

| 主题 | 具体实现 |
|------|---------|
| hugo-foxx | personalized settings for colors |
| kopi | system-driven dark mode |
| loficode | 🌙 Automatic theme detection with manual toggle |
| void | 🌗 Dark/Light mode with animated icon toggle (no flash on load) |

**覆盖率：4/6**

---

## 3. 无障碍 (Accessibility / WCAG / ARIA)

| 主题 | 具体表述 |
|------|---------|
| ananke | Responsive layouts and **accessible markup** |
| hugo-foxx | prioritizes **accessibility** with WAI-ARIA attributes, BionRead mode, graceful degradation, compatible with Lynx/W3M |
| loficode | ♿ **Accessible**: WCAG compliant with proper ARIA labels |

**覆盖率：3/6**

---

## 4. SEO & 元数据

| 主题 | 具体表述 |
|------|---------|
| ananke | **SEO defaults** with Hugo internal templates; Robots.txt handling by environment |
| hugo-foxx | extMeta / socialCard (OpenGraph, Twitter Card, Schema.org, JsonLD) |
| loficode | **⚡ Performance**: Optimized for speed and **SEO** |
| void | （未单独强调 SEO，但有 social links 配置） |

**覆盖率：3/6**

---

## 5. 语法高亮 (Syntax Highlighting / Chroma)

| 主题 | 具体实现 |
|------|---------|
| terminal | duotone custom syntax highlighting based on **Chroma** |
| loficode | 🎨 Syntax Highlighting: Beautiful code blocks |
| void | 🧱 Code blocks with header (language label + copy button), class-based **Chroma** light/dark palettes |

**覆盖率：3/6**

---

## 6. 目录 (Table of Contents / TOC)

| 主题 | 具体实现 |
|------|---------|
| terminal | （README 配置中提到 Toc / TocTitle 参数，但未列入 Features） |
| loficode | 📖 **Table of Contents**: Auto-generated TOC for blog posts |
| void | 🧭 **Table of Contents**: folded `<details>` or sticky sidebar (>=1472px) with scroll-spy highlighting |

**覆盖率：2/6 明确列出，1/6 隐式支持**

---

## 7. 搜索 (Search)

| 主题 | 具体实现 |
|------|---------|
| hugo-foxx | optional **Pagefind** search integration |
| loficode | 🔍 **Live Search**: Real-time search functionality across all posts |

**覆盖率：2/6**

---

## 8. SPA / 快速页面导航

| 主题 | 具体实现 |
|------|---------|
| kopi | **Turbo-based page navigation** |
| loficode | 🚀 **SPA Navigation**: Smooth single-page app experience（通过自定义 JSON 输出格式预生成数据） |

**覆盖率：2/6**

---

## 9. 代码块增强

| 主题 | 具体实现 |
|------|---------|
| loficode | 🎨 ...with **copy functionality** |
| void | 🧱 Code blocks with **header (language label + copy button)** |

**覆盖率：2/6**

---

## 10. 阅读时间 / 字数统计

| 主题 | 具体表述 |
|------|---------|
| ananke | **Reading time/word count support** |
| loficode | ☕ Coffee Theme: **Reading time** displayed with coffee cups |
| void | 🏷️ Tags & categories **reading time** social links |

**覆盖率：3/6**

---

## 11. 字体定制

| 主题 | 具体实现 |
|------|---------|
| terminal | **Fira Code** as default monospaced font |
| hugo-foxx | personalized settings for colors and fonts, OpenDyslexic, Amiri, Inconsolata |
| void | 🔤 **Self-hosted fonts** (Source Serif 4 / Noto Serif SC / JetBrains Mono), nothing from Google Fonts |

**覆盖率：3/6**

---

## 12. 数学公式 (Math)

| 主题 | 具体实现 |
|------|---------|
| hugo-foxx | optional MathJax/Katex via passthrough delimiters |
| void | 🧮 **KaTeX math rendered at build time** (no client-side JS), CSS/fonts self-hosted |

**覆盖率：2/6**

---

## 13. 图表 (Diagrams)

| 主题 | 具体实现 |
|------|---------|
| kopi | **Mermaid diagram support** |

**覆盖率：1/6（独有特性）**

---

## 14. 社交链接 (Social Links)

| 主题 | 支持平台/方式 |
|------|-------------|
| ananke | Configurable social follow/share links |
| loficode | GitHub, Twitter/X, LinkedIn, Email, Mastodon, YouTube, Instagram, Facebook |
| void | GitHub, Twitter, Email（通过 [params.social] 配置） |

**覆盖率：3/6**

---

## 15. RSS 订阅

| 主题 | 具体表述 |
|------|---------|
| ananke | （Hugo 内建，未单独强调） |
| hugo-foxx | **RSS/reader-mode optimized**, subscribable section and terms-specific or site-wide over RSS, external feed embed over RSS |
| void | 📰 **Full-content RSS feed** (content:encoded) |

**覆盖率：3/6**

---

## 16. 多语言 / i18n

| 主题 | 具体表述 |
|------|---------|
| ananke | **Localized i18n strings** in many languages |
| hugo-foxx | capable of making **bilingual site** with multiple taxonomies |
| void | Per-post `language` front matter for correct `<html lang>` on mixed-language blogs; language-aware typography (CJK emphasis, auto section numbering) |
| terminal | showLanguageSelector 参数；languageName / languageCode 配置 |

**覆盖率：3/6 明确列出，1/6 隐式支持**

---

## 17. 评论系统

| 主题 | 具体实现 |
|------|---------|
| hugo-foxx | comments over **Fediverse (Mastodon & Bluesky)** |
| terminal | Comments partial（可自定义接入） |
| void | lazy-loaded **Disqus** with offline fallback |

**覆盖率：3/6**

---

## 18. 短代码 (Shortcodes)

| 主题 | 提供的 shortcode |
|------|-----------------|
| ananke | Optional **contact form shortcode** |
| terminal | **image**（图片对齐控制）、**code**（代码块折叠） |
| loficode | **coffee-break**（内容中插入"咖啡休息"提示框） |
| void | **callout**（info/tip/warning/danger/neutral 五种类型，支持折叠和数学公式） |

**覆盖率：4/6**

---

## 19. 图片优化

| 主题 | 具体实现 |
|------|---------|
| void | 🖼️ **Responsive WebP images** with srcset and intrinsic sizes via a render-image hook |
| hugo-foxx | （有 feature image 生成工具） |

**覆盖率：1/6 明确列出，1/6 隐式支持**

---

## 20. 自定义 Hugo 输出格式

| 主题 | 自定义格式 | 用途 |
|------|----------|------|
| kopi | **RADIO**（自定义 mediaType `application/radio+json`） | 播放站点/播客流的 RADIO WIDGET |
| loficode | **JSON** + **pages**（自定义） | SPA 预生成数据接口 `/index.json` + `/pages.json` |

**覆盖率：2/6（独有特性）**

---

## 21. 音效 / 多媒体

| 主题 | 具体实现 |
|------|---------|
| loficode | 🎵 **Ambient Sounds**: coffee shop / rain / fireplace，底部控制栏可开关调节音量 |
| kopi | **Radio Widget**（来自自定义 RADIO 输出格式） |

**覆盖率：2/6（独有特性）**

---

## 22. 颜色方案定制

| 主题 | 具体实现 |
|------|---------|
| terminal | fully customizable color schemes generated by **Terminal.css**（在线调色器） |
| hugo-foxx | adjust **accent/background/foreground/midtone** per light/dark mode |
| loficode | CSS custom properties override |
| void | semantic CSS tokens (`--canvas`, `--surface`, `--fg`, ...) + `@theme inline` Tailwind utilities |

**覆盖率：4/6**

---

## 23. 性能 / 轻量

| 主题 | 具体数据/表述 |
|------|-------------|
| hugo-foxx | **~25KiB gzipped** (JS + CSS 合计) |
| loficode | ⚡ **Optimized for speed** and SEO, Lazy loading images, Efficient JS with no heavy frameworks |
| void | Tailwind CSS-first, no extra build step needed (Hugo css.Build + js.Build) |

**覆盖率：3/6**

---

## 24. 404 页面

| 主题 | 具体表述 |
|------|---------|
| void | 📰 ...**404 page** |

**覆盖率：1/6 明确列出**

---

## 25. 其他特色功能

| 特性 | 主题 | 说明 |
|------|------|------|
| Hero/Header 可配置 | ananke | Configurable hero/header behaviour |
| Fediverse 验证 | hugo-foxx | Mastodon & Bluesky 评论 + Fediverse 集成 |
| BionRead 模式 | hugo-foxx | 阅读辅助功能（字母间距调节） |
| 打印友好 | hugo-foxx | printer-friendly 设计 |
| 两栏杂志布局 | kopi | two-column magazine layout |
| anchor 高亮 + 复制 permalink | void | 🔗 In-page anchor highlight and copy-permalink by clicking headings |
| 在线字体/设置预览 | void | hugo server 时 article 页面有 floating panel |
| CJK 着重号 | void | `<em>` 在中文页面渲染为底部圆点而非斜体 |
| 章节自动编号 | void | front matter 设置 `numbered = true` |
| 混合语言 `<html lang>` | void | Per-post `language` front matter |
| 离线 fallback | void | Disqus 加载失败时显示重试按钮 |
| 基于 Hugo Pipes/Modules | terminal | fully based on Hugo ecosystem |

---

## 总结

### 高频特性（≥3 个主题都有）

| 排名 | 特性 | 覆盖主题数 |
|------|------|-----------|
| 1 | **响应式布局** | 6/6 |
| 2 | **暗黑/亮色模式** | 4/6 |
| 3 | **颜色方案定制** | 4/6 |
| 4 | **短代码** | 4/6 |
| 5 | **SEO** | 3/6 |
| 6 | **语法高亮** | 3/6 |
| 7 | **阅读时间** | 3/6 |
| 8 | **字体定制** | 3/6 |
| 9 | **社交链接** | 3/6 |
| 10 | **RSS** | 3/6 |
| 11 | **多语言/i18n** | 3/6 |
| 12 | **评论系统** | 3/6 |
| 13 | **无障碍** | 3/6 |
| 14 | **性能/轻量** | 3/6 |

### 独有特性（仅 1 个主题有）

| 主题 | 独有特性 |
|------|---------|
| **hugo-foxx** | Fediverse 评论 (Mastodon/Bluesky)、BionRead 模式、打印友好、~25KiB gzipped 极致轻量 |
| **kopi** | Turbo 导航、Mermaid 图表、自定义 RADIO 输出格式 |
| **loficode** | SPA Navigation、环境音效 (coffee/rain/fireplace)、Coffee Reading Time |
| **void** | KaTeX 构建时渲染、自托管字体（无 Google Fonts）、anchor 高亮+复制 permalink、CJK 着重号、章节自动编号、混合语言 `<html lang>`、离线 fallback 评论、Tailwind v4 CSS-first config |
| **terminal** | Terminal.css 在线调色器、Fira Code 默认字体、duotone 语法高亮 |
| **ananke** | Contact form shortcode、Robots.txt 环境感知、Hero/Header 可配置 |