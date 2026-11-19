---
title: "HugMedia テーマ開発"
description: "5つのソーシャルスタイル切替に対応した Hugo テーマ"
keywords: ["hugo", "theme", "social", "multilingual"]
date: 2026-11-16
published: 2026-11-16
tags: ["開発", "hugo", "テーマ"]
categories: ["プロジェクト"]
status: "進行中"
---

# HugMedia テーマ開発

これは**プロジェクトページ**の例で、トップレベルセクション（posts 以外）の表示をテストし、SEO 関連フロントマター（`description` / `keywords`）をデモします。

## プロジェクト目標

シンプルで保守しやすく、すぐに使える Hugo テーマを作る。

- 5つのソーシャルプラットフォームスタイルの切替（xhs / zhihu / wechat / medium / quora）
- 多言語対応（zh-hans 主 / en 従）
- 内蔵のサイト内検索、ダークモード、レスポンシブレイアウト

## 技術選定

1. テンプレート分岐：`define` + `template`
2. ビルド：Hugo `css.Build` + `js.Build`
3. 数学：KaTeX；図：Mermaid

## マイルストーン

| フェーズ | 内容 | 状態 |
|------|------|------|
| 調査 | スタイルデザイン調査 | ✅ |
| コーディング | 5スタイル CSS 変数 | 🔄 |
| テスト | 多言語＋機能コンテンツ | 🔄 |

## カバー画像（画像）

![HugMedia project](https://picsum.photos/seed/hugmedia-project/1200/630)