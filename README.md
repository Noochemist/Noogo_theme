# Hugo 主题集 / A Collection of Hugo Themes

## 简介 / Introduction

持续扩充的 Hugo 主题集合。每主题一个独立目录，拥有独立功能、风格与文档（见各自 README）；主题间互相解耦，可单独作为 git 子模块引入任意 Hugo 项目。

A growing collection of Hugo themes. Each theme lives in its own directory with independent features, styles and docs; the themes are decoupled and can be pulled into any Hugo project as a git submodule.

## 主题列表 / Themes

| 主题 / Theme | 简介 / Synopsis | 文档 / Docs |
| --- | --- | --- |
| [HugMedia](HugMedia/) | Hugo + 社媒风格：五语、五种社交风格一键切换 | [HugMedia/README.md](HugMedia/README.md) |

**HugMedia** 是 *Hugo + social media* 的合成词：以社交平台视觉为核心的 Hugo 主题，内置中英日韩越五语与 `xhs` / `zhihu` / `wechat` / `medium` / `quora` 五种风格，切换仅改 `params.style` 一个参数。

HugMedia blends *Hugo* + *social media*: a theme centred on social-platform visual languages, shipping five languages and five switchable platform styles — toggling a style is a one-parameter change.

## 规划 / Roadmap

沿「风格 × 功能」两个维度持续扩充更多主题（文档站、杂志排版、极简博客等）；新主题遵循一致的目录结构与文档规范，并在上方列表同步更新简介与链接。

The collection will keep growing along *styles* and *features* axes — documentation sites, magazine layouts, minimalist blogs, etc. New themes follow the same structure and doc conventions, and this listing stays in sync.

## 远程仓库 / Remote

主远程仓库 **Noogo_theme**（GitHub：Noochemist），简介如上；添加为 `origin`：

```bash
git remote add origin git@github.com:Noochemist/Noogo_theme.git
```

## 贡献 / Contributing

欢迎 Issue 与 PR。提交前请阅读对应主题的 README，遵循既有结构、配置与代码风格并确保本地构建通过；讨论与注释优先中文，必要时中英对照；请勿提交密钥或敏感信息。

All contributions are welcome. Before a PR, read the theme's README, follow its existing structure/configuration/code style, and make sure the site builds locally. Discussions and comments prefer Chinese, bilingual where helpful. Never commit secrets or sensitive information.

## 许可证 / License

本仓库及所有主题（除非各自另有声明）均以 [MIT](LICENCE.md) 发布，副本需保留版权与许可声明。

Copyright (c) 2026, dustandrain. Released under the [MIT License](LICENCE.md).