# Hugo Media 主题编码规范（Coding Conventions）

> 供本主题后续编码参考。汇总自 2026-11-16 起历次编码沉淀的规范，以及本次 Hugo 新版本（v0.168）目录规范适配。

## 0. 协作与交互规范

- **提示音通知**：凡是需要用户确认、或执行删除等敏感命令前，先执行 `say 'hello'` 播放提示音；`.trae/rules/project_rules.md` 已固化该规则。
- **一次一件事**：Phase 阶段编码时，只做当前阶段，不越界进入后续阶段。
- **中文响应**：与用户的交流默认使用中文（代码与术语为英文）。

## 1. 项目结构

```
drhugo_theme/            # Git 仓库根，未来涵盖多个 Hugo 主题
├── HugMedia/            # 当前主题（与主题名一致）
│   ├── themes/ 实际为顶层 layouts、assets、hugo.toml
│   ├── exampleSite/     # 示例站点（开发测试用）
│   └── archetypes/      # 内容模板（new 命令生成）
└── .prompt/             # 设计/scheming/编码流程文档
```

- 主题目录与主题名保持一致（原 social_media 已更名 HugMedia）。
- Git 仓库建立在 `drhugo_theme/` 下，会陆续容纳多个主题。

## 2. Hugo 新版本目录规范（v0.168，已适配重要变更）

Hugo 已取消下划线 `_default` 布局文件夹迁移范式，改为**根级命名模板 + 专用私有目录**。

### 2.1 布局顶层结构（`layouts/`）

```
layouts/
├── _markup/          # render hooks（如 render-codeblock.html）
├── _partials/        # 通用 partial（footer/header.html 等）
├── _shortcodes/      # 自定义 shortcode
├── baseof.html
├── home.html
├── page.html         # = 旧 single.html
├── section.html      # = 旧 list.html（section）
├── taxonomy.html
├── term.html
└── home.rss.xml / section.rss.xml / taxonomy.rss.xml / term.rss.xml  # root 级 RSS
```

- **不使用** `_default/single.html`、`_default/list.html`、`_default/rss.xml`。
- 单篇用 `page.html`，分类列表用 `section.html`。
- taxonomy 页用 `taxonomy.html`（聚合术语列表）+ `term.html`（单个术语），取代旧的 `terms.html`/`term.html` 组。
- **目录职责**：`_partials/` 放可复用 partial（footer/header 等）；`_shortcodes/` 放自定义 shortcode；`_markup/` 放 render hooks（如 render-codeblock.html）。
- **shortcode 命名规范**：用**描述性短名**（如 `audio.html`、`bilibili.html`、`callout.html`、`figure.html`、`code-fold.html`），调用即 `{{< audio ... >}}`；**不加 `layout_` 之类前缀**（此前的 `layout_*.html` 说明系误写，已废弃）；内联 shortcode 用短名实参形式，参数命名清晰、带默认值。

### 2.2 风格分发（多社交风格）

- `home.html` / `section.html` / `page.html` 通过 `partial (printf "home/home-%s.html" $style)` 分发到 `_partials/home/home-xhs.html`、`_partials/section/section-xhs.html`、`_partials/page/page-xhs.html`。
- **未实现风格必须显式回退**：根级维护 `$implemented := slice "xhs"`，`$style` 不在清单中一律回退 `xhs`；「模板名恰好与风格名一致时缺失即报错」的写法不成立（Hugo 找不到文件会直接报错，不会静默回退）。
- nav / card / 分页等子组件同理放 `_partials/nav/nav-xhs.html`、`_partials/cards/card-xhs.html`、`_partials/section/section-xhs.html`。
- 同构页面（`taxonomy.html` / `term.html` 复用 section）直接复制同结构 + 统一 `.Paginate .Pages`，保持分页体验一致。

### 2.3 RSS 模板（新规范 root 级）

- 每个 context 独立模板，接收 Page 对象（其中的 `.RegularPages` 取当前对象下辖页面）：

| 模板 | 作用 | 页面来源 |
|------|------|----------|
| `layouts/rss.xml` | 通用回退（可选） | — |
| `layouts/home.rss.xml` | 首页 | `site.RegularPages` + `mainSections` 过滤 |
| `layouts/section.rss.xml` | 每个 section | `.RegularPages` |
| `layouts/taxonomy.rss.xml` | taxonomy 列表 | `.RegularPages` |
| `layouts/term.rss.xml` | 单个术语 | `.RegularPages` |

- `[outputs]` 需为 home/section/taxonomy 等声明 `"RSS"` 才生成；
  `[services.rss] limit` 控制条数。
- **_partials/terms.html 的澄清**：`_partials/terms.html` 是 **partial 组件**（`partial "terms.html" (dict "taxonomy" "tags" "page" .)`），用来渲染某页所属术语清单，**不是**旧的 `_default/terms.html` 目录布局。二者不可混淆——后者属已废弃命名，前者完全符合新规范。

### 2.4 Front matter 字段规范

- **`published` 是 `publishDate` 的别名**，统一使用 `published:`，不再写 `publishDate:`。
- archetype（`archetypes/default.md`）已含 `date`、`created`、`published`、`draft`。
- 模板读取发布时间的**方法仍为 `.PublishDate`**（Hugo 把 front matter 的 `published` 键映射到该方法；不要误用 `.Published`）。

## 3. 内容与多语言（五语）

- 语言集：**zh-hans / en / ja / ko / vi**（5 种）。
- `content/` 下按语言目录组织，各语言同构（相同 section 结构：`posts/`、`projects/`、`categories/` 等），内容为对译文本。
- Front matter 必含 `title`、`date`、`published`、`tags`、`categories`。
- 语言切换菜单放右上角，按钮用**国旗小图标**（资源放 assets），标签左侧不写字面语言码。
- **语言按钮简短标签 `shortLabel`（自定义语言字段，须放 `params` 子表）**：
  - 语言对象 `langs.Language` 只有原生属性（`label`/`title`/`weight`/`contentDir`），**自定义字段不能用 `site.Language.shortLabel` 点语法**，否则报错 `can't evaluate field shortLabel in type *langs.Language`。
  - 正确做法：存 `[languages.xx.params]`，模板用 `site.Language.Params.shortLabel` 读取。
    ```toml
    [languages.ja]
      label = "日本語"
      [languages.ja.params]
        shortLabel = "日"
    ```
  - **两级回退**：触发按钮取 `site.Language.Params.shortLabel | default $currentLabel`；省略 `shortLabel` 时按钮回退用 `label` 全称。下拉菜单固定显示 `label` 全称。
  - 触发按钮 CSS 需 `white-space: nowrap; flex-shrink: 0;` 防语言名折行；≤600px 隐藏 label 转纯国旗。

### 3.1 导航图标（按风格分目录，同风格共享 Tabler 集）

- 图标资源按风格存 `assets/icons/{style}/`，文件名 = 菜单项 `identifier`（`home.svg`/`posts.svg`/`about.svg`/`recommends.svg`/`projects.svg`）。
- 侧栏 partial 渲染时 `resources.Get (printf "icons/%s/%s.svg" $style .Identifier)`，**缺失则静默跳过**，不破坏导航。
- 各风格统一采用 **Tabler Icons**（描边线形、`stroke="currentColor"` 跟随文字色）；`openicons/` 为候选图标库（tabler/lucide/bootstrap/heroicons/feather），挑选后复制进 `assets/icons/{style}/`。
- 内联图标尺寸由 CSS（`.menu-ico svg { width/height: 1.15em }`）控制，覆盖源 SVG 自带 `width/height`。

### 3.2 功能级共享图标（暗黑切换等跨风格组件）

- 不属于某个风格、由多个风格共用的 feature 图标，存入 `assets/icons/features/`（如暗黑切换按钮的 `sun.svg`/`moon.svg`，Tabler Icons）。
- feature partial 渲染时 `resources.Get "icons/features/{name}.svg"`，**缺失则静默跳过**，不破坏按钮。
- 样式参照语言按钮（`features/lang-switch.css` 的 `.lang-switch__trigger`）：用统一令牌 `--input-height`/`--color-line`/`--radius-md`/`--color-surface` 等，hover 时边框转 `--color-brand`；不使用浏览器默认按钮外观（会出现黑线框）。
- 亮/暗双图标通过 `html[data-theme='dark']` 显隐切换，图标跟随 `currentColor`。

## 4. 主题特性（features）

### 4.1 无障碍（3.13）
- `baseof.html` 顶部含跳转主内容链接：`<a class="skip-link" href="#main-content">`。

### 4.2 暗黑模式
- features 的启用与配置通过 `partialCached "features-enabled.html"` / `features-config.html` 输出到 `<html data-features / data-config>`。

### 4.3 SPA 导航（swup v4）
- `#main-content` 为 swup 内容容器，切换带过渡动画（`swup-transition-fade`）。
- SPA 替换完成后通过 `theme:content-replaced` 事件通知（搜索高亮等据此重跑）。
- 相关 `[outputs]` 无需 JSON，swup 直接 fetch HTML 替换 `<main>`。

### 4.4 数学公式 / 图表
- KaTeX（`math: true` 触发）渲染行内/块级公式。
- Mermaid 渲染流程图（shortcode/mermaid partial）。

### 4.5 搜索（Pagefind 1.6.0）
- 离线索引建于 `exampleSite/pagefind.yml`，限定范围为 `**/{posts,projects}/*/index.html`。
- **只索引文章目录**：排除导航、分类/标签聚合页、跨语言误命中。
- 搜索结果为同一篇文章去重（屏蔽 Categories/Tags/Section 重复条目）。

### 4.6 搜索高亮（双轨）
1. **模糊高亮**：Pagefind 返回的 `excerpt` 自带 `<mark>` 标注模糊命中片段，不可人为抹除。
2. **严格匹配高亮**：自定义 `TreeWalker` 遍历文本节点，对完整匹配查询词的文本用 `<mark class="search-ui__m-exact">` 包裹。
- 下拉结果高亮：品牌实底 + 白字加粗（`search-ui__result mark`）。
- 文章正文高亮（soft）：品牌软底 + 描边（`.has-kw-highlight mark.search-ui__m-exact`），避免干扰阅读。

### 4.7 跨页关键词高亮（文章页）
- 搜索结果链接通过 `kwToUrl` 追加 `?kw=<查询词>` 参数。
- 文章页 `highlightFromUrl` 读取 `kw`，对正文容器（`data-pagefind-body`）做 TreeWalker 高亮。
- 挂载时机：页面初次加载 + `theme:content-replaced`（SPA）事件。
- `clearPageHighlights` 在重跑前清理旧标记防残留。

### 4.8 分页 / 双向无限滚动（Pagination + Infinite Scroll）
- **根级统一分页**：`home.html` / `section.html`（含复制同构的 `taxonomy.html` / `term.html`）在根级计算 `$pager := .Paginate ...`，通过 `(dict "page" . "pager" $pager)` 传给风格 partial；风格 partial **只消费分页后的页集**，不在风格层再算分页。
- **功能层 / 风格层解耦**：`_partials/pagination.html` 只输出通用钩子——类 `.infinite-pagination`、`data-infinite-pagination / data-current-page / data-total-pages / data-page-urls / data-prev-url / data-next-url / data-status-*`；JS/CSS **只消费 data-* 与 .infinite-* 通用类**，绝不写风格类名（如 `.xhs-*`）。各风格外观由 `styles/{style}.css` 用 `[data-infinite-pagination]` 自行实现。
- **渐进增强**：无 JS / SEO 抓取时，上一页/下一页链接原生可点；页码跳转表单由 JS 增强。这是「静态分页」而非前端 fetch JSON 的关键——SEO 与降级双保底。
- **行为层入口**：`assets/js/features/infinite.js` 由 `features/index.js` 按 `data-features` 含 `infinitescroll` 动态 import，挂到 `win.infiniteScroll`；**swup 换页后必须先 `destroy()` 旧实例再 `init()`**，否则监听器重复叠加。
- **列表锚点**：`data-infinite-grid` 网格容器；卡片抽到 `_partials/cards/card-xhs.html` 供 home/section 复用，新增风格一并接线 `cards/card-{style}.html`。
- **配置**：`[pagination] pagerSize / path`（如 `path = 'page'` 生成 `/page/2/`），`[params.features].infiniteScroll = true`。

## 5. HTML/JS/CSS 约定

- 所有 HTML partial 顶部用 `{{- /* 中文说明 */}}` 注释。
- CSS 按特性拆分到 `assets/css/features/*.css`，经 Hugo 管道合并指纹。
- 样式路由用 `style-{{ site.Params.style }}` 类挂在 `<body>`。
- 功能启用状态以 `data-features`（HTML）与 JS 端 feature 检测保持一致。

## 6. 内容示例（示例站点）

- 示例内容覆盖全部特性：数学公式、Mermaid、图片、音频、视频（YouTube/B站 shortcode）、代码优化 + 语法高亮、阅读计时。
- 文学片段选用《古文观止》（《岳阳楼记》）与《福尔摩斯》章节（《血字的研究》），各语言对译。
- 目录除 `posts/` 外还有 `projects/` 用于差异测试。

## 7. 坑点与可复用解决（Pitfalls & Reusable Solutions）

> 汇总历次修复中可复用的经验。凡「一次修好、下次照抄」的解法都收在此处。

### 7.1 触控板上滑反复跳动（列表尾部上滑手势）
**现象**：MacBook 触控板上滑到列表尾部，页面上抬后反复跳动/闪动。
**根因**：触控板输入是「高频小幅步进 + 惯性长尾（momentum）」。回弹动画期间残余的正向惯性会不断「取消回弹再拉起」，与原生橡皮筋（overscroll）形成拉锯。
**可复用解法**（集中在 `features/infinite.js`）：
1. 回弹动画期内 **全量吸纳滚轮输入**，把它计入动画目标，而不是打断动画；
2. 设置**惯性尾段窗口**（`WHEEL_TAIL_MS ≈ 400ms`）：空白区归零后的 momentum 残存期内，正向滚轮按 `≈0.5` 权重打折计入——防「刚收起的空白区被惯性瞬间弹起」；
3. 反向 delta（回滚）**软回退而非硬收**：反向权重低，视觉顺滑；
4. **单次滚轮位移设上限**（`WHEEL_STEP_MAX ≈ 150px`）：只拦截极端惯性加速的「拉满弹跳」；
5. **`overscroll-behavior-y: none`** 消除原生橡皮筋；左栏导航用 `overscroll-behavior: contain` 限制在自身区域滚动；
6. 触发阈值用「视口高度的比例」（2/5）而非固定 px，且**松手（touchEnd）才回落**——用户不松手不回落，避免系统抢滚动；
7. 回落动画时长随上滑像素**自适应**（基础 160ms + 0.35ms/px，上限约 420ms），贴合人手回速，不显突兀。

### 7.2 SPA（swup）与动态功能实例的协作
- 任何在页面首次加载后新建监听器/观察器的模块（infinite 滚动、语言切换、搜索高亮），**必须在 swup 换页时 `destroy()` 旧实例再 `init()`**，否则重复初始化会叠加监听器与观察器（IntersectionObserver 同元素多次 observe 行为不可控）。
- `#main-content` 替换完成后等 `theme:content-replaced` 事件再做 DOM 依赖操作（如关键词高亮重跑）。

### 7.3 语言对象上的自定义字段必须放 `params` 子表
- `langs.Language` 只有原生属性，**点语法访问自定义字段会报错** `can't evaluate field shortLabel in type *langs.Language`。
- 自定义字段存 `[languages.xx.params]`，模板用 `site.Language.Params.shortLabel` 读；两段回退：`Params.shortLabel | default label`。（实现细节与示例见 §3 语言按钮简短标签）

### 7.4 Hugo 环境与安全（v0.168+）
- 安全白名单：主题位于站点工作目录外（符号链接 `exampleSite/themes/HugMedia`）时，凡主题要跨目录引用的资源（如 `node_modules` 依赖），需在站点 `hugo.toml` 的 `[security] node.permissions.allowread` 中放行 `'../node_modules'`，否则 js.Build 直接报 "not allowed"（示例见 `exampleSite/hugo.toml` 注释）。