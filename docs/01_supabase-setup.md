# 01: Supabase プロジェクトセットアップ & DB スキーマ

## 概要

Supabase プロジェクトの初期構築。データベーステーブル作成、RLS ポリシー設定、Storage バケット作成を行う。

## 背景

すべての機能の基盤となるバックエンド。先にスキーマを確定させることで、以降の画面開発がスムーズに進む。

## 対応内容

### テーブル作成

- [x] `users` テーブル作成（id, name, avatar_url, created_at）
- [x] `children` テーブル作成（id, owner_id, name, birthday, icon_url, created_at）
- [x] `child_members` テーブル作成（id, child_id, user_id, role, joined_at / UNIQUE(child_id, user_id)）
- [x] `invite_codes` テーブル作成（id, child_id, code, created_by, expires_at, used, created_at）
- [x] `diary_entries` テーブル作成（id, child_id, author_id, entry_date, text, photo_url, created_at, updated_at / UNIQUE(child_id, author_id, entry_date)）

### RLS ポリシー

- [x] `users`: 自分のレコードのみ読み書き可能
- [x] `children`: `child_members` 経由で所属ユーザーのみ読み取り可能、`owner` のみ更新可能
- [x] `child_members`: 所属ユーザーのみ読み取り可能、`owner` のみ追加・削除可能
- [x] `invite_codes`: `owner` のみ作成可能、コード入力による参加は全ユーザー可能
- [x] `diary_entries`: `child_members` に所属するユーザーのみ読み書き可能、削除は自分の日記のみ

### Storage

- [x] `diary-photos` バケット作成（プライベート設定）
- [x] Storage の RLS ポリシー設定（`child_members` 所属ユーザーのみアップロード・読み取り可能）

### クライアント初期化

- [x] `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill` インストール
- [x] `lib/supabase.ts` 作成（Supabase クライアント初期化）
- [x] 環境変数 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` を `.env.local` で管理
- [x] `npx supabase gen types typescript` で型定義生成、`Database` 型を createClient に適用

## 参照

- REQUIREMENTS.md Section 7（データベース設計）
- CLAUDE.md Best Practices（Supabase クライアント初期化 / RLS）
