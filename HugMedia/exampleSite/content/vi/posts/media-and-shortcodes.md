---
title: "Kiểm thử media và shortcode"
description: "Kiểm thử shortcode audio, video, YouTube, Bilibili"
date: 2026-11-16
published: 2026-11-16
tags: ["media", "shortcode", "dev"]
categories: ["hướng dẫn"]
---

# Kiểm thử media và shortcode

Trang này dùng để kiểm thử cách hiển thị của**shortcode**: audio, video, YouTube, Bilibili.

## Audio (shortcode audio)

Shortcode `audio` xuất ra trình phát `<audio>` nguyên bản. Ví dụ cách dùng:

```html
{{< audio "URL nguồn âm thanh" >}}
```

Gọi thực tế:

{{< audio "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" >}}

## Video (shortcode video)

Shortcode `video` xuất ra trình phát `<video>` nguyên bản (video ví dụ công khai của MDN). Ví dụ cách dùng:

```html
{{< video "URL nguồn video" >}}
```

Gọi thực tế:

{{< video "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" >}}

## Nhúng YouTube (shortcode dựng sẵn của Hugo)

{{< youtube "dQw4w9WgXcQ" >}}

## Nhúng Bilibili (shortcode bilibili tùy chỉnh)

{{< bilibili "BV1Fv4y1f7JY" >}}

## Ghi chú

> Có cả shortcode dựng sẵn (`youtube`) lẫn shortcode tùy chỉnh `audio`, `video`, `bilibili`. Nếu một shortcode chưa được triển khai, Hugo sẽ cảnh báo và xuất nguyên văn; hãy lấy nhật ký build làm chuẩn.