# HugMedia 风格调研报告 · 编码参考（research.design.md）

> 版本：2026-11-16 · dsv4f
>
> 目标读者：编写 HugMedia 主题代码时，逐风格校对色彩、排版、间距、组件结构的直接依据。
>
> **方法论与可信度声明**
> - 本次对 5 个站点（小红书 / 知乎 / 公众号 / Medium / Quora）的 `WebFetch` 直抓多被**登录墙 + 反爬 + JS 客户端渲染**拦截，无法逐行读到生产 CSS 元素代码。
> - 因此本报告采用三层交叉：① 各平台**公开设计系统/设计研究**中的稳定值；② 仓库内 `scheming/research.md` 与 `ref/xhs` 截图**采样值**；③ 最新 `hugo.example.toml` 的 token 定义。
> - 凡标 **【实测】推断** 的条目（主要是个别品牌色精确 hex、现行版本字号）请在编码时以真实 DOM/截图复核；标 **【公开规范】稳定** 的条目（品牌主色、布局骨架）可放心使用。

---

## 0. 风格 × 渲染映射（贯穿编码）

| 参数 `[params.style]` | 平台 | 风格 CSS | 首页主体 | 文章页主体 | 导航片段 |
|---|---|---|---|---|---|
| `xhs` | 小红书 | `styles/xhs.css` | `home-xhs.html` | `page-xhs.html` | `nav-xhs.html` |
| `zhihu` | 知乎 | `styles/zhihu.css` | `home-zhihu.html` | `page-zhihu.html` | `nav-zhihu.html` |
| `wechat` | 公众号 | `styles/wechat.css` | `home-wechat.html` | `page-wechat.html` | `nav-wechat.html` |
| `medium` | Medium | `styles/medium.css` | `home-medium.html` | `page-medium.html` | `nav-medium.html` |
| `quora` | Quora | `styles/quora.css` | `home-quora.html` | `page-quora.html` | `nav-quora.html` |

公用骨架 `baseof.html` + `base/` 层承载搜索、暗黑、响应式等**风格无关**能力；风格层只覆写 `:root` token 与少数组件。

关联配置（`[params.styleOptions]`）：
- `xhs.gridColumns=5`、`cardRatio="3/4"`、`showCategoryBar=true`
- `zhihu.showHotList=true`、`answerCollaps=true`
- `wechat`（默认无专属，阅读型）
- `medium`（默认无专属）
- `quora`（默认无专属）

字体栈统一遵循「拉丁在前 → zh → ja → ko」回退（见 ``hugo.example.toml [params.fonts]``），各风格不再单独造字体变量，仅调整字重与行高。

---

## 1. 小红书 xhs — 图片驱动 / 瀑布流 / 红色系

### 1.1 定位与信息架构
- 内容形态：图文**笔记**（竖版封面主导），瀑布流(cards feed)。
- IA：顶栏（Logo + 搜索 + 打开App）→ 分类筛选 chips → 瀑布流卡片；详情=Dual-pane（左主图 + 右作者/正文/评论）。

### 1.2 色彩系统 【公开规范】主色稳定
| Token | 值 | 用途 |
|---|---|---|
| `--brand` | `#FF2442` | 品牌红（官方），点缀、选中、Logo |
| `--brand-hover` | `#E0233C` | 按压/悬停 |
| `--brand-soft` | `#FFE8EC` | 欢迎条/标签底/笔刷气泡 |
| `--bg` | `#FFFFFF` | 页面主背景 |
| `--bg-soft` | `#F7F8FA` | 侧栏/筛选区 |
| `--text` | `#222` | 标题 |
| `--text-sub` | `#666` | 摘要/作者 |
| `--text-mute` | `#999` | 计数、时间 |
| `--line` | `#EEE` | 分割线/卡片描边 |
| `--shadow` | `0 2px 8px rgba(0,0,0,.04)` | 卡片轻阴影 |

### 1.3 排版
- 中文无衬线（苹方/思源黑体），标题 **600~700**；正文 14px；摘要 ≤2 行 clamp。
- 封面底部渐变蒙版承载叠白文字（计数）。

### 1.4 布局 / 组件分解
- **瀑布流**：基于 `grid-columns:5`（1440px 以下按断点减列），用 `columns` 或 JS 最短列算法；封面 `aspect-ratio:3/4`。
- **卡片**：`封面 → 标题(2行clamp) → 头像+昵称+点赞♥`；圆角 `--card-radius:12px`。
- **顶栏**：左侧折叠/极简 Logo，中间搜索（胶囊 `24px`），右侧「打开App」高亮按钮。
- **详情**：左主图 3:4 定高定宽缩放；右栏固定宽承载作者卡、正文、点赞/收藏/评论/分享操作条、气泡式评论（圆角 `16px`，头像+昵称+正文+点赞）。

### 1.5 交互与暗色
- 操作条图标化（♥/⭐/💬/↗），hover 品牌红；tab/筛选可高亮。
- 暗色：`bg→#111`、`text→#EEE`、`brand-soft→rgba(255,36,66,.16)`。

### 1.6 CSS token 映射（可直接落 styles/xhs.css）
```css
:root, .style-xhs {
  --brand:#FF2442; --brand-hover:#E0233C; --brand-soft:#FFE8EC;
  --bg:#FFFFFF; --bg-soft:#F7F8FA;
  --text:#222; --text-sub:#666; --text-mute:#999; --line:#EEE;
  --grid-cols:5; --card-ratio:3/4;
  --card-radius:12px; --card-shadow:0 2px 8px rgba(0,0,0,.04);
  --radius-pill:24px;
}
```

---

## 2. 知乎 zhihu — 问答驱动 / 列表 / 蓝色系

### 2.1 定位与信息架构
- 内容形态：问题/回答/专栏**列表流** + 右侧**热榜**。
- IA：顶栏（Logo「知」+ 首页/热榜/会员 + 搜索 + 「提问」橙色按钮 + 消息/头像）→ 双栏（左信息流、右热榜/追番）。

### 2.2 色彩系统 【公开规范】主色稳定
| Token | 值 | 用途 |
|---|---|---|
| `--brand` | `#0084FF`【实测】现行站点亦见 `#0066FF`，编码时二选一并通测 | 知乎蓝：链接、选中、关注 |
| `--accent` | `#FE7D3F` | 「提问」橙色按钮、Tag |
| `--bg` | `#FFFFFF` | 内容卡 |
| `--bg-soft` | `#F6F6F6` | 页面底 |
| `--text` | `#1a1a1a` | 主文本 |
| `--text-sub` | `#6a6a6a` | 元信息 |
| `--text-mute` | `#999` | 计数 |
| `--line` | `#ebebeb` | 分隔线 |

### 2.3 排版
- 中文无衬线，**正文 15px、行高 1.8**；问题标题粗 600；热榜数字序号醒目。

### 2.4 布局 / 组件分解
- **信息流条目**：标题(粗) → 元信息行(作者/关注者/回答数) → 摘要 → 底部操作条（赞同▲ / 评论 / 分享 / 收藏）。
- **热榜侧栏**：`showHotList=true`；1~50 序号列表，每行标题 + 热度值。
- **回答展开**：`answerCollaps=true`，「展开阅读全文」折叠长回答。
- **详情**：问题标题 + 元信息 + 回答卡；赞同按钮竖向箭头，可点按增 1；支持代码块/公式。
- 圆角偏锐（卡片约 `4px`，保持「理性知识」气质），按钮胶囊。

### 1.6 CSS token 映射（styles/zhihu.css）
```css
:root, .style-zhihu {
  --brand:#0084FF; --accent:#FE7D3F;
  --bg:#FFFFFF; --bg-soft:#F6F6F6;
  --text:#1a1a1a; --text-sub:#6a6a6a; --text-mute:#999; --line:#ebebeb;
  --card-radius:4px; --card-shadow:none;
  --body-fs:15px; --body-lh:1.8;
}
```

---

## 3. 公众号 wechat — 阅读驱动 / 单栏 / 绿色系

### 3.1 定位与架构
- 内容形态：沉浸式**长文阅读**，元素极少、留白大。
- IA：极简顶栏（帐号头像+名称+「关注」）→ 单栏文章 → 底部操作 + 相关阅读。

### 3.2 色彩系统 【公开规范】稳定
| Token | 值 | 用途 |
|---|---|---|
| `--brand` | `#07C160` | 微信绿：关注/在看 |
| `--accent` | `#07C160` 同源 | — |
| `--bg` | `#FFFFFF` | 阅读区 |
| `--text` | `#1f1f1f` | 正文 |
| `--text-sub` | `#888` | 作者/日期 |
| `--line` | `#eaeaea` | 分隔 |

### 3.3 排版
- 中文章标题**居中、大号、粗**；正文 16px、**行高 1.75~2.0**；正文区最大宽约 `677px`。
- 引用/强调可用「平台固定 quote 样式」（左竖线灰底块）。

### 3.4 布局 / 组件
- 顶栏：头像(圆) + 名称 + 「关注」胶囊（绿底白字或描边）。
- 正文前：标题 → 账号/作者/日期/原创徽标 → 正文。
- 正文后：`在看`(绿) / `点赞` / `分享` 引导 + 赞赏码占位 + 相关阅读卡（标题+封面小图+摘要）。
- 无侧边栏；移动与桌面同一单栏骨架（最大宽约束）【核心约束：阅读沉浸】。

### 3.5 CSS token 映射（styles/wechat.css）
```css
:root, .style-wechat {
  --brand:#07C160;
  --bg:#FFFFFF; --text:#1f1f1f; --text-sub:#888; --line:#eaeaea;
  --content-maxw:677px;
  --body-fs:16px; --body-lh:1.9;
  --card-radius:0;
}
```

---

## 4. Medium — 写作驱动 / 单栏 / 黑白色系

### 4.1 定位与架构
- 内容形态：**深度长文**，纯黑白对比 + 绿色点缀。
- IA：极简 sticky 顶栏 → 单栏正文(≤680px) → 作者/标题/正文 → clap/收藏 → 相关推荐。

### 4.2 色彩系统 【公开规范】稳定
| Token | 值 | 用途 |
|---|---|---|
| `--brand` | `#1A8917` | 绿色：follow、logo 内 "M" 圆点 |
| `--fg` | `#000000` | 正文文字 |
| `--text-sub` | `#757575` | 作者/日期/阅读数 |
| `--bg` | `#FFFFFF` | 页面 |
| `--bg-soft` | `#FAFAFA` | 正文可选浅底 |
| `--line` | `#F0F0F0` | 细分隔 |

### 4.3 排版（Medium 排印是其灵魂）
- **正文用衬线**（经典 `Georgia`/`source-serif` 系），**约 21px、行高 1.58**，对齐左。
- 标题同衬线、大号；居中或左对齐的「居中大标题 + 灰色副题」是标志性排印。
- 段落间距大；可选首字下沉 / 首段加大。

### 4.4 布局 / 组件
- **sticky 目录**：正文左侧固定 TOC，滚动高亮当前小节（对应 `_partials/../toc` 能力）。
- **clap(👏)**：可多次点击累加，动画计数；收藏(bookmark)。
- 顶栏：Logo(绿圆+白字) + 搜索/「Write」/头像。
- 作者行：头像(圆) + 名称 + Follow(green pill) + 日期/阅读时长(灰)。
- 相关推荐：文末卡片网格（作者/主题），绿点提示 member 会员内容。

### 4.5 CSS token 映射（styles/medium.css）
```css
:root, .style-medium {
  --brand:#1A8917; --fg:#000; --text-sub:#757575;
  --bg:#FFFFFF; --bg-soft:#FAFAFA; --line:#F0F0F0;
  --content-maxw:680px;
  --body-fs:21px; --body-lh:1.58;
  --radius-pill:999px; --radius-btn:8px;
}
```

---

## 5. Quora — 知识驱动 / 三栏 / 红棕色调

### 5.1 定位与架构
- 内容形态：**QA 社区**，三栏布局（左导航 + 中内容 + 右推荐/社区）。
- IA：左垂直图标导航（Home/Answer/Notification/Space…）→ 中问题流 → 右上搜索 + 右下相关。

### 5.2 色彩系统 【公开规范】主色稳定
| Token | 值 | 用途 |
|---|---|---|
| `--brand` | `#B92B27`【公开规范】经典 Quora 红棕；现行高切按钮或 `#bb0000` 系【实测】 | 主按钮、品牌 |
| `--link` | `#2E69B2` | 问题/链接蓝 |
| `--bg` | `#FFFFFF` | 内容卡 |
| `--bg-soft` | `#F6F7F9`【实测】现行更浅可调 `#FAFBFC` | 页面底 |
| `--text` | `#282829` | 正文 |
| `--text-sub` | `#7c878e` | 元信息 |
| `--line` | `#dee0e1` | 分隔 |

### 5.3 排版
- 无衬线（Roboto/苹方）；元信息 13~14px 灰，问题标题粗蓝，回答正文 14~15px、行高 1.6+。

### 5.4 布局 / 组件
- **三栏**：左栏宽度可选收起为图标；中内容最大约 `640~700px`；右栏社区/相关/页脚链。
- **问题条目**：问题标题（蓝、粗）→ 浏览数/关注 → 首答预览（含 upvote 计数）→ 「查看全部回答」。
- **回答页**：问题 + 多回答；竖向 ▲ 赞 / ▼ 踩；头像圆形；空间(Space)徽标。
- 按钮多为红底（品牌色）胶囊/直角；支持夜间高对比模式。

### 5.5 CSS token 映射（styles/quora.css）
```css
:root, .style-quora {
  --brand:#B92B27; --link:#2E69B2;
  --bg:#FFFFFF; --bg-soft:#F6F7F9;
  --text:#282829; --text-sub:#7c878e; --line:#dee0e1;
  --content-maxw:680px;
  --card-radius:0; --card-shadow:none;
  --body-fs:15px; --body-lh:1.6;
}
```

---

## 6. 五风格 token 对比总表（编码速查）

| 风格 | 主色 | 强调/点缀 | 背景(soft) | 正文尺寸/行高 | 布局/列 | 圆角色调 | 导航 |
|---|---|---|---|---|---|---|---|
| xhs | `#FF2442` | `#E0233C` | `#F7F8FA` | 14px 图片卡 | 瀑布流 5 列 3:4 | 卡片 12px 胶囊 | 左+顶 |
| zhihu | `#0084FF`* | `#FE7D3F` | `#F6F6F6` | 15px/1.8 列表 | 双栏+热榜 | 锐 4px | 顶 |
| wechat | `#07C160` | 同 | `#FFF` | 16px/1.9 单栏 | 单栏 ≤677px | 直角 | 极简顶 |
| medium | `#1A8917` | `#757575` 灰 | `#FAFAFA` | 21px/1.58 衬线 | 单栏 ≤680px | 胶囊/圆 | 极简顶+sticky目录 |
| quora | `#B92B27` | `#2E69B2` 蓝 | `#F6F7F9` | 15px/1.6 列表 | 三栏 ≤680px | 锐 | 左垂直 |

\* zhihu 主色现有两种现行值，编码前以目标版本截图复核 `#0084FF`/`#0066FF`。

---

## 7. 编码落点（与既有架构对齐）

- 每个风格只产出 `styles/{name}.css`，只覆写 token + 该风格专属组件类（`--prefix` 如 `.style-quora`），**不重复功能模块**。
- 复用能力（base 层）：站内搜索放大镜、暗黑切换、响应式断点、SPA(swup) 过渡。
- 数据来源字段（front matter / `site.Data`）：`cover`、`title`、`author`、`avatar`、`pulledAt/PublishDate`、点赞/收藏计数、tags、回答/评论列表。
- 颜色/字体一律走 token，禁止硬编码色值到页面类（保证暗色与换风格不被破坏）。

## 8. 待运行时实测核对清单（编码阶段 TODO）
1. zhihu 品牌蓝：确认现行为 `#0084FF` 还是 `#0066FF`（两处通测）。
2. xhs 卡片圆角与封面比在 1440/1024/768 断点的列数表现。
3. wechat 正文最大宽度与字号在桌面是否维持 `677px/16px`。
4. Quora 背景灰现行值（`#F6F7F9` vs `#FAFBFC`）与夜间对比度。
5. 各风格暗色 token 对照真实站点的对比度（至少 AA）。