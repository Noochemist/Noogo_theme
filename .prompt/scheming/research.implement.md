> 🕒 2026-11-18 生成（Phase 0–3 完成，4/5 待续）；2026-11-23 更新（文章页重构 + 锚点治理）；2026-11-24 精简并同步分享模块最终状态。

# HugMedia 主题 · 实施落地记录（research.implement.md）

> 本文是 `research.md` 的实施对照：逐一说明方案如何在代码中落地，与实际出入处以「差异」标注。`research.md` 保持不动。

## 〇、方案与落地的总体差异（先读这段）

| # | research 设计 | 实际落地 | 原因 |
|---|--------------|----------|------|
| 1 | `define`+`template`+`templates.Exists` 分发 | `partial (printf "home/home-%s.html")` 分发，主体放 `_partials/home/`、`_partials/page/` | `templates.Exists` 在 v0.168 下行为不稳；partial 分发更稳且合目录规范 |
| 2 | 导航 `[params.nav]` | `[[menu.main]]` + `identifier`，按风格/标识动态取图标 | research 已声明原生 menu；图标动态注入为实施新增 |
| 3 | 双日期字段 | `published` 作 `publishDate` 别名，统一读 `.PublishDate` | 一致 |
| 4 | 语言 zh-hans/en | 扩展为 **5 语**（+ ja/ko/vi），按钮支持 `shortLabel`（字段放 `params` 子表） | 「可扩展更多语言」的落地 |
| 5 | 五套风格 CSS 全启用 | 5 套 CSS 齐备，但模板仅 **xhs 接线**，其余回退 xhs | 与 Phase 4 迭代规划一致 |
| 6 | KaTeX「构建时渲染」可选 | **客户端渲染 + 本地打包**（`vendor/katex-build.js` + 本地字体） | 消除 unpkg CDN 跨境延迟 |
| 7 | Pagefind「可选集成」 | 已集成（`exampleSite/pagefind.yml` + `npx pagefind`），含双轨高亮 | 实施补齐 |

## 一、整体架构
```
hugo.toml ──site.Params──▶ layouts/*.html ──Hugo Pipes──▶ assets/ (css + js)
   │                            │
   └── [params.style] "xhs"     └── baseof / home / page / section / taxonomy / term
```
参与方：`HugMedia/hugo.toml`、`layouts/baseof/home/page/section/taxonomy/term.html`。

落地差异：
- `_partials/shared/author.html`、`_partials/shared/post-card.html` 未单拆——作者信息由 `[params.author]` 在风格 partial 内直读；卡片抽为 `cards/card-xhs.html`。
- 404 未显式建模板（用 Hugo 默认处理）。

隔离原则落地：

| 维度 | research | 落地 |
|------|----------|------|
| 风格 × 功能 | 风格独立 CSS、功能在 base | 三层分离：`css/base/` + `styles/{style}.css` + `features/*.css` |
| CSS | Custom Properties + 风格前缀 | `body class="style-{{ .Style }}"` + 各 `styles/*.css` 定义 `--brand` 等；`styles/_base-style.css` 提供变量骨架 |
| JS | 每特性一文件 + 初始化 | `assets/js/features/*.js` + `core/`（dom-utils/event-bus/init） |
| 模板 | `partialCached` + eq style | `home.html` 经 `partial …-{style}` 分发，未实现回退 xhs |
| 构建 | `css.Build` + `js.Build` 按需打包 | `head/css.html` 只加载当前风格 + 按 features 条件加载；js 按需 `js.Build` |

## 二、五种风格
`assets/css/styles/` 下已有 `xhs / zhihu / wechat / medium / quora` 五个文件（各定义 `--brand` 与布局变量）。

- **已接线（xhs）**：`_partials/{home/home-xhs,page/page-xhs,nav/nav-xhs,sidebar-xhs}.html` + `section/section-xhs.html`、`cards/card-xhs.html`；`[params.styleOptions.xhs]`（gridColumns=5、cardRatio=3/4、showCategoryBar）；`styles/xhs.css`（brand #FB3252）。
- **未接线（zhihu/wechat/medium/quora）**：仅 CSS 变量 + `[params.styleOptions.*]` 配置预置；因 `$implemented` 白名单，切换时**回退 xhs 渲染而非报错**。

## 三、SPA（swup v4）
- 依赖：swup@^4.10.0 + preload/scroll 插件；入口 `assets/js/spa/swup-loader.js`；`containers: ['#main-content']`。
- `baseof.html`：`<main id="main-content" class="swup-transition-fade">`，header/footer 在容器外（SPA 不重挂）。
- 增强：`animationSelector` 尊重 `prefers-reduced-motion`；`ignore: ['[data-no-swup]', '.lang-switch__item']`（语言切换走整页导航）；替换后广播 `theme:content-replaced` 供 features 重挂载。
- **2026-11-25 修复「图表/公式首次打开不显示、刷新才出」**：原 mermaid/katex 脚本位于 `page-xhs.html` 顶部，恰在 swup 容器 `#main-content` 内——swup 换页以 innerHTML 替换容器，内嵌 `<script>/<link>` 不执行，从首页 SPA 点击进入文章页时 vendor 库与初始化监听从未运行。修复：两 partial 迁移至 `head.html` 全站注入（`features.math/mermaid` 全局开关，katex 不再按页面 `math` 前件），首载 + `theme:content-replaced` 双路径渲染；详见编码规范 §4/§7.9。
- 备选（Turbo / 自实现 fetch）未实落，仅记录降级链。

## 四、技术架构落地

### 4.1 构建工具链
| research | 落地 |
|---------|------|
| Hugo `css.Build`+`js.Build` | `head/css.html` / `head/js.html` 使用，生产 minify + fingerprint |
| npm 依赖 | dependencies：swup/preload/scroll/katex/mermaid；devDependencies：pagefind |
| Chroma | `[markup.highlight] style="monokai"` + `_markup/render-codeblock.html` |
| KaTeX | `vendor/katex-build.js`（import katex.mjs + auto-render）+ 本地 CSS |
- `package.json` scripts：`build`= `cd exampleSite && hugo --minify && npx pagefind`；`dev`= `hugo server --disableFastRender`；`search`= `npx pagefind`。

### 4.2 CSS 架构
```
assets/css/
├── main.css                 # 入口（base 层，无 @import，由 head/css.html 分块加载）
├── base/{reset,variables,typography}.css
├── components/{footer,header,nav}.css        # 新增布局组件层
├── features/{accessible,darkmode,lang-switch,print,responsive,search,shortcodes,syntax,toc,infinite}.css
└── styles/{_base-style,xhs,zhihu,wechat,medium,quora}.css
```
差异：research 的 `base/layout.css`、`base/grid.css`、`features/code-copy.css` 归并入 components/与风格层；`features/infinite.css` 为实施新增。加载顺序：base → 当前风格 → 按 `[params.features]` 开关条件（responsive/shortcodes 始终加载）。

### 4.3 JS 架构
```
assets/js/
├── main.js                 # 入口
├── core/{dom-utils,event-bus,init}.js
├── features/{darkmode,index,lang-switch,search,toc,code-copy,smooth-scroll,infinite}.js
├── spa/swup-loader.js
└── vendor/{katex-build,mermaid-build}.js    # 本地打包入口（新增）
```
差异：research 的 `style-behaviors/*.js` 未建（对应 4 风格模板未接线）；新增 `features/lang-switch.js`、`features/infinite.js`。

### 4.4 模板结构
| research | 落地 |
|---------|------|
| 根级 baseof/home/page/taxonomy/term/404 | ✅（404 未建）+ 新增 `section.html` |
| `_partials/head/{head,css,js,meta}` | ✅ + `link.html` |
| `_partials/nav/nav-{5风格}` | 仅 `nav-xhs.html` |
| `_partials/features/*` | ✅ toc/dark-toggle/comments/social/flag/lang-switch/katex/mermaid/reading + **share** |
| `_partials/shared/{author,post-card}` | 仅 `shared/figure.html` |
| `layouts/home/`、`layouts/page/` | → `_partials/home/`、`_partials/page/`，仅 xhs；**空目录已删除** |
| `_markup/render-image,render-codeblock` | 仅 `render-codeblock.html`（图片走 image/figure shortcode） |

实施新增：`_partials/pagination.html`（功能层分页控件 + 哨兵）、`section/section-xhs.html`、`cards/card-xhs.html`。

**home.html 分发路由（关键差异）——partial 而非 define+template**：
```go
{{- $implemented := slice "xhs" }}
{{- $style := site.Params.style | default "xhs" }}
{{- if not (in $implemented $style) }}{{ $style = "xhs" }}{{ end }}
{{- partial (printf "home/home-%s.html" $style) . }}
```
research 曾担心 `partial (printf …)` 与 `layouts/home/` 冲突；实施把风格主体放 `_partials/`（合 v0.168 目录规范），partial 分发成为自然正确的方式。

## 五、hugo.toml 参数落地
- `[params] style = "xhs"`。
- `[params.fonts]`：拉丁优先的多脚本统一字体栈（拉丁→简→繁→日→韩→通用族），一套变量覆盖混排；未按语言拆分（注释标注为进阶用法）。
- `[params.features]`：darkMode/spa/search/toc/readingTime/syntaxHighlight/codeCopy/math/mermaid/comments/socialLinks/i18n/printFriendly/accessible/**infiniteScroll**（实施新增）均 true；**share**（实施新增）=true；analytics=false。
- `[pagination]`（实施新增）：`pagerSize=3`、`path='page'`（生成 `/page/2/`）。
- `[params.meta]`、`[params.author]`、`[params.social]`、`[params.comments]`（disqus）落地。
- `[params.styleOptions.*]`：xhs（gridColumns/cardRatio/showCategoryBar）、zhihu（showHotList/answerCollaps）、medium（stickyToc/maxContentWidth）、quora（showRightRail）、wechat（maxContentWidth/showAuthorBar）——预置。
- `[params.dark] defaultMode="auto"`；`[params.share].platforms`（见十三）。
- 菜单：顶层 `[[menu.main]]`（identifier/name/pageRef/weight），`nav-xhs.html` 与 `sidebar-xhs.html` 遍历 `site.Menus.main`；新增合集/推荐/项目可选条目默认注释。
- **图标动态加载**：两级回退——先取 `resources.Get (printf "icons/%s/%s.svg" $style .Identifier)`（风格专属），缺失回退 `resources.Get (printf "icons/nav/%s.svg" .Identifier)`（通用图标），均缺失静默跳过。`assets/icons/nav/` 按 identifier 命名通用图标（home/posts/about/collects/projects/recommends/coding），`nav/{style}/` 存风格专属（为空时自动回退通用）；`openicons/` 为候选库；当前 xhs 用 Tabler。
- Front matter（archetypes/default.md）：`date / created / published / draft`；模板读发布用 `.PublishDate`，不自定义 `.Params.published`（会被内核消费）。

## 六、多语言
- 5 语各自 `[languages.xx]`（contentDir/title/label/weight）；`defaultContentLanguage="zh-hans"`；内容树 `_index/posts/projects/about/categories` 同构对译；翻译配对靠相对路径一致。
- `_partials/pages/lang-target.html` 供切换器解析目标链接。
- 切换器（`features/lang-switch.html`）：遍历 `hugo.Sites`，当前语言为触发钮、其余为下拉项；只换 `#main-content` 链接，加 `data-no-swup`/`.lang-switch__item` 跳过 SPA；国旗用 emoji。
- **shortLabel**：自定义字段放 `[languages.xx.params]`，`site.Language.Params.shortLabel | default $label`；触发钮用简称 + `white-space:nowrap` 保底，下拉显示全称。
- 按语言覆盖 style 的写法未启用（保持全局 `[params.style]`）。

## 七、实现进度

| Phase | 内容 | 状态 | 说明 |
|-------|------|------|------|
| 0 基础设施 | 目录/骨架/base CSS/core JS | ✅ | — |
| 1 风格 + 小红书 | 五风格变量 + 路由 + xhs | ✅ | 模板/导航/侧栏齐全 |
| 2 SPA | swup + 插件 | ✅ | — |
| 3 功能模块（3.1–3.15）| 响应式/暗黑/配色/高亮+复制/SEO/阅读/字体/TOC/搜索/评论/KaTeX/短代码/无障碍/打印/RSS | ✅ 主体 | KaTeX/Mermaid 本地打包为增强 |
| 3.16 分页 + 无限滚动 | Pagination + Infinite Scroll | ✅ | 见十一 |
| 分享模块 | share feature | ✅ | 见十三 |
| 4 其余 4 风格 | Medium/知乎/Quora/公众号 | ⚠️ 仅 CSS+配置预置 | 切换回退 xhs |
| 5 打磨验证 | 切换/断点/Lighthouse/无障碍/截图 | ⏳ 待做 | — |

## 八、目录结构（最终）
```
HugMedia/
├── hugo.toml / README.md / package.json
├── archetypes/default.md
├── assets/
│   ├── css/      main.css + base/{reset,variables,typography}
│   │             + components/{footer,header,nav}
│   │             + features/{accessible,darkmode,lang-switch,print,responsive,search,shortcodes,syntax,toc,infinite}
│   │             + styles/{_base-style,xhs,zhihu,wechat,medium,quora}
│   ├── js/       main.js + core/{dom-utils,event-bus,init}
│   │             + features/{darkmode,index,lang-switch,search,toc,code-copy,smooth-scroll,infinite}
│   │             + spa/swup-loader.js + vendor/{katex-build,mermaid-build}
│   └── icons/    {style}/（identifier 命名）+ features/ + socials/ + openicons/（候选库）
└── layouts/
    ├── baseof / home / page / section / taxonomy / term .html
    ├── home/section/taxonomy/term .rss.xml
    ├── _partials/   head/{head,css,js,meta,link}
    │                nav/nav-xhs · home/home-xhs · section/section-xhs · page/{page,sidebar}-xhs
    │                cards/card-xhs · pagination
    │                features/{katex,mermaid,toc,dark-toggle,comments,social,flag,lang-switch,reading,share}
    │                pages/lang-target · shared/figure · header/footer/terms
    │                features-enabled/features-config/is-menu-current
    ├── _shortcodes/ {audio,bilibili,callout,code-fold,figure,image,video}
    └── _markup/     render-codeblock.html
exampleSite/                     # 独立演示站（theme=HugMedia，5 语内容）
```
差异：`data/styles.yaml` 未建（风格信息来自 `styles/*.css` 变量与 `[params.styleOptions.*]`）；`static/fonts` 未启用（系统字体栈）；`render-image.html` 未建；新增 `components/`、`icons/`、`vendor/`、`pages/`、`cards/`、`pagination/`、`features/infinite.{js,css}`、`features/share.*`。

## 九、工作量对照
| Phase | 预估 | 状态 |
|-------|------|------|
| 0 基础设施 / 1 风格+xhs / 2 SPA | 0.5/1.5/1 天 | ✅ |
| 3 功能模块 | 3 天 | ✅ 主体 |
| 3.16 分页+无限滚动、分享 | — | ✅ |
| 4 其余 4 风格 | 2 天 | ⚠️ 未接线 |
| 5 打磨 | 1 天 | ⏳ |
| 合计 | ~9 天 | 主线约 6.5 天；剩 ≈3 天 |

## 十、风险与决策记录
| research 决策 | 落地 |
|--------------|------|
| CSS 纯原生 + Custom Properties | ✅ `styles/*.css` + `:root/--var` |
| JS ESM | ✅ `type:"module"` + js.Build |
| swup 优先、Turbo 备选 | ✅ swup v4 唯一实现 |
| Pagefind | ✅ yml + shell，双轨高亮 |
| 评论 disqus/utterances/mastodon | ✅ provider="disqus" |
| KaTeX「构建时渲染」可选 | ⚠️ 客户端渲染但本地打包 |
| 字体不依赖 Google Fonts | ✅ 系统字体栈；自托管预留 |
| 分页（research 未规划）| ✅ 静态分页 + 双向无限滚动渐进增强 |
| 列表加载 | ✅ 服务端分页 + 客户端就近追加/前插，**非** fetch JSON |

## 十一、分页 + 双向无限滚动（实施新增）
> research 未规划列表分页；为列表类页面（home/section/taxonomy/term）提供「加载下一页 / 回拉上一页 / 页码直达」。

- **分层**：根级模板算 `$pager := .Paginate` 传 `(dict "page" . "pager" $pager)`；`_partials/pagination.html` 只输出通用钩子（`.infinite-pagination` + `data-current/total/page-urls/prev/next/status-*`），**无风格选择器**；风格层渲染色卡网格 `data-infinite-grid` + 放置分页控件；`features/infinite.js` 由 `features/index.js` 动态 import，实例挂 `win.infiniteScroll`，swup 换页先 destroy 再 init。
- **向下**：滚动到尾部继续上滑注入「空白区」+ 提示；上滑超视口高 **3/10**（`PULL_THRESHOLD_FRACTION`，2026-11-23 由 2/5 调低）且松手（touchEnd）才 commit 加载下一页；末页提示「到底啦」。
- **向上**：顶部哨兵 `[data-infinite-sentinel-top]` + IntersectionObserver 在顶部约 260px 区间预取上一页，新卡片插哨兵之后、以追加前首卡为锚点补偿滚动偏移（阅读不跳变）；哨兵离开后重新上膛防连发。
- **页码直达**：`data-infinite-jump` 表单按 `data-page-urls`（「页码→URL」映射）跳转；同源 `<a>` 交 swup；`history.replaceState` 同步地址栏（不产生新历史）。
- **并发锁**：`state.loading` 一次一页在途；`nextFinished/prevFinished` 标记端点。
- **手势防跳治理**（Mac 触控板抖动根因，细节见编码规范 §7.1）：回弹期全量吸纳滚轮、惯性尾窗 400ms 内权重 0.5、反向软回退、单次位移上限 150px、根级 `overscroll-behavior-y:none`、阈值 3/10 + touchEnd 回落、回落时长自适应（160ms+0.35ms/px，上限 420ms）。

## 十二、2026-11-23 迭代：文章页布局 · 标签栏 · 窄屏抽屉 · 锚点滚动
- **文章页布局**：目录固定左栏（CSS Grid `'toc content' / 'toc comments'`，`minmax(0,13rem)+minmax(0,1fr)`），目录 sticky；评论移正文底部；无目录时 `:not(:has(.xhs-toc))` 塌陷左列防留白。
- **左栏新增标签栏**：共用 partial `page-sidebar-xhs.html` 输出「目录 + 文章标签」两节，`{{- if or $toc $tags }}` 整体兜底；`.xhs-page-tags` 与首页标签阵列共用一条样式。
- **窄屏收纳**：article 内新增 `<aside id="xhs-sidenav" class="xhs-sidenav xhs-sidenav-page">`，渲染同一份 `page-sidebar-xhs.html`；复用既有抽屉契约（aria-controls/body.nav-drawer-open），topbar.js 零改动；桌面 `.xhs-sidenav-page{display:none}`，≤768px 左栏 `.xhs-toc{display:none}` 退回单列、抽屉接管。
- **锚点偏移**：根因——smoothscroll 未启用时走原生 hash 跳转，无导航偏移。修复：① CSS `main [id]{scroll-margin-top:calc(var(--navbar-height,3.25rem)+1rem)}`（主修复，scrolIntoView 与 reduced-motion 同样生效）；② JS `smooth-scroll.js` 修正 rem 被当 px 的 bug（按根字号换算 + 1rem 呼吸）。

## 十三、2026-11-24 最终态：分享模块（share feature）
- **需求**：文章页顶栏分享按钮 → 卡片「分享到」+ 配置的平台按钮（跳对应分享端点）+ 「更多」（系统分享）；与 `[params.social]`（站点所有者账号入口）解耦，独立 `[params.share].platforms`。
- **平台**：默认启用 weibo/qq/x/reddit/mastodon/facebook/telegram/linkedin/whatsapp（移除无公开分享端点的小红书/知乎/微信）；端点 URL 模板集中 `SHARE_URLS` 单表。
- **结构**：
  - `_partials/features/share.html`：按钮 + 卡片骨架，遍历 platforms 渲染（图标复用 `icons/socials/{key}.svg`，缺失回退文字）；i18n 键 `share/shareTo/shareNative/shareNativeUnsupported/share_<key>`。
  - `assets/js/features/share.js`：一次性绑定 + 全局刷新；`refresh()` 用当前 `location.href`（剥离 query/hash）+ `document.title` 运行时重填；切 `body.has-article`；`alignCard()` 窄屏把卡片位置 clamp 进视口（见编码规范 §7.8）；「更多」**常驻可见**，点击优先 `navigator.share`，不支持（http 非安全上下文等）降级复制并提示 `shareNativeUnsupported`；监听 `theme:content-replaced` 重刷 + 收起。
  - `assets/css/features/share.css`：触发按钮复用 view-toggle 视觉；`body:not(.has-article) .share-wrap{display:none}` 连盒隐藏。
  - `features/index.js`：`loadModule`/`MODULE_KEYS` 加 share、`initOnce` 挂载（header 常驻，init 一次）。
  - `nav-xhs.html`：分享按钮与视图按钮并存渲染，JS 按 `body.has-article` 互斥显隐。
  - 主题 `hugo.toml`：`[params.features].share=true` + `[params.share]`。
- **关键决策**：互斥显隐靠 `body.has-article`（文章页判定 `#main-content [data-pagefind-body]`，不绑风格）；链接运行时生成（header 常驻不能写死）；partial/JS/CSS 均为功能层，五风格共用；图标为手写描边 SVG（网络受限未下载品牌图标，linkedin/whatsapp 等已补齐）。
- **已验证**：`hugo --gc` 构建通过（五语 200+ 页）；产物含 `data-share-toggle`/`data-pagefind-body`，`data-features` 含 share；css/JS bundle 含端点字符串。

## 十四、2026-11-24 补充：favicon 与 OG 完善
- **favicon**：`assets/images/favicon.png` 经 Hugo Pipes `resources.Get` 渲染 `rel=icon` + `apple-touch-icon`（`_partials/head.html` 顶部）。
- **OG 完善**（`head/meta.html`）：新增 `og:locale`（含逐语言 `og:locale:alternate`，BCP47 转 OG 下划线格式）、`article:published_time/modified_time`、`og:updated_time`、`article:section`、`og:image:alt`；`twitter:card` 有图 `summary_large_image`、无图 `summary`，可配 `twitter:site/creator`；分享图三级兜底：bundle `og.*` > `params.meta.ogImage` > `assets/images/favicon.png`（原配置默认值指向不存在的 `/images/og-default.png`，已改为注释示例）；JSON-LD 补 `dateModified/mainEntityOfPage/articleSection/image/publisher.logo`，日期改 ISO 8601。
- **验证**：`hugo --gc --minify` 通过（五语 447 页）；首页与文章页均实测输出 `og:locale(+alternate)`、`article:*`、完整 JSON-LD。

## 十五、2026-11-25 迭代：首页分页「短页回拉上一页」修复
- **现象**：页码直达 / 上滑等操作下，section 页回拉上一页正常，但**桌面端首页**回拉失效（上滑加载下一页正常，且上滑期间之前分页会连带加载）；移动端首页正常。怀疑与触控板滚轮有关。
- **根因**：首页模板与 section 页结构完全一致，差异仅在分页数据源（首页 `site.RegularPages` vs section `.Pages`）与每页条数——首页每页仅 3 张卡，桌面宽屏**列表不足一屏**（短页）。短页下 `scrollRange = 0`、`atTail()` 恒真，顶部哨兵 / `prevArmed` 自动触发 / 非尾部分支全部失效，回拉上一页只能靠显式手势兜底。
- **为何此前修复未覆盖首页**：section 页修复（2026-11-23 §7.1）在 wheel 尾部分支只处理「正向拉下一页 / 反向软回退空白区」，缺失「反向 + 顶部触发区 + 无空白区」的 `requestPrev` 兜底，与 touch 尾部分支（已有该逻辑）不对齐。移动端触屏走 touch 分支所以正常，桌面触控板走 wheel 分支所以失效。
- **修复**（`features/infinite.js` `onWheel` 尾部分支）：补 `delta < 0 && window.scrollY <= TOP_TRIGGER_ZONE && overscroll <= 0` → `requestPrev()` 并 return，与 touch 尾部逻辑完全对齐。`overscroll <= 0` 保证有空白区时仍走软回退收起互不干扰；`requestPrev` 的方向互斥冷窗保证「上滑加载下一页」期间不连带触发上一页。
- **覆盖场景**：直达分页页 / SPA 导航进入 / 页码跳转三种进入方式（`onWheel` 与挂载来源无关，一律生效）；section 页无回归。
- 本轮经验已沉淀进编码规范 §7.11。