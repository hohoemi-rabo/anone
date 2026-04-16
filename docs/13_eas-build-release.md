# 13: EAS Build & Play Store リリース準備

## 概要

EAS Build の設定と Google Play Store 公開に必要なアセット・情報の準備。

## 対応内容

### EAS 設定

- [ ] `eas.json` 作成（development / staging / production プロファイル）
- [ ] 環境変数をプロファイルごとに設定
- [ ] Development Build の動作確認

### Play Store アセット

- [ ] アプリアイコン最終版（512x512px PNG）
- [ ] スクリーンショット作成（最低2枚、推奨8枚）
- [ ] フィーチャーグラフィック（1024x500px）
- [ ] 短い説明文（最大80文字）
- [ ] 詳細説明文（最大4000文字）

### 法的ドキュメント

- [ ] プライバシーポリシー作成・公開（URL 必須）
  - 収集データの種類
  - 保存場所（Supabase / GCP）
  - 第三者提供の有無
  - データ削除方法
- [ ] 利用規約作成・公開
- [ ] コンテンツレーティングアンケート回答

### リリース

- [ ] Production ビルド作成
- [ ] 内部テスト配信・動作確認
- [ ] Play Store 申請・公開

## 参照

- REQUIREMENTS.md Section 10（Play Store 申請準備）
- CLAUDE.md Best Practices（EAS Build）
