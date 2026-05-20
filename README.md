# maskobalo

> 🎲🎙 Voice chat specialized for TRPG and voice parties.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**maskobalo** is a browser-only voice chat application designed for
small-group TRPG (tabletop role-playing game) sessions and voice
parties. Anyone with the room URL can join — no account required.

> 📄 日本語版の README は [`README.ja.md`](./README.ja.md) にあります。

## Status

**Pre-MVP.** The repository was just bootstrapped from
[`kurone-kito/pnpm-project-template`](https://github.com/kurone-kito/pnpm-project-template)
and [`kurone-kito/idd-skill`](https://github.com/kurone-kito/idd-skill);
application code lands in subsequent issues.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend UI | SolidJS + Vite |
| Voice transport | WebRTC P2P / mesh (~8 participants) |
| Signaling | Cloudflare Workers + Durable Objects |
| Persistence | None (DO-resident transient state only) |
| Authentication | Anonymous + room-URL sharing |
| Node.js | 24 Krypton (LTS) |
| Package manager | pnpm 10 (via Corepack) |
| Language | TypeScript |
| Lint / format | Biome + cspell + markdownlint |
| Tests | Vitest (+ Playwright planned) |

## Quick start

```sh
corepack enable
pnpm install
pnpm run lint        # full lint
pnpm run typecheck   # required before push
pnpm run test        # vitest run --passWithNoTests
pnpm run dev         # parallel dev servers (once packages exist)
```

## Project layout

```text
maskobalo/
├── .github/
│   ├── idd/config.json                 # machine-readable IDD policy
│   ├── instructions/idd-*.md           # IDD phase instructions
│   ├── copilot-instructions.md         # canonical AI agent guide
│   └── workflows/                      # CI workflows
├── docs/                               # IDD docs + project docs
├── packages/                           # workspace packages (web, signaling, shared)
├── profiles/                           # IDD policy profiles
├── skills/issue-authoring/             # IDD issue-authoring sub-skill
├── CLAUDE.md / AGENTS.md / GEMINI.md   # AI agent entry files
└── README.md / README.ja.md
```

## Issue-Driven Development (IDD)

Day-to-day work is organized around GitHub issues that AI agents can
pick up, claim, implement, and merge in parallel. See
[docs/idd-workflow.md](docs/idd-workflow.md) for the entry path and
[`.github/idd/config.json`](.github/idd/config.json) for the policy
baseline.

## License

MIT — see [`LICENSE`](./LICENSE).
