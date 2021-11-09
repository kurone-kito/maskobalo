# 🎭 codename: Maskobalo

## 開発者向けドキュメント

### 構成

- `/`: ルートプロジェクト `maskobalo`。Monorepo の管理や Linter など、
  プロジェクト全体を跨いだ一括管理の責務を負います。
- `/packages/client`: クライアント サイド プロジェクト `@maskobalo/client`。
  Web フロントエンド コンテンツにおける、ビルド、プレビュー、
  および配置などの責務を負います。
- `/packages/server`: サーバー サイド プロジェクト `@maskobalo/server`。
  バックエンド側の API を提供する、サーバーのロジックなどをビルド、
  および配置する責務を負います。
- `/packages/common`: 共通ライブラリ プロジェクト `@maskobalo/common`。
  クライアントとサーバー双方で使用する機能などを提供する責務を負います。

### システム要件

Node.js v17.2.0 以降の動作する PC (Linux, macOS, Windows)
**Yarn v2.4.3** 以降のインストールが必要です。下記のコマンドを使用します。

```sh
npm install --global yarn@berry
```

### 初回設定 (依存する外部パッケージの解決)

```sh
yarn install
```

## クリーンアップ

```sh
yarn run clean
```

成果物や各種中間データなどを削除します。

## ビルド

```sh
yarn run build
```

サブプロジェクトを全てビルドします。現状サブプロジェクトは空なので、
この npm-scripts は Dry-run として機能し、実質的に何も行いません。

```sh
yarn run build:re
```

上記コマンドで、クリーンアップとビルドを一括実行、所謂リビルドを行います。

### ホットコード プッシュ環境を作成する (開発用)

```sh
yarn start
```

サブプロジェクトを全て開発用としてビルドし、ソースコードの変更を監視し、
保存するたびに追加のビルドを行います。現状サブプロジェクトは空なので、
この npm-scripts は Dry-run として機能し、実質的に何も行いません。

### Linting

コミット時に、自動的にソースコードの整形を行います。また、
下記コマンドを実行することで随時コミット対象ファイルの整形ができます。

```sh
yarn run lint:fix
```

自動整形をせず、手動で修正したい場合は、下記の npm-scripts を使用します。

```sh
yarn run lint
```

### その他ルール

- コミット時におけるコミット メッセージの Linter を導入しています。
  ルールとして暫定的に
  **[Conventional Commits](https://www.conventionalcommits.org/ja/)**
  を適用しており、規約に反するメッセージのコミットを弾きます。
