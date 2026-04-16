# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

「あのね。」- 育児日記アプリ（Phase 1 MVP）。0〜3歳の子どもを持つ母親向け。「通知ゼロ、プレッシャーゼロ」がコンセプト。Phase 1 は Android（Google Play Store）のみ。

詳細な仕様は `REQUIREMENTS.md` を参照。

## Tech Stack

- **Frontend:** Expo (React Native) + TypeScript (strict mode)
- **Routing:** Expo Router (file-based routing, `app/` directory)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Authentication:** 開発中は Email/Password、リリース前に Google OAuth に差し替え
- **Build/Deploy:** EAS Build → Google Play Store
- **Path Alias:** `@/*` → プロジェクトルート

## Commands

```bash
npm start          # Expo開発サーバー起動
npm run android    # Androidエミュレータで起動
npm run ios        # iOSシミュレータで起動
npm run web        # Web版起動
npm run lint       # ESLint実行
```

## Ticket Management

チケットは `docs/01_*.md` 〜 `docs/13_*.md` で管理。TODO ルールの詳細は `.claude/rules/ticket-management.md` を参照。

> Google OAuth（12）はローカルテストの利便性のため最後に実装。開発中は Email/Password 認証（02）を使用。

## Rules (.claude/rules/)

詳細なベストプラクティスは `.claude/rules/` に分離。対象ファイルを触るときだけ自動で読み込まれる:

| ルール | 対象 glob | 内容 |
|--------|----------|------|
| `expo-router.md` | `app/**` | 認証フロー、Typed Routes、レイアウト、New Architecture |
| `supabase.md` | `lib/**`, `hooks/use-auth*` | クライアント初期化、RLS、環境変数、DB スキーマ |
| `image-handling.md` | `lib/image*`, `app/**/write*` | 画像圧縮・Storage・表示 |
| `theming.md` | `constants/theme*`, `hooks/use-*-*` | テーマシステム・ダークモード |
| `eas-build.md` | `eas.json`, `app.json` | ビルドプロファイル設定 |
| `ticket-management.md` | `docs/**` | チケット TODO 管理ルール |
