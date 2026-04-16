# 12: Google OAuth 実装（最終）

## 概要

開発用 Email/Password 認証を Google OAuth に差し替える。本番リリース前の最終ステップ。

## 背景

ローカル開発のしやすさを優先し、認証は最後に差し替える。02_auth-dev.md で認証ロジックを `useAuth` フックに集約しているため、変更箇所は限定的。

## 対応内容

### セットアップ

- [ ] Google Cloud Console でプロジェクト作成・OAuth 同意画面設定
- [ ] Android 用 OAuth Client ID 取得
- [ ] Supabase Dashboard で Google Auth Provider を有効化・Client ID/Secret 設定

### 実装

- [ ] `@react-native-google-signin/google-signin` インストール
- [ ] `app.json` の plugins に google-signin 設定追加
- [ ] `hooks/use-auth.ts` の signIn を Google Sign-In フローに差し替え
- [ ] `app/sign-in.tsx` を Google ログインボタン UI に差し替え
- [ ] `app/sign-up.tsx` 削除（Google OAuth では不要）

### テスト

- [ ] EAS Development Build でのネイティブ Google Sign-In 動作確認
- [ ] 新規ユーザーのサインアップフロー確認（users テーブル作成 → 子ども登録画面）
- [ ] 既存ユーザーの再ログインフロー確認
- [ ] トークンリフレッシュの動作確認

### クリーンアップ

- [ ] Email/Password 認証関連のコード・UI を完全削除
- [ ] Supabase Dashboard で Email Auth Provider を無効化（本番環境）

## 参照

- REQUIREMENTS.md Section 5-1（認証画面）
- CLAUDE.md Best Practices（Google OAuth）
