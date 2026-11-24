# Hugo Media 主题编码规范（Coding Conventions）

> 汇总自 2026-11-16 起历次编码沉淀的规范，及 Hugo v0.168 目录适配。供后续编码参考。

## 0. 协作与交互
- 敏感命令前先播 `say 'hello'` 提示音（规则见 `.trae/rules/project_rules.md`）；完成任务前播 `say 'good'`。
- 阶段编码一次只做当前阶段，不越界；交流默认中文（代码与术语用英文）。

## 1. 项目结构
```
drhugo_theme/          # 仓库根，容纳多个 Hugo 主题
├── HugMedia/          # 当前主题（顶层 layouts / assets / hugo.toml）
│   └── exampleSite/   # 演示站点（符号链接引用主题，构建无需 -t，见项目规则 §6）
└── .prompt/           # 设计 / scheming / 编码流程文档
```

## 2. Hugo 目录规范（v0.168）

### 2.1 layouts/ 顶层结构
```
layouts/
├── _markup/       # render hooks（render-codeblock.html）
├── _partials/     # 可复用 partial
├── _shortcodes/   # 自定义 shortcode
├── baseof.html
├── home.html      # 首页
├── page.html      # = 旧 single.html
├── section.html   # = 旧 list.html
├── taxonomy.html / term.html   # 取代旧 terms/term 组
└── home/section/taxonomy/term.rss.xml   # root 级 RSS
```
- **不用** `_default/single.html`、`_default/list.html`、`_default/rss.xml`。
- shortcode 命名：描述性短名（`audio`、`callout`…），不加 `layout_` 之类前缀。

### 2.2 风格分发（多社交风格）
- 根级模板经 `partial (printf "%s/%s-%s.html" $kind $kind $style)` 分发到 `_partials/home/home-xhs.html` 等。
- 未实现风格显式回退：根级声明 `$implemented := slice "xhs"`，不在清单一律回退 `xhs`（Hugo 找不到模板直接报错，无静默回退）。
- 子组件同理：`_partials/nav/nav-{style}.html`、`cards/card-{style}.html`、`section/section-{style}.html`。
- taxonomy/term 复用 section 结构 + 统一 `.Paginate .Pages`，保持分页体验一致。

### 2.3 RSS（root 级）
- home/section/taxonomy/term 各自独立 `*.rss.xml`，接收 Page 对象（`.RegularPages` 取下辖页面）；`[outputs]` 需声明 `"RSS"`，`[services.rss] limit` 控条数。
- `_partials/terms.html` 是**可复用 partial**（渲染某页所属术语清单），不是 `_default/terms.html` 布局（后者已废弃）。

### 2.4 Front matter
- `published:` 是 `publishDate` 别名，模板统一读 `.PublishDate`（勿用 `.Published`）；archetype 已含 `date/created/published/draft`。

## 3. 内容与多语言（五语）
- 语言：zh-hans / en / ja / ko / vi；`content/{lang}/` 各设 `contentDir`，同构对译。
- Front matter 必含 `title/date/published/tags/categories`。
- 语言切换按钮放右上角：图标 + 简短标签 `shortLabel`。
  - **自定义语言字段必须放 `[languages.xx.params]`**：点语法访问 `site.Language.shortLabel` 会报错 `can't evaluate field …`；须用 `site.Language.Params.shortLabel` 读。
  - 两级回退：触发按钮 `Params.shortLabel | default label`，下拉固定显示 label 全称。
  - 触发按钮 `white-space:nowrap; flex-shrink:0` 防折行；≤600px 仅隐藏触发钮 label，下拉项文字始终可见。

### 3.1 导航图标（通用 + 风格专属两层回退）
- `assets/icons/nav/` 存**所有风格通用**图标，文件名 = 菜单项 `identifier`（home/posts/about/coding/…）。
- 风格专属图标存 `assets/icons/nav/{style}/`（如 `nav/xhs/`）；**两级回退**：先取 `icons/nav/{style}/{identifier}.svg`，缺失回退 `icons/nav/{identifier}.svg`，均缺失静默跳过。
  ```go
  $icon := resources.Get (printf "icons/nav/%s/%s.svg" $style .Identifier)
  {{- if not $icon }}{{ $icon = resources.Get (printf "icons/nav/%s.svg" .Identifier) }}{{ end }}
  ```
- 统一 Tabler 描边图标（`stroke="currentColor"`）；`openicons/` 为候选库（tabler/lucide/bootstrap/heroicons/feather），选中后复制进 `nav/`（通用）或 `nav/{style}/`（专属）。
- 内联尺寸由 CSS `.menu-ico svg { width/height:1.15em }` 覆盖源 SVG。

### 3.2 功能级共享图标
- 跨风格 feature 图标存 `assets/icons/features/`（如 sun/moon），用 `resources.Get` 渲染，缺失静默跳过。
- 样式参照 `lang-switch.css` 的 `.lang-switch__trigger`：用统一令牌（`--input-height`/`--color-line`/`--radius-md`/`--color-surface`），hover 边框转 `--color-brand`；不用浏览器默认按钮外观。
- 亮/暗双图标按 `html[data-theme='dark']` 显隐切换。

## 4. 主题特性（features）
- 无障碍：`baseof.html` 顶部 `skip-link` 跳主内容。
- 暗黑：功能启用/配置由 `partialCached features-enabled.html` / `features-config.html` 输出到 `<html data-features/data-config>`。
- SPA（swup v4）：`#main-content` 容器 + 过渡动画；换页后广播 `theme:content-replaced`，动态模块据此重挂。
- 公式/图表：KaTeX（`math:true` 触发）、Mermaid（shortcode/partial）。
- 搜索（Pagefind 1.6.0）：`exampleSite/pagefind.yml` 限定 `**/{posts,projects}/*/index.html`，只索引文章目录、结果按文章去重；`search` 开关或 `npm run build` 串联。
- 高亮（双轨）：① Pagefind `excerpt` 自带 `<mark>` 不可抹除；② 自定义 TreeWalker 对完整匹配词加 `search-ui__m-exact`。正文高亮用软底描边防干扰。
- 跨页关键词：搜索结果链接带 `?kw=` → 文章页 `highlightFromUrl` 对 `data-pagefind-body` 高亮；挂载于首载 + `theme:content-replaced`，重跑前 `clearPageHighlights` 清残留。
- 分页 / 双向无限滚动：
  - 根级算 `$pager := .Paginate`，以 `(dict "page" . "pager" $pager)` 传风格 partial；风格层只消费页集，不再算分页。
  - 功能层 `_partials/pagination.html` 只输出通用钩子（`.infinite-pagination` + `data-*`）；JS/CSS 只消费通用类，**不得写风格类名**；各风格外观用 `[data-infinite-pagination]` 实现。
  - 渐进增强：无 JS / SEO 时原生链接可点；页码跳转由 JS 增强（非前端 fetch JSON）。
  - `features/infinite.js` 由 `features/index.js` 按 `data-features` 含 `infinitescroll` 动态 import；**swup 换页必须先 `destroy()` 再 `init()`**。网格容器 `data-infinite-grid`，卡片复用 `cards/card-{style}.html`。
  - 配置：`[pagination] pagerSize / path`，`[params.features].infiniteScroll`。

## 5. HTML/JS/CSS 约定
- HTML partial 顶部 `{{- /* 中文说明 */}}` 注释。
- CSS 按特性拆 `assets/css/features/*.css`，经 Hugo 管道合并指纹。
- 样式路由 `body class="style-{{ site.Params.style }}"`；功能开关 `data-features` 与 JS 端 feature 检测保持一致。

## 6. 内容示例（示例站点）
- 覆盖全部特性（公式/Mermaid/图片/音频/视频/代码高亮/阅读计时）。
- 文学片段：《岳阳楼记》《血字的研究》多语对译；`projects/` 用于差异测试。

## 7. 坑点与可复用解法
### 7.1 触控板上滑反复跳动（infinite.js）
高频小步进 + 惯性长尾与原生橡皮筋拉锯所致。组合治理：
1. 回弹动画期全量吸纳滚轮（计入动画目标，不打断）；
2. 惯性尾段窗口（`WHEEL_TAIL_MS≈400ms`）内正向滚轮按 `≈0.5` 权重打折计入，防空白区被瞬间弹起；
3. 反向 delta 软回退而非硬收；
4. 单次滚轮位移上限（`≈150px`），只拦极端惯性加速；
5. 根级 `overscroll-behavior-y:none` 消除橡皮筋；左栏导航 `contain`；
6. 触发阈值用视口高度 3/10（由 2/5 调整）且**touchEnd 才回落**；
7. 回落时长随位移自适应（基础 160ms + 0.35ms/px，上限约 420ms）。

### 7.2 SPA 与动态实例协作
- 换页先 `destroy()` 旧实例再 `init()`，防监听器/观察器叠加；DOM 依赖操作等 `theme:content-replaced` 再执行。

### 7.3 语言对象自定义字段放 params（详见 §3）
- `langs.Language` 点语法访问自定义字段报错；用 `[languages.xx.params]` + `site.Language.Params.shortLabel | default label` 读取。

### 7.4 Hugo 环境与安全（v0.168+）
- 符号链接引用主题时，主题跨目录资源需在站点 `hugo.toml` `[security] node.permissions.allowread` 放行（如 `'../node_modules'`），否则 `js.Build` 报 not allowed。

### 7.5 锚点跳转偏移（scroll-margin-top 一劳永逸）
- 首选 CSS：`main [id] { scroll-margin-top: calc(var(--navbar-height,3.25rem) + 1rem) }`，原生 hash / `scrollIntoView` 均遵守。
- JS 手动滚动忌 rem 陷阱：`parseFloat('3.25rem')` 得 3.25 却被当 px；须按单位换算（`endsWith('rem')` 时乘根字号，默认 16）。
- CSS 与 JS 数值保持一致（导航高 + 1rem），两路径落点视觉统一。

### 7.6 汉堡抽屉契约复用
- 契约：`[data-nav-drawer-toggle]` → `aria-controls`（目标 id）→ `body.nav-drawer-open` → `.xhs-sidenav`；新抽屉复用即联动，JS 零新增。
- 桌面隐藏附加抽屉加独立类，窄屏被既有媒体块覆盖；多页同 id 互斥出现可行（顶栏按钮容器外常驻、swup 换页替换容器内内容）；TOC 候选高亮只绑首个 `.toc`（如需可枚举全部）。

### 7.7 共用 partial + 双条件渲染
- 复用内容抽一份 partial 两处调用（如文章页左栏与窄屏抽屉共用 `page-sidebar-xhs.html`），杜绝双份维护漂移。
- 可选段整体兜底 `{{- if or $toc $tags }}`，小节内再 `{{ with }}` 省略空项，避免空轨道/多余分隔线。

### 7.8 顶栏互斥显隐 + SPA 动态链接 + 分享卡对齐（分享模块范式）
- **互斥按钮共存于常驻 header**：JS 每次换页刷新 `body.has-article`，CSS 显隐切换；**勿用页级差异渲染**（SPA 下 header 不重挂）。文章页判定 `#main-content [data-pagefind-body]`（Pagefind 正文容器锚点），不绑风格类名。
- **隐藏要作用在包裹盒上**：flex 容器中子按钮 `display:none` 不占位，但外层包裹盒（inline-flex）仍是 flex item 留 gap；如 `body:not(.has-article) .share-wrap { display:none }`。
- **header 常驻 ⇒ 数据不能写死模板**：分享链接/标题与当前 URL 绑定，须 JS 运行时生成（`location.href` 去 query/hash + `document.title` 再 encodeURIComponent），swup 换页后重刷。
- **平台分享端点集中一张表**：各平台 URL 模板收敛在 `features/share.js` 的 `SHARE_URLS` 映射；新增平台就位三处——图标 `icons/socials/{key}.svg`、i18n 键 `share_<key>`、映射行，再于 `[params.share].platforms` 启用。
- **Web Share API 渐进增强**：「更多」按钮**常驻可见**，点击优先 `navigator.share`，不支持（如 http 非安全上下文）降级复制并提示 `shareNativeUnsupported`；CSS 提供 `[hidden]{display:none!important}` 防 flex 覆盖隐藏。
- **窄屏卡片完全显示靠 JS 测量 clamp**：卡片 `absolute` 定位的 containing block 是分享按钮（`.share-wrap`），写死 `left` 相对按钮而非屏幕——纯 CSS 无法同时约束左右不超屏；`open`/`resize` 时测量按钮与视口，把期望视口左坐标 clamp 进 `[8, vw-cardW-8]` 再折算成相对按钮的 left（宽屏清除内联定位，`right:0` 默认）。
- **两套社交配置**：`[params.social]`=站点所有者账号入口；`[params.share]`=把当前页转发给访客的公开端点。二者图标可复用 `socials/` 目录，但分享列表不得混入 blog/rss/email 等无公开分享端点的项。

### 7.9 favicon 与 OG 分享图（head/meta）
- **favicon 走 Hugo Pipes**：`assets/images/favicon.png` 经 `resources.Get` 输出 `rel=icon` / `apple-touch-icon`，不硬编码静态路径。
- **OG 图三级兜底**：页面 bundle `og.*`（`.Permalink`）> `params.meta.ogImage`（`absURL`）> `assets/images/favicon.png`；配置中的字符串 URL 须保证文件真实存在，否则分享图 404。
- **og:locale** 用 `LanguageCode | replaceRE "-" "_"`（BCP47 转 OG 下划线格式），`og:locale:alternate` 遍历 `site.Sites` 逐语言输出；`twitter:card` 有图 `summary_large_image`、无图降级 `summary`。
- **JSON-LD 日期一律 ISO 8601**（`2006-01-02T15:04:05Z07:00`），勿用 `2006-01-02`；Article 补 `dateModified / mainEntityOfPage / articleSection / image / publisher.logo`。