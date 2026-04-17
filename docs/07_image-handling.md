# 07: 画像処理（圧縮 & アップロード）

## 概要

日記に添付する写真と子どもアイコン画像のクライアント側圧縮、Supabase Storage へのアップロード、署名付き URL による表示処理。

## 対応内容

### 画像選択

- [x] `expo-image-picker` インストール・設定
- [x] カメラロールからの写真選択 UI

### 画像圧縮

- [x] `expo-image-manipulator` インストール・設定
- [x] 圧縮処理の実装（長辺 1280px、JPEG 80%）
- [x] 圧縮ユーティリティ関数を `lib/image.ts` に作成

### アップロード

- [x] Supabase Storage へのアップロード関数作成（ArrayBuffer 方式）
- [x] Storage path: `diary-photos/{child_id}/{entry_date}/{uuid}.jpg`
- [x] 子どもアイコン path: `diary-photos/children/{child_id}/{uuid}.jpg`
- [x] アップロード後の `photo_url` を `diary_entries` に保存
- [x] アップロード後の `icon_url` を `children` に保存

### 画像表示

- [x] 署名付き URL（Signed URL、1時間有効）の取得関数
- [x] `expo-image` を使った画像表示コンポーネント（キャッシュ活用） ※既存 DiaryCard で使用

### エラーハンドリング

- [x] アップロード失敗時のリトライ UI（日記保存）
- [x] ネットワークエラー時の適切なフィードバック
- [x] 子どもアイコン失敗時はレコードを保持したまま通知（登録自体はロールバックしない）

## 実装メモ

- RN の `fetch(uri).blob()` は Android で空ファイル化する既知不具合があるため、`expo-file-system` v19 の `new File(uri).arrayBuffer()` で確実にバイト列を取得して Supabase に送る。
- 圧縮は元画像の縦横比を判定し、長辺が 1280px になるよう `width` / `height` を切り替える。
- 共通ユーティリティ `lib/image.ts`: `compressImage`, `uploadDiaryPhoto`, `uploadChildIcon`, `getSignedPhotoUrl`, `deletePhoto`。

## 参照

- REQUIREMENTS.md Section 8（画像処理仕様）
- CLAUDE.md Image Handling セクション
- `lib/image.ts`
