---
globs: app/**
---

# Expo Router ルール

## 認証フロー

`Stack.Protected` を使い、`guard` prop で認証状態に応じたルートの出し分けを行う。未認証ユーザーがディープリンクでアクセスしても適切にリダイレクトされる。

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

## Typed Routes

`app.json` の `experiments.typedRoutes: true` が有効。`router.push()` や `<Link>` の `href` にはリテラル型が効くため、存在しないルートへの遷移をコンパイル時に検出できる。

## レイアウトグループ

`(groupName)` ディレクトリで URL パスに影響を与えずにレイアウトをネストできる。認証/非認証で `(auth)` と `(app)` に分けるのが一般的なパターン。

## モーダル

`Stack.Screen` に `options={{ presentation: 'modal' }}` を指定。日記詳細画面などに使用。

## unstable_settings.anchor

レイアウト内のデフォルト遷移先を指定。タブグループの初期タブ制御に使用。

## プラットフォーム固有コード

- ファイル拡張子で分岐: `.ios.tsx`, `.android.tsx`, `.web.ts`, `.native.ts`
- `Platform.select()` や `Platform.OS` による分岐は同一ファイル内の小さな差異に使用
- 大きな実装差異がある場合はファイルを分ける

## New Architecture & React Compiler

- `app.json` で `newArchEnabled: true` が有効。Fabric レンダラーと TurboModules を使用。
- `experiments.reactCompiler: true` が有効。手動の `useMemo` / `useCallback` は不要（コンパイラが自動最適化）。
