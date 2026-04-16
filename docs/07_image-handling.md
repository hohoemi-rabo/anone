# 07: 画像処理（圧縮 & アップロード）

## 概要

日記に添付する写真のクライアント側圧縮と Supabase Storage へのアップロード処理。

## 対応内容

### 画像選択

- [ ] `expo-image-picker` インストール・設定
- [ ] カメラロールからの写真選択 UI

### 画像圧縮

- [ ] `expo-image-manipulator` インストール・設定
- [ ] 圧縮処理の実装（長辺 1280px、JPEG 80%）
- [ ] 圧縮ユーティリティ関数を `lib/image.ts` に作成

### アップロード

- [ ] Supabase Storage へのアップロード関数作成
- [ ] Storage path: `diary-photos/{child_id}/{entry_date}/{uuid}.jpg`
- [ ] アップロード後の `photo_url` を `diary_entries` に保存

### 画像表示

- [ ] 署名付き URL（Signed URL、1時間有効）の取得関数
- [ ] `expo-image` を使った画像表示コンポーネント（キャッシュ活用）

### エラーハンドリング

- [ ] アップロード失敗時のリトライ UI
- [ ] ネットワークエラー時の適切なフィードバック

## 参照

- REQUIREMENTS.md Section 8（画像処理仕様）
- CLAUDE.md Image Handling セクション
