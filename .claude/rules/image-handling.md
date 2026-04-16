---
globs: lib/image*,components/**/image*,components/**/photo*,app/**/write*
---

# 画像処理ルール

## 圧縮仕様

- クライアント側で `expo-image-manipulator` により圧縮
- 長辺 1280px にリサイズ
- JPEG 80% 品質
- 圧縮後の目安: 200〜400KB

## Storage

- Supabase Storage バケット: `diary-photos`（プライベート設定）
- Storage path: `diary-photos/{child_id}/{entry_date}/{uuid}.jpg`
- 署名付き URL（Signed URL、1時間有効）で表示

## 表示

- `expo-image` を使用（キャッシュ活用）

## 制約 (Phase 1)

- 1日1枚のみ
