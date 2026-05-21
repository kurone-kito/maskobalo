# maskobalo

> 🎲🎙 TRPG とボイスパーティーに特化したボイスチャット。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**maskobalo** は、TRPG セッションやボイスパーティー向けに最適化された
ブラウザ完結のボイスチャットアプリです。ルーム URL さえ知っていれば
誰でも匿名で参加できます。

> 📄 English README: [`README.md`](./README.md)

## ステータス

**MVP 前**。リポジトリは
[`kurone-kito/pnpm-project-template`](https://github.com/kurone-kito/pnpm-project-template)
と [`kurone-kito/idd-skill`](https://github.com/kurone-kito/idd-skill)
から bootstrap したばかりで、アプリ実装は後続の issue で進めます。

## 技術スタック

| レイヤ | 採用 |
| --- | --- |
| フロントエンド UI | SolidJS + Vite |
| 音声トランスポート | WebRTC P2P / Mesh（〜8 名） |
| シグナリング | Cloudflare Workers + Durable Objects |
| 永続化 | なし（DO 上の一時状態のみ） |
| 認証 | 匿名 + ルーム URL 共有 |
| Node.js | 24 Krypton（LTS） |
| パッケージマネージャ | pnpm 10（Corepack 経由） |
| 言語 | TypeScript |
| Lint / format | Biome + cspell + markdownlint |
| テスト | Vitest（Playwright 予定） |

## クイックスタート

```sh
corepack enable
pnpm install
pnpm run lint        # 全 lint
pnpm run typecheck   # push 前に必須
pnpm run test        # vitest run --passWithNoTests
pnpm run dev         # 各パッケージの dev サーバを並列起動 (パッケージ追加後)
```

## ディレクトリ構成

```text
maskobalo/
├── .github/
│   ├── idd/config.json                 # マシン可読 IDD ポリシー
│   ├── instructions/idd-*.instructions.md  # IDD フェーズ指示
│   ├── copilot-instructions.md         # canonical AI エージェントガイド
│   └── workflows/                      # CI ワークフロー
├── docs/                               # IDD ドキュメント + プロジェクトドキュメント
├── packages/                           # workspace パッケージ (web / signaling / shared)
├── profiles/                           # IDD ポリシープロファイル
├── skills/issue-authoring/             # IDD issue-authoring サブスキル
├── CLAUDE.md / AGENTS.md / GEMINI.md   # AI エージェントエントリ
└── README.md / README.ja.md
```

## Issue-Driven Development (IDD)

日々の開発は GitHub issue 中心に組み立てられ、複数の AI エージェントが
並列にピックアップ・claim・実装・マージできるよう設計されています。
詳細は [docs/idd-workflow.md](docs/idd-workflow.md) を起点に参照し、
[`.github/idd/config.json`](.github/idd/config.json) でポリシー基盤を
確認してください。

## ライセンス

MIT — [`LICENSE`](./LICENSE) を参照。
