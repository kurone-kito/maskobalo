# 🎭 codename: Maskobalo

## 開発者向けドキュメント

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
