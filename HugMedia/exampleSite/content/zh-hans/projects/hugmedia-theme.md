---
title: "HugMedia 主题开发"
description: "一个支持五种社交风格切换的 Hugo 主题"
keywords: ["hugo", "theme", "social", "multilingual"]
date: 2026-11-16
published: 2026-11-16
tags: ["开发", "hugo", "主题"]
categories: ["项目"]
status: "进行中"
---

# HugMedia 主题开发

这是一个**项目页**示例，用于测试顶级 section（非 posts）的呈现，并演示 SEO 相关 front matter 字段（`description` / `keywords`）。

## 项目目标

做一个简洁、易维护、可开箱即用的 Hugo 主题：

- 支持五种社交平台风格切换（xhs / zhihu / wechat / medium / quora）
- 多语言（zh-hans 主 / en 辅）
- 内建站内搜索、暗黑模式、响应式布局

## 技术选型

1. 模板分发：`define` + `template`
2. 构建：Hugo `css.Build` + `js.Build`
3. 数学：KaTeX；图表：Mermaid

## 里程碑

| 阶段 | 内容 | 状态 |
|------|------|------|
| 调研 | 风格设计调研 | ✅ |
| 编码 | 五风格 CSS 变量 | 🔄 |
| 测试 | 多语言 + 特性内容 | 🔄 |

## 封面预览（图片）

![HugMedia project](https://picsum.photos/seed/hugmedia-project/1200/630)