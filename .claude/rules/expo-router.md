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
    <Stack.Screen name="diary/[id]/index" options={{ presentation: 'modal', animation: 'slide_from_right', animationDuration: 350 }} />
    <Stack.Screen name="diary/[id]/edit" options={{ presentation: 'modal', animation: 'slide_from_right', animationDuration: 350 }} />
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

- `Stack.Screen` に `options={{ presentation: 'modal' }}` を指定。
- 動的ルートでモーダルを作る場合、フォルダ構造は `app/diary/[id]/index.tsx`（詳細）と `app/diary/[id]/edit.tsx`（編集）のように階層化。`Stack.Screen name="diary/[id]/index"` で登録する。
- **アニメーション調整:** Android の modal は `slide_from_bottom` が default だが、視覚的に `slide_from_right` + `animationDuration: 350` の方が馴染む場合がある（仕様次第で切替）。
- **セーフエリア:** フッター（削除/編集ボタン等）が Android のシステムナビゲーションと重なるため、モーダル画面のルートを `<SafeAreaView edges={['bottom']}>` で囲む。
- **モーダル内ナビゲーション:** `router.push('/diary/[id]/edit')` で編集モーダルを重ねる。`router.back()` で閉じて元モーダルへ戻る。

## useFocusEffect（タブ復帰時の再取得）

モーダルから戻った時にタブ画面を再取得する場合、`expo-router` から `useFocusEffect` を import する（`@react-navigation/native` ではない）:

```tsx
import { useFocusEffect } from 'expo-router'

useFocusEffect(
  useCallback(() => {
    if (childId) {
      fetchEntries()
      fetchOneYearAgo()
    }
  }, [childId, fetchEntries, fetchOneYearAgo]),
)
```

React Compiler が有効なので `useCallback` は厳密には不要だが、`useFocusEffect` の引数はメモ化する慣習で書く。

## unstable_settings.anchor

`app/_layout.tsx` で `anchor: '(tabs)'` を設定。タブグループがデフォルト遷移先。

## New Architecture & React Compiler

- `app.json` で `newArchEnabled: true` が有効。
- `experiments.reactCompiler: true` が有効。手動の `useMemo` / `useCallback` は基本不要（コンパイラが自動最適化）。ただし `useEffect` の依存配列はプリミティブ値を使うこと（オブジェクト参照の変化で不要な再実行を防ぐ）。

## ボタンのテーマ対応

tint 色をボタン背景に使う場合、テキスト色はハードコードせず `useThemeColor({}, 'background')` を使用。ダークモードでの視認性を確保。
