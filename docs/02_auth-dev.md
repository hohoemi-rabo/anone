# 02: 認証基盤（開発用 Email/Password）

## 概要

開発・テスト用に Email/Password 認証を実装する。Google OAuth は最後のチケット（11）で差し替える。

## 背景

Google OAuth を先に実装するとローカルでのテストが困難になる。開発中は Supabase の Email/Password 認証を使い、認証フローの骨格を先に作る。Google OAuth 差し替え時の影響範囲を最小化するため、認証ロジックはカスタムフック (`useAuth`) に集約する。

## 対応内容

### 認証フック

- [x] `hooks/use-auth.ts` 作成（signIn, signUp, signOut, session, isLoading を提供）
- [x] `AuthProvider` コンテキスト作成（セッション状態をアプリ全体に配信）
- [x] Supabase `onAuthStateChange` でセッション変更を監視

### 認証画面

- [x] `app/sign-in.tsx` 作成（Email/Password ログインフォーム）
- [x] `app/sign-up.tsx` 作成（開発用アカウント作成画面）

### ルート保護

- [x] `app/_layout.tsx` を `Stack.Protected` パターンに変更
- [x] 認証済み → `(tabs)` グループへ、未認証 → `sign-in` へ
- [x] ディープリンクからのアクセスも認証チェックされることを確認

### users テーブル連携

- [x] サインアップ時に `users` テーブルにレコード作成（Supabase Auth trigger または手動 insert）
- [x] セッションから `user.id` を取得し各画面で利用できるようにする

## 差し替え方針

11_google-oauth.md で Email/Password を Google OAuth に差し替える際、変更箇所は以下に限定される:
- `hooks/use-auth.ts` 内の signIn/signUp 実装
- `app/sign-in.tsx` の UI（ボタン差し替え）
- `app/sign-up.tsx` の削除

## 参照

- REQUIREMENTS.md Section 5-1（認証画面）
- CLAUDE.md Best Practices（Expo Router 認証フロー）
