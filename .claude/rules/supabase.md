---
globs: lib/**,hooks/use-auth*,hooks/use-child*
---

# Supabase ルール

## 環境変数

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` を `.env.local` で管理。
- Anon Key はクライアントに露出しても安全（RLS で保護されるため）。

## クライアント初期化

`lib/supabase.ts` で初期化済み。Web SSR 対応のため AsyncStorage は Native 環境でのみ動的ロード:

```typescript
const getStorage = () => {
  if (Platform.OS === 'web') return undefined
  return require('@react-native-async-storage/async-storage').default
}
```

- **`detectSessionInUrl: false`**: React Native では必須。
- **`persistSession`**: Native のみ `true`（Web SSR では `false`）。
- **型安全性**: `Database` 型を `createClient<Database>()` に渡す。型再生成は MCP `generate_typescript_types` を使用。

## Row Level Security (RLS)

- すべてのテーブルで RLS を有効化。
- ポリシーは `auth.uid()` を使用してユーザーを識別。
- **注意:** `child_members` の SELECT ポリシーは `user_id = auth.uid()` の直接参照を使用。自己参照サブクエリ（`EXISTS (SELECT 1 FROM child_members ...)`）は RLS が再帰的に適用され読み取り不可になるため使わないこと。

## DB Functions (SECURITY DEFINER)

- **`create_child_with_owner(child_name, child_birthday, child_icon_url)`** — 子ども登録と owner メンバーを一括作成。RLS の鶏と卵問題を回避。
- **`handle_new_user()`** — `auth.users` への INSERT トリガーで `public.users` にレコード自動作成。

## 認証フック (`hooks/use-auth.ts`)

- `AuthContext` + `useAuth()` + `useAuthProvider()` の構成。
- `session`, `isLoading`, `hasChild`, `signIn`, `signUp`, `signOut`, `refreshChildStatus` を提供。
- `onAuthStateChange` でセッション変更を監視し、`child_members` の存在チェックも連動。

## 子ども情報フック (`hooks/use-child.ts`)

- `useChild()` で現在ログインユーザーの子ども情報（id, name, birthday, icon_url）を取得。
- `child_members` → `children` の2段階クエリ。

## Storage

- バケット: `diary-photos`（プライベート）
- パス: `{child_id}/{entry_date}/{uuid}.jpg`
- 表示: 署名付き URL（1時間有効）

## DB スキーマ

5テーブル構成: `users`, `children`, `child_members`, `invite_codes`, `diary_entries`。
詳細は `REQUIREMENTS.md` Section 7 を参照。
