---
globs: constants/theme*,hooks/use-color-scheme*,hooks/use-theme-color*,components/themed-*
---

# テーマ・スタイリング ルール

## テーマシステム

- `constants/theme.ts`: Colors (light/dark) と Fonts (platform-specific) を定義
- `hooks/use-color-scheme.ts`: システムカラースキーム取得（`.web.ts` で Web 向け分岐）
- `hooks/use-theme-color.ts`: テーマに応じた色取得

## パターン

- ダークモード対応は `useThemeColor` フックを通じて行う
- コンポーネントに直接カラーコードをハードコードしない
- ボタン背景に `tint` を使用する場合、テキスト色は `useThemeColor({}, 'background')` で取得（ダークモードで tint が白、テキストも白だと見えなくなる）

## 共通コンポーネント

- `ThemedText`: テーマ対応テキスト（type: default, title, defaultSemiBold, subtitle, link）
- `ThemedView`: テーマ対応ビュー（背景色自動）
- `ChildHeader`: 子どもの名前 + 生後日数/年齢ヘッダー（`useChild` + `getAgeDisplay` 使用）
- `DiaryCard`: 日記カード（日付、年齢、テキスト3行省略、サムネイル）
