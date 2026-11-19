---
title: "HugMedia 테마 개발"
description: "다섯 가지 소셜 스타일 전환을 지원하는 Hugo 테마"
keywords: ["hugo", "theme", "social", "multilingual"]
date: 2026-11-16
published: 2026-11-16
tags: ["개발", "hugo", "테마"]
categories: ["프로젝트"]
status: "진행 중"
---

# HugMedia 테마 개발

이것은**프로젝트 페이지** 예시로, posts 외의 최상위 섹션 렌더링을 테스트하고 SEO 관련 프론트매터(`description` / `keywords`)를 시연합니다.

## 프로젝트 목표

간결하고 유지보수하기 쉬우며 바로 사용할 수 있는 Hugo 테마를 만든다.

- 다섯 가지 소셜 플랫폼 스타일 전환 지원(xhs / zhihu / wechat / medium / quora)
- 다국어(zh-hans 주 / en 보조)
- 내장 사이트 내 검색, 다크 모드, 반응형 레이아웃

## 기술 선택

1. 템플릿 분기: `define` + `template`
2. 빌드: Hugo `css.Build` + `js.Build`
3. 수학: KaTeX; 다이어그램: Mermaid

## 마일스톤

| 단계 | 내용 | 상태 |
|------|------|------|
| 조사 | 스타일 디자인 조사 | ✅ |
| 코딩 | 다섯 스타일 CSS 변수 | 🔄 |
| 테스트 | 다국어 + 기능 콘텐츠 | 🔄 |

## 커버 이미지(이미지)

![HugMedia project](https://picsum.photos/seed/hugmedia-project/1200/630)