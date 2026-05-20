# Guidelines for AI Agents

**maskobalo** is a voice chat application specialized for TRPG
(tabletop role-playing games) and voice parties. It is a pnpm workspace
monorepo using SolidJS + Vite on the frontend, Cloudflare Workers +
Durable Objects for signaling, and WebRTC P2P mesh for audio.

This file gives the minimum project rules to Gemini CLI so it can work
immediately without depending on a redirect.

## Setup commands

- Install dependencies: `corepack enable && pnpm install`
- Lint: `pnpm run lint`
- Lint and auto-fix: `pnpm run lint:fix`
- Typecheck: `pnpm run typecheck`
- Test: `pnpm run test`
- Build (all packages): `pnpm run build`
- Dev (all packages, parallel): `pnpm run dev`
- Clean: `pnpm run clean`

## Immediate rules

- Match the conversational language to the user's language.
- Write comments and documentation in English unless there is a clear
  project-specific reason otherwise.
- **Always** run `pnpm run lint:fix` after any change, no matter how
  small. Then verify with `pnpm run lint` before committing.
- Run `pnpm run typecheck` before pushing — it is required by
  `pre-push-validate` in the IDD policy.
- If uncertainty, hidden risk, or missing context blocks a safe change,
  stop and ask a concise question before proceeding.
- Keep changes small and reviewable. If you create commits, follow the
  project's Conventional Commits rules and keep each commit atomic.
- Do not modify community documents (`CODE_OF_CONDUCT*`,
  `CONTRIBUTING*`) without explicit approval.

## Boundaries

- **Always do**: run lint:fix, follow Conventional Commits, use LF
  line endings, keep commits atomic, write docs in English
- **Ask first**: adding/removing dependencies, changing architecture,
  modifying CI workflows, altering `@kurone-kito/*-config` packages
- **Never do**: commit secrets or credentials, modify community
  documents without approval, disable linter rules without
  justification, skip review of AI-generated code

## Project standards

- **Indentation**: 2 spaces
- **Line endings**: LF only
- **Trailing whitespace**: trimmed except in Markdown
- **Final newline**: always present
- **File naming**: lowercase with hyphens unless a platform convention
  requires otherwise
- **Node.js**: 24 Krypton (LTS) — pinned in `.nvmrc` / `.tool-versions`
- **Package manager**: pnpm 10.33.4 (via Corepack)

## Commit rules

This project follows
[Conventional Commits](https://www.conventionalcommits.org/).
A `.gitmessage` template is available at the repository root.
Write user-facing, lowercase subjects, keep them under 72 characters,
and split unrelated changes into separate atomic commits.

## IDD Workflow

This project uses Issue-Driven Development (IDD) with parallel AI
agents. Start with [docs/idd-workflow.md](docs/idd-workflow.md) for the
cross-agent entry path and phase routing.

Before starting IDD work, open
`.github/instructions/idd-overview.instructions.md`. Open the routed
phase file manually when the current step changes.

The machine-readable policy is at
[`.github/idd/config.json`](.github/idd/config.json). The optional
issue-authoring sub-skill lives in
[`skills/issue-authoring/`](skills/issue-authoring/SKILL.md).

## Canonical reference

The full, Copilot-first project guidance lives in
[.github/copilot-instructions.md](.github/copilot-instructions.md).
When that file uses Copilot-specific workflow names, apply the intent
in Gemini CLI using its own interaction model rather than following
the product terms literally.
