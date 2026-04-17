# 08: 日記詳細モーダル

## 概要

日記カードをタップした際に表示される詳細画面。モーダルプレゼンテーションで表示。編集は別モーダルに分離。

## 対応内容

### 画面実装

- [x] `app/diary/[id]/index.tsx` 作成（動的ルート、詳細表示）
- [x] `presentation: 'modal'` でスタックに登録
- [x] 日付 + 生後〇日表示
- [x] 写真フルワイド表示
- [x] テキスト全文表示
- [x] 著者情報（自分以外のメンバーのみ表示、users 名取得不可時は「家族のメンバー」）

### 操作

- [x] 編集ボタン → 編集モーダル (`/diary/[id]/edit`) へ遷移（自分の日記のみ表示）
- [x] 削除ボタン → 確認ダイアログ → 削除処理（自分の日記のみ、photo 含む）
- [x] 削除後にモーダル閉じて一覧へ戻り、`useFocusEffect` で再取得

### 編集機能

- [x] `app/diary/[id]/edit.tsx` を新規作成（「書く」タブとは分離）
- [x] 既存の text / photo_url / entry_date を初期値にセット
- [x] 写真の追加・差し替え・削除に対応（旧写真は保存成功後に Storage から削除）
- [x] 更新処理（UPDATE、`updated_at` は Supabase 側 trigger に任せる）

## 実装メモ

- ルート構造: `app/diary/[id]/index.tsx`（詳細）, `app/diary/[id]/edit.tsx`（編集）
- 詳細モーダルで `useFocusEffect` を使い、編集後に戻ってきた際に最新データを再取得
- ホーム画面も `useFocusEffect` を入れ、モーダルから戻った時に一覧を再取得
- 編集権限チェック: マウント時に `author_id !== session.user.id` なら Alert を出して `router.back()`
- 写真状態は `PhotoState` union 型で `none | existing | new` を扱い、差し替え時の旧パス削除を確実に

## 参照

- REQUIREMENTS.md Section 5-7（日記詳細モーダル）
- `lib/image.ts`（署名URL・アップロード・削除）
- `lib/age.ts`（entry 日付時点の生後日数）
