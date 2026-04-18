---
globs: constants/theme*,hooks/use-color-scheme*,hooks/use-theme-color*,components/themed-*,components/child-header*,components/diary-card*,components/author-avatar*,components/memories/segmented-control*,app/_layout*,app/(tabs)/_layout*
---

# テーマ・スタイリング ルール

## カラーパレット（「あのね。」ブランド）

`constants/theme.ts` で定義。**ライトモード固定**（`app.json` の `userInterfaceStyle: "light"`）。dark 値は将来の保険。

| トークン | Light | 役割 |
|---|---|---|
| `text` | `#2D3E50` | ダークネイビー本文 |
| `background` | `#FFFFFF` | メインキャンバス（白） |
| `surface` | `#E8A595` | ピーチ。**ヘッダー（ChildHeader） + ボトムタブ** |
| `tint` | `#D8607A` | ディープローズピンク。**全 CTA / リンク / SegmentedControl 選択中** |
| `onTint` | `#FFFFFF` | tint 背景上のテキスト・アイコン色 |
| `card` | `#FFFFFF` | DiaryCard / SegmentedControl コンテナ |
| `border` | `#E5E7EB` | 白bg上で見える境界線 |
| `accent` | `#5891B8` | 落ち着いたブルー（差し色・タグ用、現状未使用） |
| `icon` | `#7C8B9A` | 補助テキスト（クールグレー） |
| `tabIconDefault` | `#B89B91` | タブ非選択（ピーチ surface 上で控えめ） |
| `tabIconSelected` | `#2D3E50` | タブ選択中（ピーチ上で映えるダークネイビー） |

### 設計の世界観

**3層サンドイッチ**: ピーチ帯（status bar込みヘッダー）→ 白いメイン → ピーチ帯（タブバー）

CTA は `tint`（ピンク）で必ず統一。ボタン背景に `tint` を使う場合、テキスト色は **`onTint`** を使用（`backgroundColor` ではない。背景色変更に追従させない）。

## Radius / Shadow トークン

`constants/theme.ts` で `Radius` と `Shadow` も export。

```ts
Radius.sm = 8
Radius.md = 12
Radius.lg = 16
Radius.xl = 20
Radius.pill = 999

Shadow.card = {
  shadowColor, shadowOffset, shadowOpacity: 0.08,
  shadowRadius: 8, elevation: 2,
}
```

カードや浮かせたい UI は `Shadow.card` を spread して使う。

## ナビゲーションテーマの上書き

`app/_layout.tsx` で `@react-navigation/native` の `DefaultTheme` をそのまま使うと、Stack スクリーンの背景に `rgb(242, 242, 242)`（ほぼ白）が当たり、`Colors.background` が反映されない。

**対策**: 独自に `navLightTheme` / `navDarkTheme` を作って `Colors` から `background / card / text / primary / border` をマッピングし、`ThemeProvider` に渡す。

```tsx
const navLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    primary: Colors.light.tint,
    border: Colors.light.border,
  },
}
```

## 共通コンポーネント

- **`ThemedText`** — テーマ対応テキスト。`title` / `subtitle` 型は `Fonts.rounded`（iOS は SF Pro Rounded）を適用
- **`ThemedView`** — テーマ対応ビュー（背景色自動）
- **`ChildHeader`** — 子ども情報ヘッダー。**`SafeAreaView edges={['top']}` を内包**し、ピーチ surface 背景を持つ。タブ画面側は plain `<View>` で囲むだけ（`SafeAreaView` 不要）
- **`DiaryCard`** — 白カード + ボーダー + `Shadow.card`。**ヘッダーは日付（メイン）+ 月齢（サブ）の縦積み**で写真サムネと取り合いしない
  - サムネイル: `flex: 4`（カード幅の40%）の View で wrap、Image は `position: 'absolute'` で wrap いっぱいに描画（Image 直に flex を当てると intrinsic サイズに引っ張られる）
  - `style?: StyleProp<ViewStyle>` で外側スタイルを上書き可（タイムラインで `marginHorizontal: 0` 等）
- **`AuthorAvatar`** — tint 円 + 白イニシャル。`onTint` 参照
- **`SegmentedControl`** — フローティングカプセル + **スライディングインジケーター**（`Animated.spring` + `useNativeDriver: true`）。ラベル固定、indicator のみ translateX で移動

## タブ画面のレイアウト規約

`(tabs)/index.tsx` / `write.tsx` / `memories.tsx` は `ChildHeader` が safe area top を扱うので、画面ルートは plain `<View style={{ flex: 1 }}>` で囲む（`SafeAreaView edges={['top']}` は不要）。

`settings.tsx` は `ChildHeader` を持たないので、独自に `SafeAreaView edges={['top']}` を `surface` 色で囲み、内側 ScrollView は `background` 色（白）にする。

## タブバーのスタイリング

`(tabs)/_layout.tsx` で `tabBarStyle.backgroundColor = surface`（ピーチ）+ `borderTopWidth: 0` + `elevation: 0`。`tabBarActiveTintColor` / `tabBarInactiveTintColor` は palette の `tabIconSelected` / `tabIconDefault` を明示。

## アンチパターン

- ❌ `useThemeColor({}, 'background')` をボタン文字色に使う → `onTint` を使う
- ❌ ハードコードされた `'#0a7ea4'` 等の色 → `useThemeColor` 経由
- ❌ Image 直に `flex: number` を指定 → View で wrap してから flex を当てる
- ❌ タブ画面で `SafeAreaView edges={['top']}` を使う（ChildHeader と二重になる）
