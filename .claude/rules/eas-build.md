---
globs: eas.json,app.json,app.config.*
---

# EAS Build ルール

- `eas.json` でビルドプロファイルを `development` / `staging` / `production` に分割。
- `extends` を使ってベースプロファイルから共通設定を継承。
- 環境変数はプロファイルごとに `env` フィールドで管理。
