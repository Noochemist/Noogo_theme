---
title: "Media & Shortcodes Test"
description: "Audio, video, YouTube, Bilibili shortcode tests"
date: 2026-11-16
published: 2026-11-16
tags: ["media", "shortcode", "dev"]
categories: ["tutorial"]
---

# Media & Shortcodes Test

This page exercises **shortcodes**: audio, video, YouTube, and Bilibili.

## Audio (audio shortcode)

The `audio` shortcode renders a native `<audio>` player. Usage:

```html
{{< audio "audio-source-url" >}}
```

Actual call:

{{< audio "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" >}}

## Video (video shortcode)

The `video` shortcode renders a native `<video>` player (MDN public sample). Usage:

```html
{{< video "video-source-url" >}}
```

Actual call:

{{< video "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" >}}

## YouTube embed (built-in shortcode)

{{< youtube "dQw4w9WgXcQ" >}}

## Bilibili embed (custom bilibili shortcode)

{{< bilibili "BV1Fv4y1f7JY" >}}

## Notes

> There are both built-in shortcodes (e.g. `youtube`) and theme-provided ones (`audio`, `video`, `bilibili`). If a shortcode is missing, Hugo will warn and render it literally—check the build log.