> 🕒 **时间记录**：2026-11-18 生成（Phase 0–3 已完成，Phase 4/5 待续）

# HugMedia 主题 · 实施落地记录（research.implement.md）

> 本文系 `research.md` 的**实施阶段落地对照**：逐一按 research 的方案设计，说明每一步最终如何落成代码。
> `research.md` 保持不动；凡与实际代码有出入处，本文给出"落地差异"说明。
> 状态：**Phase 0–3 已完成、Phase 4（其余 4 风格）主体文件已就绪但未接线**，详见对应小节。

---

## 〇、方案与落地的总体差异（先读这段）

research 与实施存在以下**关键调整**，下文的每节都围绕这些差异展开：

| # | research 设计 | 实际落地 | 原因 |
|---|--------------|----------|------|
| 1 | 风格主体放 `layouts/home/`、`layouts/page/`，用 `define`+`template`+`templates.Exists` 分发 | 移入 `_partials/home/`、`_partials/page/`，改用 `partial (printf "home/home-%s.html")` 分发 | 见「HW 一」；`templates.Exists` 在 v0.168 下行为不稳，partial 分发更稳、且符合"模板可复用片段放 _partials"的目录规范 |
| 2 | 导航用自定义 `[params.nav]`（旧）→ research 已改 `[[menu.main]]` | 落地采用 `[[menu.main]]` + `identifier`，渲染时按 `resources.Get icons/{style}/{identifier}.svg` 动态取图标 | research 前言已声明采用原生 menu；图标按风格/标识动态注入为实施新增 |
| 3 | 日期字段双日期（date + created + publishDate） | 完全落地：`published` 作为 `publishDate` 别名，模板统一读 `.PublishDate` | 与 research front matter 规范一致 |
| 4 | 语言仅 zh-hans / en | 落地扩展为 **5 语（zh-hans / en / ja / ko / vi）**，且语言切换按钮支持 `shortLabel`（自定义字段放 `params` 子表） | 属 research「可扩展更多语言」的实践落地 |
| 5 | 风格 CSS 五套全部启用 | `styles/` 下 5 套文件齐备，但 `home.html`/`page.html` 用 `$implemented := ["xhs"]` 白名单，**只有 xhs 接线**，其余回退 xhs | 与 research「Phase 4 逐个加入」的迭代规划一致，属阶段性状态 |
| 6 | KaTeX「构建时渲染」可选 | 落地为**客户端渲染 + 本地打包**（`vendor/katex-build.js` + `css.Build`），并本地化字体 | 消除 unpkg CDN 跨境延迟（见 HW 2.4） |
| 7 | 搜索 Pagefind「可选集成」 | 落地为已集成（exampleSite/pagefind.yml + `npx pagefind`），含双轨高亮 | research 已有 Pagefind 方案，实施补齐 |

---

## 一、整体架构

### 1.1 架构总览落地

research 的纵向链路（hugo.toml → layouts → assets）完整落地：

```
hugo.toml ──site.Params──▶  layouts/*.html ──Hugo Pipes──▶  assets/  (css + js)
   │                              │
   └── [params.style]  "xhs"      └── baseof.html / home.html / page.html / section/taxonomy/term.html
```

落地文件：`HugMedia/hugo.toml`（主题主配置）、`layouts/baseof.html`、`home.html`、`section.html`、`taxonomy.html`、`term.html`。

> research 里规划了 `_partials/shared/author.html` 与 `post-card.html`、`layouts/404.html`。实施中：
> - 作者卡片信息通过 `[params.author]` 在 `home-xhs`/`page-xhs` 内直读，未单拆 `shared/author.html`。
> - 404 未显式模板（遵循 Hugo 默认 404 处理），`_partials/shared/` 当前存在 `figure.html`（图片自适应 shortcode 的共享渲染）。

### 1.2 隔离原则落地

| 维度 | research 配置 | 落地实现 |
|------|--------------|----------|
| 风格 × 功能 | 每风格独立 CSS；功能写 base 层 | `assets/css/base/`（reset/variables/typography）+ `styles/{style}.css` 风格层 + `features/*.css` 功能层，三者分离 |
| CSS 隔离 | Custom Properties + `.style-xhs` 前缀 | `body class="style-{{ site.Params.style }}"` + 各 `styles/*.css` 定义 `--brand` 等变量；`styles/_base-style.css` 提供变量骨架 |
| JS 隔离 | 每特性一文件 + 初始化函数 | `assets/js/features/*.js`（darkmode/toc/search/lang-switch/code-copy/smooth-scroll/index.js）+ `core/`（dom-utils/event-bus/init） |
| 模板隔离 | `partialCached` + `eq .Site.Params.style` | `home.html` 经 `partial (printf "home/home-%s.html")` 分发，未实现风格回退 xhs |
| 构建隔离 | `css.Build` + `js.Build` 按需打包 | `head/css.html` 只加载当前风格 + 按 features 开关条件加载 `features/*.css`；`js` 按需 `js.Build` |

---

## 二、五种风格设计特征

research 的五风格设计表（品牌色/背景/字体/布局/导航等）在 `assets/css/styles/` 下已有对应文件：
`styles/xhs.css`、`zhihu.css`、`wechat.css`、`medium.css`、`quora.css`（均存在，定义各自 `--brand` 与布局变量）。

**已接线**：
- **小红书 xhs**：`_partials/home/home-xhs.html` + `_partials/page/page-xhs.html` + `_partials/nav/nav-xhs.html` + `_partials/sidebar-xhs.html`，对应瀑布流卡片、`[params.styleOptions.xhs]`（gridColumns=5、cardRatio=3/4、showCategoryBar）。
- CSS `styles/xhs.css` 同步落地（brand #FB3252、grid-cols=5 等）。

**未接线（research Phase 4 规划）**：
- zhihu / wechat / medium / quora 的 `home-*.html`、`page-*.html`、`nav-*.html` 尚未建立 partial（仅留有 CSS 变量文件与 `[params.styleOptions.*]` 配置）。切换 `style` 时由于 `$implemented` 白名单会**回退到 xhs** 渲染，不是报错。

> ❗ 落地差异：research 因响应式/风格差异在五种风格对比一览表描述了各自的布局；实施只完成了 xhs 一个风格的实际模板，其余为"配置 + CSS 预置、模板待建"。这与 research 第六节 Phase 4「剩余 4 种风格在 Phase 1 之后逐个实现」的迭代节奏一致。

---

## 三、SPA 实现（swup）

### 3.1 swup 落地

- 依赖：`package.json` 含 `swup@^4.10.0`、`@swup/preload-plugin@^3.2.12`、`@swup/scroll-plugin@^4.0.0`。
- 入口 `assets/js/spa/swup-loader.js`：`import Swup from 'swup'` + 预载/滚动插件；`containers: ['#main-content']`。
- `baseof.html`：`<main id="main-content" class="swup-transition-fade">`，`<header>`/`<footer>` 在容器外（swup 不替换）。
- `swup-loader.js` 保留 research 未写的**动画与无障碍增强**：`animationSelector` 尊重 `prefers-reduced-motion`；`ignore: ['[data-no-swup]', '.lang-switch__item']` 让语言切换走整页导航（因切换改变整页语言态）。
- 内容替换后广播 `theme:content-replaced` 事件，供后续 features（TOC/代码复制/搜索高亮）重挂载。

### 3.2 备选方案（降级链）

落地未实现 Turbo / 自实现 fetch 分支；swup 为首选且已工作。降级链记录保留，不实落。

---

## 四、技术架构落地

### 4.1 构建工具链

| research | 落地 |
|---------|------|
| Hugo `css.Build`+`js.Build` | `head/css.html` 与 `head/js.html` 使用 `resources.Get ... | css.Build / js.Build`，生产打包 minify + fingerprint |
| npm + node_modules（swup 等） | `package.json` dependencies：swup / preload / scroll / katex / mermaid；devDependencies：pagefind |
| Chroma 语法高亮 | `[markup.highlight] style="monokai"`，渲染`_markup/render-codeblock.html` |
| KaTeX | `vendor/katex-build.js`（`import katex from 'katex/dist/katex.mjs'` + auto-render），`features/katex.html` 用 `resources.Get ... | js.Build`；CSS 经 `css.Build` 本地化 |

> `package.json` 的 `scripts` 落地为：
> - `build`: `cd exampleSite && hugo --minify && npx pagefind`
> - `dev`: `cd exampleSite && hugo server --disableFastRender`
> - `search`: `cd exampleSite && npx pagefind`

### 4.2 CSS 架构落地

research 的目录规划与实施**几乎一致**，仅将 `main.css` 作为入口 + 各文件独立存在（未用 `@import`，直接在 `head/css.html` 分块加载，见差异）：

```
assets/css/
├── main.css                 # base 层（无 @import，由 head/css.html 加载）
├── base/{reset,variables,typography}.css
├── components/{footer,header,nav}.css    # 新增：布局组件层
├── features/{accessible,darkmode,lang-switch,print,responsive,search,shortcodes,syntax,toc}.css
└── styles/{_base-style,xhs,zhihu,wechat,medium,quora}.css
```

> 差异：research 有 `base/layout.css`、`base/grid.css`（在较早版里散落）等、`features/code-copy.css`；落地把布局并入 `components/*` 与各风格 `styles/*.css`。
> 加载顺序（`head/css.html`）：`main.css`（base 层）→ 当前 `styles/{style}.css` → 按 `[params.features]` 开关条件加载 `features/*.css`（含始终加载的 responsive/shortcodes）。

### 4.3 JS 架构落地

```
assets/js/
├── main.js                 # 入口
├── core/{dom-utils,event-bus,init}.js
├── features/{darkmode,index,lang-switch,search,toc,code-copy,smooth-scroll}.js
├── spa/swup-loader.js
└── vendor/{katex-build,mermaid-build}.js    # 新增：KaTeX/Mermaid 本地打包入口
```

> 差异：research 规划的 `style-behaviors/{xhs,zhihu,wechat,medium,quora}.js` 落地未建（对应 4 风格模板未接线的同步状态）；新增 `features/lang-switch.js`（语言切换交互）与 `vendor/*-build.js`（本地化第三方库打包）。

### 4.4 Hugo 模板结构落地

research 的 `layouts/` 规划与实施对照：

| research | 落地 |
|---------|------|
| 根级 `baseof/home/page/taxonomy/term/404` | ✅ 根级齐备（404 未建），加 `section.html` |
| `_partials/head/{head,css,js,meta}` | ✅ 齐备；`css.html`/`js.html`/`meta.html` + `link.html` |
| `_partials/nav/nav-{5}style` | 仅 `nav-xhs.html` |
| `_partials/features/{toc,dark-toggle,search,comments,social}` | ✅ `features/` 下：toc/dark-toggle/comments/social/flag/lang-switch/katex/mermaid/reading |
| `_partials/shared/{author,post-card}` | 仅 `shared/figure.html`（author/post-card 未单拆） |
| `layouts/home/`、`layouts/page/` 风格主体 | → `_partials/home/`、`_partials/page/`，仅 xhs |
| `_markup/render-image,render-codeblock` | ✅ `render-codeblock.html`（render-image 未建，图片走 `image`/`figure` shortcode） |

**home.html 落地路由（重点差异）**——用 partial 而非 define+template：
```go
{{- $implemented := slice "xhs" }}
{{- $style := site.Params.style | default "xhs" }}
{{- if not (in $implemented $style) }}{{ $style = "xhs" }}{{ end }}
{{- partial (printf "home/home-%s.html" $style) . }}
```

> ❗ 落地差异详解：research 强调不用 `partial (printf "home/home-…")` 的理由是"会去 `_partials/` 下找文件，与 `layouts/home/` 冲突"——而实施**恰恰是把风格主体放在 `_partials/home/`、`_partials/page/`**（符合 v0.168「模板片段归 _partials/」目录规范），因此 partial 分发成为自然且正确的方式。`define`+`template`+`templates.Exists` 分支未采用。

---

## 五、hugo.toml 参数落地

research 第五节参数全部落地于 `HugMedia/hugo.toml`：

### `[params]`
```toml
style = "xhs"   # xhs | zhihu | wechat | medium | quora
```

### `[params.fonts]` = title / body / nav / code
落地为**拉丁优先的多脚本统一字体栈**（见文件内长注释）：拉丁字体在前 → zh-Hans/Hant → ja → ko → 通用族，一套变量覆盖中英日韩混排；未按语言拆分 `title_ja/body_ja` 等（注释标注为进阶用法）。

### `[params.features]`（开关落地）
darkMode / spa / search / toc / readingTime / syntaxHighlight / codeCopy / math / mermaid / comments / socialLinks / i18n / printFriendly / accessible（均 true）、analytics（false）。

### `[params.meta]`、`[params.author]`、`[params.social]`、`[params.comments]`
均落地（meta author 字段；social 含国内外平台；comments provider="disqus"）。

### `[params.styleOptions.*]`
xhs（gridColumns/cardRatio/showCategoryBar）、zhihu（showHotList/answerCollaps）、medium（stickyToc/maxContentWidth）、quora（showRightRail）、wechat（maxContentWidth/showAuthorBar）——均为对应风格预留，同 II 节接线状态。

### `[params.dark]` = defaultMode "auto"

### 菜单：`[[menu.main]]`（原生动态导航，research 前言已修正选用）
落地为顶层 `[[menu.main]]`，条目含 `identifier / name / pageRef / weight`。渲染在 `_partials/nav/nav-xhs.html` 与 `sidebar-xhs.html` 中遍历 `site.Menus.main`。新增三条可选条目（合集/推荐/项目）默认注释，取消注释即启用。

**图标动态加载（实施新增）**：侧栏 `sidebar-xhs.html` 按当前风格 + 菜单 `identifier` 读取：
```go
{{- $icon := resources.Get (printf "icons/%s/%s.svg" $style .Identifier) }}
{{- with $icon }}<span class="menu-ico" aria-hidden="true">{{ .Content | safeHTML }}</span>{{- end }}
```
`assets/icons/{style}/` 按 identifier 命名（home/posts/about/recommends/projects）；`assets/icons/openicons/` 为候选开源图标库（tabler/lucide/bootstrap/heroicons/feather），挑选后复制进各风格目录。当前 xhs 用 **Tabler** 图标。

### Front Matter 日期字段落地
research 表格（date/created/publishDate/updated）对应 archetype `archetypes/default.md`：
```yaml
---
date: {{ .Date }}
created: {{ .Date }}
published: {{ .Date }}   # 作为 publishDate 别名
draft: true
---
```
模板读发布用 `.PublishDate`；不自定义 `.Params.published`（会被内核消费，恒为空）。

---

## 六、多语言内容落地（zh-hans 主 / en 辅，扩展为五语）

### 配置与内容
- `[languages]` 落地 5 种：zh-hans / en / ja / ko / vi，各自 `contentDir`（`content/{lang}/`）+ `title` + `label` + `weight`。
- `defaultContentLanguage = "zh-hans"`。
- 内容树（`exampleSite/content/{lang}/`）：`_index.md`（首页）、`posts/`、`projects/`、`about.md`、`categories/` 等；5 语言同构，对译文本（《岳阳楼记》《血字的研究》等）。
- 翻译自动配对靠相对路径一致；`lang-target.html`（`_partials/pages/`）为语言切换器解析目标链接。

### 语言切换器（flags + shortLabel 为实施增强）
- `partials/features/lang-switch.html`：遍历 `hugo.Sites`（支持任意多语言），当前语言为触发按钮、其余为下拉项；只换 `#main-content` 的链接加 `data-no-swup`/`.lang-switch__item` 跳过 SPA。
- 国旗图标用 emoji（`flag.html`）。
- **shortLabel（实施新增）**：语言对象自定义字段**必须放 `[languages.xx.params]`**，模板 `site.Language.Params.shortLabel | default $label` 读取；因触发按钮在紧凑顶栏可能折行，用简称（中 / En / 日 / 韩 / 越）+ `white-space:nowrap` 保底，下拉显示全称 `label`。

### 模板侧能力
`site.IsMultiLingual` / `.IsTranslated` / `.Translations` 用法与 research 一致；RSS 按语言生成 `index.xml`。

### 与主题风格关系
`[params.style]` 全局；「按语言覆盖 style」的写法（把 `style` 移入各 `[languages.xx]`）在 research 已说明，落地未启用（保持全局）。

---

## 七、实现顺序落地状态

| Phase | research 规划 | 实施进度 | 说明 |
|-------|--------------|---------|------|
| Phase 0 基础设施 | 0.1–0.4 目录/骨架/base/JS core | ✅ 完成 | 目录、baseof、base CSS、core JS 均已建 |
| Phase 1 风格系统 + 小红书 | 1.1–1.4 五风格变量 + 路由 + xhs + 隔离验证 | ✅ 完成（xhs 全接线）| 五风格 CSS 变量文件就绪；路由 partial 分发；xhs 模板/导航/侧栏齐全 |
| Phase 2 SPA (swup) | 2.1–2.4 依赖/loader/容器/测试 | ✅ 完成 | swup v4 + preload/scroll 插件，`#main-content` 容器，无障碍动画 |
| Phase 3 功能模块（3.1–3.15）| 响应式/暗黑/配色/高亮+复制/SEO/阅读/字体/TOC/搜索/评论/KaTeX/短代码/无障碍/打印/RSS | ✅ 主体完成 | 落地 15 项；KaTeX/Mermaid 本地化打包为实施增强 |
| Phase 4 其余 4 风格 | 4.1–4.4 Medium/知乎/Quora/公众号 | ⚠️ 仅 CSS+配置预置 | `home-{style}`/`page-{style}`/`nav-{style}` 模板未接线，切换回退 xhs |
| Phase 5 打磨验证 | 5.1–5.5 切换/断点/Lighthouse/无障碍/截图 | ⏳ 待做 | 尚未系统执行 |

---

## 八、目录结构落地（最终）

```
HugMedia/
├── hugo.toml / README.md / package.json / package-lock.json
├── archetypes/default.md            # date + created + published 双日期
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── base/{reset,variables,typography}.css
│   │   ├── components/{footer,header,nav}.css
│   │   ├── features/{accessible,darkmode,lang-switch,print,responsive,search,shortcodes,syntax,toc}.css
│   │   └── styles/{_base-style,xhs,zhihu,wechat,medium,quora}.css
│   ├── js/
│   │   ├── main.js
│   │   ├── core/{dom-utils,event-bus,init}.js
│   │   ├── features/{darkmode,index,lang-switch,search,toc,code-copy,smooth-scroll}.js
│   │   ├── spa/swup-loader.js
│   │   └── vendor/{katex-build,mermaid-build}.js
│   └── icons/
│       ├── {style}/   # 当前 xhs：home/posts/about/recommends/projects.svg + 附录候选库
│       └── openicons/ # 候选库：tabler/lucide/bootstrap/heroicons/feather + _preview.html
└── layouts/
    ├── baseof.html / home.html / page.html / section.html / taxonomy.html / term.html
    ├── home.rss.xml / section.rss.xml / taxonomy.rss.xml / term.rss.xml
    ├── _partials/
    │   ├── head/{head,css,js,meta,link}.html
    │   ├── nav/nav-xhs.html
    │   ├── home/home-xhs.html / page/page-xhs.html / sidebar-xhs.html
    │   ├── features/{katex,mermaid,toc,dark-toggle,comments,social,flag,lang-switch,reading}.html
    │   ├── pages/lang-target.html / shared/figure.html
    │   ├── header.html / footer.html / head.html / terms.html
    │   ├── features-enabled.html / features-config.html / is-menu-current.html
    ├── _shortcodes/{audio,bilibili,callout,code-fold,figure,image,video}.html
    └── _markup/render-codeblock.html
│
└── exampleSite/                    # 独立演示站点（theme=HugMedia，5 语言内容）
    ├── hugo.toml / pagefind.yml / archetypes/
    ├── content/{zh-hans,en,ja,ko,vi}/{_index,about,posts,projects,categories}...
    └── public/                     # 构建产物（hugo 默认输出）
```

> 差异说明：
> - research 规划的 `data/styles.yaml`（风格元数据表）落地**未建**——风格信息直接来自各 `styles/*.css` 变量与 `[params.styleOptions.*]` 配置，避免重复维护。
> - `static/fonts` 未启用（字体走系统字体栈 / 自托管可后续加）；`static/` 无自定义 favicon（用 Hugo 默认）。
> - `_markup/render-image.html` 未建（图片由 image/figure shortcode 处理）。
> - 新增 `components/` CSS 层、`icons/` 体系、`vendor/` 打包入口、`pages/`（lang-target）等 research 未列目录。

---

## 九、工作量对照

| Phase | research 预估 | 实施状态 |
|-------|--------------|----------|
| Phase 0 基础设施 | 0.5 天 | ✅ |
| Phase 1 风格 + 小红书 | 1.5 天 | ✅ |
| Phase 2 SPA | 1 天 | ✅ |
| Phase 3 功能模块 | 3 天 | ✅（主体完成）|
| Phase 4 其余 4 风格 | 2 天 | ⚠️ 未接线（CSS/配置已备）|
| Phase 5 打磨 | 1 天 | ⏳ 待做 |
| 合计 | ~9 天 | 主线约完成 6.5 天量；剩 Phase 4 + Phase 5 ≈ 3 天 |

---

## 十、风险与决策记录（实施对照）

| research 决策 | 实施落地 | 备注 |
|--------------|----------|------|
| CSS 纯原生 + Custom Properties | ✅ `styles/*.css` + `:root`/`--var` | — |
| JS ESM + 原生 import | ✅ `type:"module"`，js.Build 打包 | — |
| SPA swup 优先、Turbo 备选 | ✅ swup v4 唯一实现 | 插件版本已由 package-lock 锁定 |
| 搜索 Pagefind | ✅ `exampleSite/pagefind.yml` + `npx pagefind` | 双轨高亮（模糊 mark + 严格 match）已实现 |
| 评论 disqus/utterances/mastodon | ✅ provider="disqus" 占位 | 可切换 |
| 数学 KaTeX「构建时渲染」可选 | ⚠️ 改为客户端渲染，但**本地打包**（`vendor/katex-build.js` + 本地字体） | 消除 unpkg CDN 跨境延迟，见 4.1 |
| 字体自托管不依赖 Google Fonts | ✅ 系统字体栈（未引 Google Fonts）；自托管字体预留 static/fonts | GDPR 合规达成 |