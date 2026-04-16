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
