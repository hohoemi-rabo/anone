# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

「あのね。」- 育児日記アプリ（Phase 1 MVP）。0〜3歳の子どもを持つ母親向け。「通知ゼロ、プレッシャーゼロ」がコンセプト。Phase 1 は Android（Google Play Store）のみ。

詳細な仕様は `REQUIREMENTS.md` を参照。

## Tech Stack

- **Frontend:** Expo (React Native) + TypeScript (strict mode)
- **Routing:** Expo Router (file-based routing, `app/` directory)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Authentication:** Google OAuth via Supabase Auth
- **Image Storage:** Supabase Storage (private bucket, signed URLs)
- **Build/Deploy:** EAS Build → Google Play Store

## Commands

```bash
npm start          # Expo開発サーバー起動
npm run android    # Androidエミュレータで起動
npm run ios        # iOSシミュレータで起動
npm run web        # Web版起動
npm run lint       # ESLint実行
```

テストフレームワークは未導入。

## Architecture

### Routing (Expo Router)

```
app/
├── _layout.tsx           # Root layout (ThemeProvider + Stack)
├── modal.tsx             # Modal screen
└── (tabs)/
    ├── _layout.tsx       # Bottom tab navigator
    ├── index.tsx         # Home tab
    └── explore.tsx       # Explore tab
```

Phase 1 の画面構成（REQUIREMENTS.md Section 4）:
- 認証画面 → 子ども登録（初回）→ ホーム（日記一覧）/ 書く / 思い出 / 設定

### Theming

- `constants/theme.ts`: Colors (light/dark) と Fonts (platform-specific) を定義
- `hooks/use-color-scheme.ts`: システムカラースキーム取得（`.web.ts` で Web 向け分岐）
- `hooks/use-theme-color.ts`: テーマに応じた色取得

### Platform-Specific Files

iOS 固有の実装は `.ios.tsx` サフィックス、Web 固有は `.web.ts` サフィックスを使用。

### Path Alias

`@/*` → プロジェクトルート (`tsconfig.json` で設定済み)

## Database Schema (Supabase)

5テーブル構成: `users`, `children`, `child_members`, `invite_codes`, `diary_entries`。
詳細は `REQUIREMENTS.md` Section 7 を参照。

- RLS: `child_members` に所属するユーザーのみ日記の読み書き可能
- `diary_entries`: `UNIQUE(child_id, author_id, entry_date)` で1人1日1件制約

## Image Handling

- クライアント側で `expo-image-manipulator` により圧縮（長辺1280px, JPEG 80%）
- Storage path: `diary-photos/{child_id}/{entry_date}/{uuid}.jpg`
- 署名付きURL（1時間有効）で表示

## Key Constraints (Phase 1)

- 1日1件の日記、写真は1枚のみ
- 招待コード: 6桁英数字、24時間有効、最大5人共有
- テキスト: 最大500文字
- 通知機能なし、ゲーミフィケーションなし

---

## Best Practices (Expo / Supabase)

### Expo Router

- **認証フロー:** `Stack.Protected` を使い、`guard` prop で認証状態に応じたルートの出し分けを行う。未認証ユーザーがディープリンクでアクセスしても適切にリダイレクトされる。
  ```tsx
  <Stack>
    <Stack.Protected guard={isLoggedIn}>
      <Stack.Screen name="(tabs)" />
    </Stack.Protected>
    <Stack.Protected guard={!isLoggedIn}>
      <Stack.Screen name="sign-in" />
    </Stack.Protected>
  </Stack>
  ```
- **Typed Routes:** `app.json` の `experiments.typedRoutes: true` が有効。`router.push()` や `<Link>` の `href` にはリテラル型が効くため、存在しないルートへの遷移をコンパイル時に検出できる。
- **レイアウトグループ:** `(groupName)` ディレクトリで URL パスに影響を与えずにレイアウトをネストできる。認証/非認証で `(auth)` と `(app)` に分けるのが一般的なパターン。
- **モーダル:** `Stack.Screen` に `options={{ presentation: 'modal' }}` を指定。日記詳細画面などに使用。
- **unstable_settings.anchor:** レイアウト内のデフォルト遷移先を指定。タブグループの初期タブ制御に使用。

### 環境変数

- `EXPO_PUBLIC_` プレフィックスを付けた環境変数のみクライアントコードで利用可能。
- Supabase URL / Anon Key は `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` として管理。
- Anon Key はクライアントに露出しても安全（RLS で保護されるため）。

### Supabase クライアント初期化

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

### Google OAuth (React Native)

- `@react-native-google-signin/google-signin` を使用し、ネイティブ Google Sign-In フローを実装。
- Web Client ID を Google Cloud Console から取得し `GoogleSignin.configure()` に設定。
- 取得した ID Token を `supabase.auth.signInWithIdToken()` に渡して認証。

### Row Level Security (RLS)

- すべてのテーブルで RLS を有効化。Anon Key が露出しても安全なアーキテクチャを維持。
- ポリシーは `auth.uid()` を使用してユーザーを識別。
- `child_members` テーブルを介した間接的なアクセス制御パターン（例: `EXISTS (SELECT 1 FROM child_members WHERE child_id = diary_entries.child_id AND user_id = auth.uid())`）。

### EAS Build

- `eas.json` でビルドプロファイルを `development` / `staging` / `production` に分割。
- `extends` を使ってベースプロファイルから共通設定を継承。
- 環境変数はプロファイルごとに `env` フィールドで管理。

### New Architecture & React Compiler

- `app.json` で `newArchEnabled: true` が有効。Fabric レンダラーと TurboModules を使用。
- `experiments.reactCompiler: true` が有効。手動の `useMemo` / `useCallback` は不要（コンパイラが自動最適化）。

### プラットフォーム固有コード

- ファイル拡張子で分岐: `.ios.tsx`, `.android.tsx`, `.web.ts`, `.native.ts`
- `Platform.select()` や `Platform.OS` による分岐は同一ファイル内の小さな差異に使用。
- 大きな実装差異がある場合はファイルを分ける。
