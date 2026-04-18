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
- ポリシーは `(select auth.uid())` で囲んで使用。`auth.uid()` 直書きは行ごとに評価されるため遅い（advisor の `auth_rls_initplan` 警告）。`select` で囲むと initplan で 1 回キャッシュされる。
- FK 列には必ずインデックスを張る（`EXISTS (... WHERE user_id = (select auth.uid()))` 系のサブクエリ評価でも効く）。
- **`child_members` の SELECT:** `user_id = (select auth.uid())` の直接参照を使用。自己参照サブクエリ（`EXISTS (SELECT 1 FROM child_members ...)`）は RLS が再帰的に適用され読み取り不可になる。
- **`users` の SELECT:** 現状は `id = auth.uid()`（自分のみ）。家族メンバーの名前を UI に出す場合は `child_members` 経由で同じ子に属するユーザーを読めるよう policy 追加が必要（ticket 11 で対応予定）。
- **`.maybeSingle()` より `.limit(1)`:** PostgREST の特殊 Accept ヘッダーに依存するため、環境によっては挙動が揺れる。安全側は `.limit(1)` + 配列 index 参照。

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
- パス形式:
  - 日記写真: `{child_id}/{entry_date}/{uuid}.jpg`
  - 子どもアイコン: `children/{child_id}/{uuid}.jpg`
- 表示: 署名付き URL（1時間有効、`getSignedPhotoUrl` 経由）

### Storage RLS（重要）

- **SELECT / INSERT / UPDATE / DELETE の4種類すべて必要。** DELETE policy を入れ忘れると、アプリから削除したつもりでも silent に拒否されて孤児ファイルが残る。
- `diary-photos` は上記2パターンの親フォルダ位置が違うため、uuid キャストで判定するとアイコン側でキャスト失敗して拒否される。`CASE WHEN (storage.foldername(name))[1] = 'children' THEN [2] ELSE [1] END` で分岐して判定。
- `storage.objects` への直接 SQL DELETE は `storage.protect_delete()` トリガーでブロックされる。孤児ファイル清掃は Supabase Dashboard から。

## DB スキーマ

5テーブル構成: `users`, `children`, `child_members`, `invite_codes`, `diary_entries`。
詳細は `REQUIREMENTS.md` Section 7 を参照。
