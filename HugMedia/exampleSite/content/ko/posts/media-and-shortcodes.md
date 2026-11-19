---
title: "미디어와 숏코드 테스트"
description: "오디오·비디오·YouTube·Bilibili 숏코드 테스트"
date: 2026-11-16
published: 2026-11-16
tags: ["미디어", "shortcode", "개발"]
categories: ["튜토리얼"]
---

# 미디어와 숏코드 테스트

이 페이지는**숏코드(shortcode)**의 렌더링을 테스트합니다. 오디오, 비디오, YouTube, Bilibili.

## 오디오(audio 숏코드)

`audio` 숏코드는 네이티브 `<audio>` 플레이어를 출력합니다. 사용 예시:

```html
{{< audio "오디오 소스 URL" >}}
```

실제 호출:

{{< audio "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" >}}

## 비디오(video 숏코드)

`video` 숏코드는 네이티브 `<video>` 플레이어를 출력합니다(MDN의 공개 예시 동영상). 사용 예시:

```html
{{< video "비디오 소스 URL" >}}
```

실제 호출:

{{< video "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" >}}

## YouTube 삽입(Hugo 내장 숏코드)

{{< youtube "dQw4w9WgXcQ" >}}

## Bilibili 삽입(사용자 정의 bilibili 숏코드)

{{< bilibili "BV1Fv4y1f7JY" >}}

## 설명

> 내장 숏코드(`youtube`)와 테마 고유의 `audio`, `video`, `bilibili`가 모두 있습니다. 숏코드가 미구현이면 Hugo가 경고하고 그대로 출력합니다. 빌드 로그를 기준으로 하세요.