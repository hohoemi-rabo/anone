# 11: 家族共有機能（招待コード）

## 概要

招待コード方式で1つの子どもプロフィールを複数ユーザーで共有する機能。

## 対応内容

### 招待コード発行（owner のみ）

- [x] 設定画面から「家族を招待」→ 招待コード発行画面
- [x] 6桁英数字コードを生成
- [x] `invite_codes` テーブルに INSERT（expires_at = 24時間後）
- [x] コードのコピー機能
- [x] OS シェアシート連携（`Share` API）

### 招待コード参加

- [x] 設定画面から「招待コードで参加」→ コード入力画面
- [x] 6桁コード入力 UI
- [x] コード検証（存在確認、有効期限チェック、使用済みチェック）
- [x] 有効なコードの場合、`child_members` に `role: 'member'` で追加
- [x] `invite_codes.used = true` に更新
- [x] 参加完了後、ホーム画面へ遷移

### 権限制御

- [x] 日記一覧で「誰が書いたか」をアバター or イニシャルで表示
- [x] 日記削除は自分の日記のみ可能（UI 上も他人の日記は削除ボタン非表示）
- [x] 子ども情報変更は owner のみ（設定画面で UI 制御）
- [x] メンバー管理画面（owner のみ表示、メンバー一覧 + 削除機能）

### 制約

- [x] 最大5人まで共有可能（超過時にエラーメッセージ）
- [x] 招待コード有効期限: 24時間

## 参照

- REQUIREMENTS.md Section 6（家族共有機能）

## 実装メモ

- 招待コード生成 / 受け入れ / メンバー一覧取得 / メンバー削除はすべて SECURITY DEFINER 関数経由
  - `create_invite_code(p_child_id)` — owner チェック + 6文字hex + 24h expiry + 衝突リトライ5回
  - `redeem_invite_code(p_code)` — 有効性検証 + 上限5人 + 重複チェック
  - `get_family_members(p_child_id)` — 同 child のメンバーのみ参照可
  - `remove_family_member(p_child_id, p_user_id)` — owner 以外不可、自身削除不可
- `child_members` の SELECT RLS が `user_id = auth.uid()` 自己限定なので、他メンバー一覧は SECURITY DEFINER で迂回
- 著者表示はイニシャル円（`AuthorAvatar`）。avatar 画像は Phase 2 以降
- 自分が単独メンバーのときは著者表示しない（UI ノイズ低減）

## 既知の未対応

- **owner 退会:** owner 自身の離脱は未対応（Phase 2 候補）
- **users.avatar_url の活用:** イニシャル円のみ。avatar 画像 UI は Phase 2

## 招待される側のオンボーディング

- `app/child-register.tsx` 下部に「すでに招待コードをお持ちですか？」リンクを設置。新規サインアップ → ダミー子ども登録不要で `invite-join` へ直接遷移できる
- そのため `invite-join` は `isLoggedIn` ガードの独立 Stack.Protected ブロックに配置（`hasChild` の真偽どちらでもアクセス可）
- 参加成功後 `refreshChildStatus()` で `hasChild=true` に切替 → `child-register` がアンマウント → `(tabs)` 画面に自然遷移
