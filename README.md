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

### その他ルール

- コミット時におけるコミット メッセージの Linter を導入しています。
  ルールとして暫定的に
  **[Conventional Commits](https://www.conventionalcommits.org/ja/)**
  を適用しており、規約に反するメッセージのコミットを弾きます。
