---
globs: lib/image*,components/**/image*,components/**/photo*,app/**/write*,app/child-register*
---

# 画像処理ルール

## 共通ユーティリティ `lib/image.ts`

画像処理はすべて `lib/image.ts` 経由で行う。個別画面で storage API を直叩きしない。

- `compressImage(uri)` — 圧縮
- `uploadDiaryPhoto(childId, entryDate, uri)` — 日記写真アップロード
- `uploadChildIcon(childId, uri)` — 子どもアイコンアップロード
- `getSignedPhotoUrl(path)` — 署名URL取得（1時間有効）
- `deletePhoto(path)` — Storage から削除

## 圧縮仕様

- クライアント側で `expo-image-manipulator` により圧縮
- 縦横比を維持し、長辺が 1280px になるようリサイズ（幅基準/高さ基準を自動判定）
- JPEG 80% 品質
- 圧縮後の目安: 200〜400KB

## アップロード方式

- `expo-file-system/legacy` の `readAsStringAsync(uri, { encoding: Base64 })` で base64 取得 → `atob` で Uint8Array → ArrayBuffer として Supabase に送る。
- `fetch(uri).blob()` は RN で空ファイル化する既知不具合があるため使わない。
- `expo-file-system` v19 の新 API (`new File(uri).arrayBuffer()`) は Expo Go で未サポートのため避ける（development build が必要）。
- UUID 生成は `expo-crypto` の `randomUUID()` を使う。RN ランタイムには `globalThis.crypto` が無い。

## Storage

- Supabase Storage バケット: `diary-photos`（プライベート設定）
- 日記写真 path: `{child_id}/{entry_date}/{uuid}.jpg`
- 子どもアイコン path: `children/{child_id}/{uuid}.jpg`
- 署名付き URL（Signed URL、1時間有効）で表示

## 表示

- `expo-image` を使用（キャッシュ活用）

## 制約 (Phase 1)

- 日記写真は1日1枚のみ
- 子どもアイコンは任意
