# Guidelines for AI Agents — maskobalo

**maskobalo** is a voice chat application specialized for TRPG
(tabletop role-playing games) and voice parties. It is a pnpm workspace
monorepo using SolidJS + Vite on the frontend, Cloudflare Workers +
Durable Objects for signaling, and WebRTC P2P mesh for audio
(target ~8 participants per room).

When contributing to this repository using AI agents, adhere to the
following guidelines to ensure high-quality contributions that align
with the project's standards and practices.

## Tooling priority and compatibility

This repository is optimized for GitHub Copilot CLI and VS Code
Copilot Chat because they are the primary tools used for day-to-day
work. `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` exist as lightweight
compatibility entry points for Codex, Claude Code, and Gemini CLI.
Keep this file as the canonical, fully detailed guide.

For the issue-driven workflow (multi-agent autopilot), see
[IDD Workflow](#idd-workflow) below.

## Conversation

- The conversational language should match the user's language.
  For example, if the user speaks in Japanese, respond in Japanese.
- However, comments and documentation should be written in English unless
  there is a clear context otherwise.
- **Always** run `pnpm run lint:fix` after making any changes — no
  matter how small (including documentation typo fixes). Then verify
  with `pnpm run lint` before committing.
- Run `pnpm run typecheck` before pushing — it is required by the
  IDD `pre-push-validate` policy.
- If uncertainties, concerns, or other implementation issues arise while
  running in Agent mode, promptly switch to Plan mode and ask the user
  questions. In such cases, provide one or more recommended response
  options.
- Outside GitHub Copilot, interpret the `Agent mode` and `Plan mode`
  wording by intent: continue autonomously for low-risk work, but pause
  and ask a concise question when uncertainty or hidden risk makes the
  next step unsafe. When that pause is needed, provide one or more
  recommended response options.

## Boundaries

### Always do

- Run `pnpm run lint:fix` after every change, then verify with
  `pnpm run lint`
- Run `pnpm run typecheck` before pushing
- Follow Conventional Commits for all commits
- Use LF line endings, 2-space indentation, and a final newline
- Keep commits atomic — one logical change per commit
- Write comments and documentation in English

### Ask first

- Adding or removing dependencies
- Changing the project architecture or directory structure
- Modifying CI/CD workflows (`.github/workflows/`)
- Altering shared configuration packages (`@kurone-kito/*-config`)
- Making changes that affect all workspace packages

### Never do

- Commit secrets, credentials, API keys, or tokens into source code
- Modify community documents (`CODE_OF_CONDUCT*`, `CONTRIBUTING*`)
  without explicit approval
- Disable or bypass linter rules without justification
- Accept AI-generated code without reviewing it for correctness
  and security
- Introduce breaking changes without a `BREAKING CHANGE` footer

## Commit rules

This project follows
[Conventional Commits](https://www.conventionalcommits.org/).
A `.gitmessage` template is available at the repository root for
guidance when writing commit messages.

### Format

```txt
<type>[optional scope]: <user-facing description>

<body: address purpose, context, and what changed>

[optional footer(s)]
```

### Subject line

- Use the format: `<type>[optional scope]: <description>`
- Write from the **user's perspective** — briefly state what this
  commit solves or improves for the end user or developer
- Write in **lowercase**, imperative mood (e.g., "add", not "added")
- Keep the subject line under **72 characters**
- Do **not** end with a period

### Types

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`,
`chore`, `ci`, `build`, `perf`

### Scopes

- Optional, in parentheses: `feat(web):`, `fix(signaling):`,
  `docs(readme):`
- Keep scopes **lowercase**, short, and consistent
- Use the workspace package name (e.g., `web`, `signaling`, `shared`)
  or the area name (e.g., `ci`, `idd`, `deps`)

### Body (line 3+)

The body should address three aspects:

- **Why** — the purpose or motivation behind the change
- **Context** — what was needed, the situation or constraint
- **What changed** — the concrete action taken

Prefer the **why → context → change** order when practical.
Write these as **natural prose** — weave the aspects into
coherent sentences rather than using labeled sections. Labeled
sections (`Why:` / `Context:` / `Change:`) are acceptable only
when explicit paragraph separation improves clarity.

Omit any aspect whose information **cannot be reliably inferred**.
If the subject line is self-explanatory, the body may be omitted
entirely. **Breaking changes must always include a body.**

Wrap body lines at **72 characters**.

### Breaking changes

- Append `!` after the type/scope: `feat!: remove deprecated endpoint`
- Add a `BREAKING CHANGE:` trailer in the footer with a detailed
  explanation of what breaks and migration steps

### Footers / trailers

- `Closes #<issue>` / `Refs #<issue>` — link to issues
- `Co-authored-by: Name <email>` — credit co-authors
- `BREAKING CHANGE: <description>` — detail the breaking change

### Atomic commits

Keep each commit as **small and focused** as possible:

- **One logical change per commit** — if the subject line needs "and",
  consider splitting
- **Separate refactoring** from behavior changes
- **Separate formatting/style** changes from logic changes
- **Separate dependency updates** from code changes
- When in doubt, prefer smaller commits that are easy to review,
  revert, and bisect

## Coding standards

- **Indentation**: 2 spaces (enforced by `.editorconfig`)
- **Line endings**: LF only (enforced by `.editorconfig` and
  `.gitattributes`)
- **Trailing whitespace**: trimmed (except in Markdown)
- **Final newline**: always present
- **File naming**: lowercase with hyphens (e.g., `feature-request.yml`)
  unless constrained by a platform convention (e.g., `CONTRIBUTING.md`)
- **Node.js**: 24 Krypton (LTS) — pinned in `.nvmrc` / `.tool-versions`
- **Package manager**: pnpm 10.33.4 (via Corepack)
- **TypeScript**: strict mode; defer compiler options to
  `@kurone-kito/typescript-config`

## Development

### Install the dependencies

```sh
corepack enable
pnpm install
```

### Linting

```sh
pnpm run lint
pnpm run lint:fix # Lint and auto-fix
```

### Type checking

```sh
pnpm run typecheck
```

### Testing

```sh
pnpm run test          # vitest run --passWithNoTests at root
pnpm run test:vitest   # explicit Vitest invocation
```

### Build and develop

```sh
pnpm run build         # build all workspace packages
pnpm run dev           # run dev servers in parallel
```

### Cleaning

```sh
pnpm run clean
```

## Testing strategy

This project uses **Vitest** as the unit/integration test runner.
Configuration is in `vitest.config.mts` at the workspace root and
per-package as needed.

- **Test location**: co-locate test files next to source (e.g.,
  `src/foo.ts` and `src/foo.test.ts`)
- **Coverage**: V8 provider (`@vitest/coverage-v8`); aim for
  meaningful coverage on protocol code, room-state logic, and
  signaling adapters
- **Test naming**: descriptive (e.g.,
  `it('rejects joinRoom when nickname is empty')`)
- **CI integration**: tests run in `.github/workflows/push.yml`

End-to-end tests for the browser flow (room create → join → audio
connect) will be added under `packages/<name>/e2e/` as the MVP
solidifies. Playwright is the leading candidate.

## Monorepo guidance

This is a **pnpm workspace monorepo** (`packages/*`):

- **Scoped commands** — prefer `pnpm --filter <package>` over
  running commands at the root to save time and reduce noise
- **Nested AGENTS.md** — consider adding an `AGENTS.md` inside each
  workspace package with package-specific instructions; the nearest
  file in the directory tree takes precedence
- **Package naming** — check the `name` field in each package's
  `package.json` to confirm the correct package name
- **Dependency boundaries** — respect workspace package boundaries;
  avoid circular dependencies between packages
- **Shared types** — protocol types and shared utilities live in
  a dedicated `packages/shared/` package once it is created

## IDD Workflow

This project uses Issue-Driven Development (IDD) with parallel AI
agents. Multiple AI agents may operate on different issues in
parallel; the IDD scaffold provides mutual-exclusion claim markers
and phase-routing instructions so concurrent work does not collide.

**Entry path:** start with [docs/idd-workflow.md](../docs/idd-workflow.md)
for the cross-agent entry path and phase routing.

**Phase instructions:** before starting IDD work, open
[`.github/instructions/idd-overview.instructions.md`](instructions/idd-overview.instructions.md).
Open the routed phase file manually when the current step changes.

**Policy:** the machine-readable policy is at
[`.github/idd/config.json`](idd/config.json). Key settings for
maskobalo:

- `mergePolicy: fully_autonomous_merge`
- `reviewPolicy: copilot-advisory` — GitHub Copilot advisory reviews
  are surfaced on every PR and counted as advisory input alongside
  CodeRabbit. No-advisory and human-required profiles remain available
  in `profiles/` if the project later changes course.
- `threadResolutionPolicy: fast-agent-resolve`
- `helperRuntime.profile: package-manager`
- `skipIssueAuthorApprovalGate: true`
- `maintainerApprovalActorPolicy: owners-and-maintainers-only`
- `markerPrefix: maskobalo`

**Issue authoring:** the optional issue-authoring sub-skill lives in
[`skills/issue-authoring/`](../skills/issue-authoring/SKILL.md).
Use it to draft IDD-ready issues before handing work to autopilot.

## Guardrails

- **Do not** modify community documents (CODE_OF_CONDUCT, CONTRIBUTING)
  without explicit approval
- **Do not** disable or weaken the IDD policy settings in
  `.github/idd/config.json` without explicit approval from a maintainer

## Security

These rules follow the
[OpenSSF Security-Focused Guide for AI Code Assistant Instructions](https://best.openssf.org/Security-Focused-Guide-for-AI-Code-Assistant-Instructions.html):

- **No secrets in code** — store credentials in environment variables
  or a secrets manager; never hard-code them
- **Treat AI output as untrusted** — review all generated code for
  correctness, security vulnerabilities, and adherence to project
  standards before committing
- **Validate inputs** — ensure all external data is validated and
  sanitized before use, especially WebSocket and Durable Object
  message payloads
- **Verify dependencies** — confirm that any recommended packages are
  reputable, actively maintained, and free of known vulnerabilities
- **Recursive review** — when generating security-sensitive code, ask
  the AI to review its own output and suggest improvements before
  accepting
