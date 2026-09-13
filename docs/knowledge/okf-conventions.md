---
type: convention
title: OKF Conventions
description: The repository's Open Knowledge Format (OKF) contract for the docs/knowledge/ bundle - conformance rules, field policy, tag style, and excluded surfaces.
tags:
  - okf
  - documentation
  - conventions
---

## Conformance rules

This repository adopts [Open Knowledge Format](https://okf.md/) (OKF)
v0.2 for `docs/knowledge/`. A document in this bundle conforms when:

1. Every non-reserved Markdown file carries parseable YAML frontmatter.
2. That frontmatter's `type` field is non-empty and present in
   `okf-types.json`.
3. The two reserved files, `index.md` and `log.md`, follow their
   reserved shapes below instead of the general field policy.

## Field policy

- **Required**: `type` - must match a key in `okf-types.json`.
- **Recommended**: `title`, `description`, `tags`.
- **Required for `type: design`**: `status` (`draft` | `stable` |
  `deprecated`).
- **Optional and currently unused**: `stale_after`, and the
  provenance families `generated`, `verified`, `sources`. These are
  reserved for future use; no document should rely on them yet.

## Tag style

Tags are lowercase kebab-case, 2-5 per document.

## Reserved files

- `index.md` - no frontmatter other than `okf_version: "0.2"`. Body
  uses OKF's index shape: section headings followed by
  `* [Title](path) - description` entries.
- `log.md` - flat, date-grouped, newest-first, ISO `YYYY-MM-DD`
  headings; entries start with the OKF bold convention (`**Creation**`,
  `**Update**`, `**Deprecation**`).

## Repository-local rule: index coverage

Every non-reserved **Markdown** document in this bundle must be linked
from `index.md`. This is stricter than OKF itself; it keeps the index
from silently falling behind as documents are added. Non-Markdown
bundle files, such as `okf-types.json`, are referenced from prose
(like the pointer below) rather than from the index list.

## Excluded surfaces

The following are deliberately **outside** `docs/knowledge/`:

- `.github/instructions/`, the `idd-skill`-synced pages under `docs/`,
  `docs/onboarding/`, `profiles/`, and `skills/` - these are synced
  from the `idd-skill` template and are overwritten wholesale on every
  re-import (see #7); local frontmatter there would be destroyed on
  each sync.
- `docs/ai-strategy.md` and `docs/anonymous-mode.md` - repository-owned
  knowledge, but still at their pre-bundle paths pending migration
  into `docs/knowledge/` under #15 and #19; not yet part of the
  bundle.
- `.github/CODE_OF_CONDUCT*` and `.github/CONTRIBUTING*` - repository
  policy forbids unapproved edits to these community documents.
- Repository root files - `README.md`, `README.ja.md`, `SECURITY.md`,
  `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` - stay where GitHub and agent
  runtimes expect them to be found, and link into this bundle instead
  of joining it.

## Type vocabulary

`okf-types.json` is the single source of truth for allowed `type`
values.
