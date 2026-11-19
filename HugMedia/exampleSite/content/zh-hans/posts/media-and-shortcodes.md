---
title: "媒体与短代码测试"
description: "音频、视频、YouTube、B站 shortcode 测试"
date: 2026-11-16
published: 2026-11-16
tags: ["媒体", "shortcode", "开发"]
categories: ["教程"]
---

# 媒体与短代码测试

本页用于测试**短代码（shortcode）**的呈现：音频、视频、YouTube、Bilibili。

## 音频（audio shortcode）

`audio` shortcode 输出一个原生 `<audio>` 播放器。用法示例：

```html
{{< audio "音频源URL" >}}
```

实际调用：

{{< audio "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" >}}

## 视频（video shortcode）

`video` shortcode 输出一个原生 `<video>` 播放器（MDN 公共示例视频）。用法示例：

```html
{{< video "视频源URL" >}}
```

实际调用：

{{< video "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" >}}

## YouTube 嵌入（Hugo 内建 shortcode）

{{< youtube "dQw4w9WgXcQ" >}}

## Bilibili 嵌入（自定义 bilibili shortcode）

{{< bilibili "BV1Fv4y1f7JY" >}}

## 说明

> 既有内建 shortcode（`youtube`），也有主题自定义的 `audio`、`video`、`bilibili`。若某短代码未实现，Hugo 会告警并原样输出，请以构建日志为准。