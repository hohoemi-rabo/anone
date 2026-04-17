---
globs: app/**
---

# Expo Router ルール

## 認証フロー（3段階 Stack.Protected）

`Stack.Protected` を使い、`guard` prop で3段階のルート出し分けを行う:

```tsx
<Stack>
  <Stack.Protected guard={isLoggedIn && auth.hasChild}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
  </Stack.Protected>
  <Stack.Protected guard={isLoggedIn && !auth.hasChild}>
    <Stack.Screen name="child-register" options={{ headerShown: false }} />
  </Stack.Protected>
  <Stack.Protected guard={!isLoggedIn}>
    <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    <Stack.Screen name="sign-up" />
  </Stack.Protected>
</Stack>
```

認証状態は `useAuthProvider()` が提供する `session` と `hasChild` で制御。`AuthContext.Provider` でラップ。

## タブ構成（4タブ）

`app/(tabs)/_layout.tsx` で定義:
- `index` — ホーム（日記一覧）
- `write` — 書く（日記作成）
- `memories` — 思い出（振り返り）
- `settings` — 設定

## Typed Routes

`app.json` の `experiments.typedRoutes: true` が有効。`router.push()` や `<Link>` の `href` にはリテラル型が効く。

## モーダル

`Stack.Screen` に `options={{ presentation: 'modal' }}` を指定。日記詳細画面などに使用。

## unstable_settings.anchor

`app/_layout.tsx` で `anchor: '(tabs)'` を設定。タブグループがデフォルト遷移先。

## New Architecture & React Compiler

- `app.json` で `newArchEnabled: true` が有効。
- `experiments.reactCompiler: true` が有効。手動の `useMemo` / `useCallback` は基本不要（コンパイラが自動最適化）。ただし `useEffect` の依存配列はプリミティブ値を使うこと（オブジェクト参照の変化で不要な再実行を防ぐ）。

## ボタンのテーマ対応

tint 色をボタン背景に使う場合、テキスト色はハードコードせず `useThemeColor({}, 'background')` を使用。ダークモードでの視認性を確保。
