# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

「あのね。」- 育児日記アプリ（Phase 1 MVP）。0〜3歳の子どもを持つ母親向け。「通知ゼロ、プレッシャーゼロ」がコンセプト。Phase 1 は Android（Google Play Store）のみ。

詳細な仕様は `REQUIREMENTS.md` を参照。

## Tech Stack

- **Frontend:** Expo 54 (React Native 0.81) + TypeScript (strict mode)
- **Routing:** Expo Router v6 (file-based routing, `app/` directory)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Authentication:** 開発中は Email/Password、リリース前に Google OAuth に差し替え（チケット12）
- **Build/Deploy:** EAS Build → Google Play Store
- **Path Alias:** `@/*` → プロジェクトルート
- **React Compiler:** 有効（`useMemo` / `useCallback` の手動最適化は基本不要）

## Commands

```bash
npm start          # Expo開発サーバー起動
npm run android    # Androidエミュレータで起動
npm run ios        # iOSシミュレータで起動
npm run web        # Web版起動
npm run lint       # ESLint実行
```

## Project Structure

```
app/
├── _layout.tsx          # Root layout (AuthProvider + Stack.Protected 3段階)
├── sign-in.tsx          # ログイン画面（開発用 Email/Password）
├── sign-up.tsx          # アカウント作成画面（開発用）
├── child-register.tsx   # 子ども登録画面（初回オンボーディング）
├── child-edit.tsx       # 子ども情報編集モーダル（owner のみ）
├── invite-issue.tsx     # 招待コード発行モーダル（owner のみ）
├── invite-join.tsx      # 招待コード入力モーダル
├── members.tsx          # メンバー管理モーダル（owner のみ）
├── modal.tsx            # モーダル画面（placeholder）
├── diary/[id]/
│   ├── index.tsx        # 日記詳細モーダル
│   └── edit.tsx         # 日記編集モーダル
└── (tabs)/
    ├── _layout.tsx      # BottomTab 4タブ構成
    ├── index.tsx        # ホーム（日記一覧）
    ├── write.tsx        # 書く（日記作成）
    ├── memories.tsx     # 思い出（振り返り）
    └── settings.tsx     # 設定（子ども情報 + ログアウト + バージョン）
lib/
├── supabase.ts          # Supabase クライアント初期化
├── database.types.ts    # 自動生成された型定義
├── age.ts               # 生後日数・年齢計算ユーティリティ
└── image.ts             # 画像圧縮・アップロード・署名URL・削除・タイムアウト
hooks/
├── use-auth.ts          # 認証コンテキスト（session, hasChild, signIn/Up/Out）
├── use-child.ts         # 子ども情報取得フック（child, role, refresh）
├── use-family-members.ts # 同 child のメンバー一覧（SECURITY DEFINER 関数経由）
├── use-color-scheme.ts  # システムカラースキーム
└── use-theme-color.ts   # テーマ色取得
components/
├── child-header.tsx     # 子どもの名前 + 生後日数ヘッダー
├── diary-card.tsx       # 日記カードコンポーネント
├── author-avatar.tsx    # イニシャル色付き円（家族メンバー著者表示用）
├── themed-text.tsx      # テーマ対応テキスト
├── themed-view.tsx      # テーマ対応ビュー
└── memories/
    ├── types.ts                     # MemoriesEntry 型
    ├── segmented-control.tsx        # 3ボタン切替UI
    ├── one-year-ago-section.tsx     # 1年前の今日
    ├── timeline-section.tsx         # 月別グルーピング SectionList
    └── calendar-section.tsx         # react-native-calendars
```

## Authentication Flow (3-tier Route Protection)

```
未認証 → sign-in / sign-up
認証済み & 子ども未登録 → child-register
認証済み & 子ども登録済み → (tabs) / modal
```

`app/_layout.tsx` で `Stack.Protected` を3段階に分岐。`useAuth` フックの `session` と `hasChild` で制御。

## Supabase Project

- **Project ID:** `qzrccoduejyqtgiavkel`
- **Region:** ap-northeast-1（東京）
- **環境変数:** `.env.local` で管理（`.gitignore` 対象）

### DB Functions

- `create_child_with_owner(child_name, child_birthday, child_icon_url)` — 子ども登録 + owner メンバー一括作成（SECURITY DEFINER）
- `handle_new_user()` — Auth トリガーで `auth.users` → `public.users` に自動レコード作成
- `create_invite_code(p_child_id)` — 招待コード発行（owner のみ、6文字hex、24h expiry、衝突リトライ）
- `redeem_invite_code(p_code)` — 招待コード受け入れ（有効性 + 上限5人 + 重複チェック）
- `get_family_members(p_child_id)` — 同 child のメンバー一覧（child_members SELECT RLS の自己限定を迂回）
- `remove_family_member(p_child_id, p_user_id)` — メンバー削除（owner のみ、自身不可）

## Ticket Management

チケットは `docs/01_*.md` 〜 `docs/13_*.md` で管理。TODO ルールの詳細は `.claude/rules/ticket-management.md` を参照。

### 進捗状況

| # | チケット | 状態 |
|---|---------|------|
| 01 | Supabase セットアップ & DB スキーマ | ✅ 完了 |
| 02 | 認証基盤（Email/Password） | ✅ 完了 |
| 03 | 子ども登録画面 | ✅ 完了 |
| 04 | タブナビゲーション構成 | ✅ 完了 |
| 05 | 日記作成画面 | ✅ 完了 |
| 06 | ホーム画面（日記一覧） | ✅ 完了 |
| 07 | 画像処理 | ✅ 完了 |
| 08 | 日記詳細モーダル | ✅ 完了 |
| 09 | 思い出画面 | ✅ 完了 |
| 10 | 設定画面 | 🟡 部分完了（ポリシーリンクは ticket 13 待ち） |
| 11 | 家族共有 | ✅ 完了 |
| 12 | Google OAuth | 未着手 |
| 13 | EAS Build & リリース | 未着手 |

> Google OAuth（12）はローカルテストの利便性のため最後に実装。開発中は Email/Password 認証（02）を使用。

## Rules (.claude/rules/)

詳細なベストプラクティスは `.claude/rules/` に分離。対象ファイルを触るときだけ自動で読み込まれる:

| ルール | 対象 glob | 内容 |
|--------|----------|------|
| `expo-router.md` | `app/**` | 認証フロー、Typed Routes、レイアウト、New Architecture |
| `supabase.md` | `lib/**`, `hooks/use-auth*` | クライアント初期化、RLS、環境変数、DB スキーマ |
| `image-handling.md` | `lib/image*`, `app/**/write*`, `app/child-register*`, `app/diary/**` | 画像圧縮・Storage・表示 |
| `theming.md` | `constants/theme*`, `hooks/use-*-*` | テーマシステム・ダークモード |
| `eas-build.md` | `eas.json`, `app.json` | ビルドプロファイル設定 |
| `ticket-management.md` | `docs/**` | チケット TODO 管理ルール |

## Known Issues & Learnings

- **AsyncStorage + Web SSR:** `lib/supabase.ts` で `Platform.OS` 分岐し、Web 環境では AsyncStorage を使わない（`window is not defined` エラー回避）
- **child_members RLS:** 自己参照サブクエリは RLS が再帰的に適用され読み取り不可になる。`user_id = auth.uid()` の直接参照を使うこと
- **ボタンテキスト色:** tint 色をボタン背景に使う場合、テキスト色は `useThemeColor({}, 'background')` でコントラストを確保
- **FlatList onEndReached:** `hasMore` は `false` で初期化。初回フェッチ前の重複取得を防ぐ
- **UUID 生成:** RN ランタイムは `globalThis.crypto` を持たない。`expo-crypto` の `randomUUID()` を使う
- **画像アップロード:** Expo Go で動く構成は `expo-file-system/legacy` の `readAsStringAsync(..., Base64)` + `atob` で ArrayBuffer 変換。`expo-file-system` v19 の新 `File` API は Expo Go 未対応
- **`.maybeSingle()` 注意:** PostgREST の Accept ヘッダー依存で環境によっては挙動が揺れる。安全側は `.limit(1)` + 配列 index 参照
- **Storage RLS 複数パス対応:** `diary-photos` バケットは日記写真 (`{child_id}/...`) と子どもアイコン (`children/{child_id}/...`) で親フォルダ位置が違う。RLS は `CASE WHEN (storage.foldername(name))[1] = 'children' THEN [2] ELSE [1]` で分岐。uuid キャストだと icon パスで失敗して拒否される
- **Storage DELETE policy 必須:** INSERT/SELECT のみだと削除が silent に拒否され、DB 行は消えるが画像は残る（孤児化）。`deletePhoto` は error を warn で握るため気付きにくい
- **storage.objects 直接 DELETE 不可:** `storage.protect_delete()` トリガーで SQL 直接削除はブロック。孤児ファイルは Supabase Dashboard の Storage UI で手動削除
- **Android モーダルのセーフエリア:** `presentation: 'modal'` のフッター（削除/編集ボタン等）は `SafeAreaView edges={['bottom']}` で囲まないとシステムナビゲーションと重なる
- **タブ復帰時の再取得:** `@react-navigation/native` ではなく `expo-router` から `useFocusEffect` を import。モーダルから戻った時に一覧再取得する
- **`Alert.alert` ボタン callback は Web で発火しない:** React Native Web の `Alert.alert(title, msg, [{ text, onPress }])` は内部で `window.alert()` にフォールバックし、**onPress コールバックが呼ばれない**。ナビゲーション処理は Alert の前後に直接書くこと（例: `router.back(); Alert.alert(...)`）
