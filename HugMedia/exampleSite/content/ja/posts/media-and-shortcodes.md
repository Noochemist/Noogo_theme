---
title: "メディアとショートコードのテスト"
description: "音声・動画・YouTube・Bilibili ショートコードのテスト"
date: 2026-11-16
published: 2026-11-16
tags: ["メディア", "shortcode", "開発"]
categories: ["チュートリアル"]
---

# メディアとショートコードのテスト

このページでは**ショートコード（shortcode）**の配信をテストします。音声、動画、YouTube、Bilibili。

## 音声（audio shortcode）

`audio` ショートコードはネイティブな `<audio>` プレーヤーを出力します。使い方の例：

```html
{{< audio "音声ソース URL" >}}
```

実際の呼び出し：

{{< audio "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" >}}

## 動画（video shortcode）

`video` ショートコードはネイティブな `<video>` プレーヤーを出力します（MDN のパブリックな例の動画）。使い方の例：

```html
{{< video "動画ソース URL" >}}
```

実際の呼び出し：

{{< video "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" >}}

## YouTube 埋め込み（Hugo 内蔵ショートコード）

{{< youtube "dQw4w9WgXcQ" >}}

## Bilibili 埋め込み（独自の bilibili ショートコード）

{{< bilibili "BV1Fv4y1f7JY" >}}

## 説明

> 内蔵ショートコード（`youtube`）とテーマ独自の `audio`、`video`、`bilibili` の両方があります。ショートコードが未実装の場合は Hugo が警告してそのまま出力します。ビルドログを基準にしてください。