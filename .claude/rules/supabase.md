---
globs: lib/**,hooks/use-auth*,supabase/**
---

# Supabase ルール

## 環境変数

- `EXPO_PUBLIC_` プレフィックスを付けた環境変数のみクライアントコードで利用可能。
- Supabase URL / Anon Key は `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` として管理。
- Anon Key はクライアントに露出しても安全（RLS で保護されるため）。

## クライアント初期化

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,  // React Native では false 必須
    },
  }
)
```

- **`detectSessionInUrl: false`**: React Native にはブラウザ URL がないため必須。
- **AsyncStorage**: セッションの永続化に使用。アプリ再起動後もログイン状態を保持。
- **型安全性**: `npx supabase gen types typescript` で生成した `Database` 型を `createClient<Database>()` に渡し、エンドツーエンドの型安全性を確保。

## Row Level Security (RLS)

- すべてのテーブルで RLS を有効化。Anon Key が露出しても安全なアーキテクチャを維持。
- ポリシーは `auth.uid()` を使用してユーザーを識別。
- `child_members` テーブルを介した間接的なアクセス制御パターン（例: `EXISTS (SELECT 1 FROM child_members WHERE child_id = diary_entries.child_id AND user_id = auth.uid())`）。

## Google OAuth (React Native)

- `@react-native-google-signin/google-signin` を使用し、ネイティブ Google Sign-In フローを実装。
- Web Client ID を Google Cloud Console から取得し `GoogleSignin.configure()` に設定。
- 取得した ID Token を `supabase.auth.signInWithIdToken()` に渡して認証。
- **注意:** 開発中は Email/Password 認証を使用。Google OAuth は最後に差し替え。

## DB スキーマ

5テーブル構成: `users`, `children`, `child_members`, `invite_codes`, `diary_entries`。
詳細は `REQUIREMENTS.md` Section 7 を参照。
