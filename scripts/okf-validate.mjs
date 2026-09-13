#!/usr/bin/env node
// Minimal-subset OKF frontmatter validator for docs/knowledge/.
//
// Deliberate limitation: this checks only the minimal frontmatter
// subset documented in docs/knowledge/okf-conventions.md's
// "Enforcement" section (flat top-level scalar keys, `- ` list
// items, and 2-space-indented continuations) - it is not a general
// YAML parser. That trade-off keeps this dependency-free.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.argv[2] ?? 'docs/knowledge';
const RESERVED_NAMES = new Set(['index.md', 'log.md']);
const TOP_LEVEL_KEY = /^[A-Za-z_][A-Za-z0-9_.-]*:/;
const LIST_ITEM = /^- /;
const CONTINUATION = /^ {2}\S/;
const MARKDOWN_LINK = /]\(([^)]+)\)/g;

/**
 * @param {string} dir
 * @returns {string[]}
 */
function findMarkdownFiles(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...findMarkdownFiles(full));
    } else if (extname(entry) === '.md') {
      files.push(full);
    }
  }
  return files;
}

/**
 * @param {string} text
 * @returns {string[] | null} the frontmatter lines, or null when the
 *   document has no valid opening/closing `---` fence pair.
 */
function extractFrontmatterLines(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') return null;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i] === '---') return lines.slice(1, i);
  }
  return null;
}

/**
 * @param {string[]} lines
 * @returns {string | null} a description of the first non-conforming
 *   line, or null when every line matches the minimal subset.
 */
function findMinimalSubsetViolation(lines) {
  for (const line of lines) {
    if (
      line.trim() === '' ||
      TOP_LEVEL_KEY.test(line) ||
      LIST_ITEM.test(line) ||
      CONTINUATION.test(line)
    ) {
      continue;
    }
    return JSON.stringify(line);
  }
  return null;
}

/**
 * @param {string[]} lines
 * @param {string} key
 * @returns {string | null} the trimmed, unquoted scalar value, or
 *   null when the key is absent.
 */
function readScalarField(lines, key) {
  const prefix = `${key}:`;
  for (const line of lines) {
    if (line.startsWith(prefix)) {
      return line
        .slice(prefix.length)
        .trim()
        .replace(/^['"]|['"]$/g, '');
    }
  }
  return null;
}

/**
 * @param {string[]} allFiles absolute paths of every bundle Markdown file
 * @returns {Set<string>} the set of absolute paths linked from at
 *   least one `index.md` in the bundle
 */
function collectLinkedPaths(allFiles) {
  /** @type {Set<string>} */
  const linked = new Set();
  for (const file of allFiles) {
    if (file.split('/').pop() !== 'index.md') continue;
    const text = readFileSync(file, 'utf8');
    const dir = join(file, '..');
    for (const match of text.matchAll(MARKDOWN_LINK)) {
      const href = match[1];
      if (href === undefined || /^[a-z]+:\/\//.test(href)) continue;
      linked.add(join(dir, href));
    }
  }
  return linked;
}

/**
 * @returns {Record<string, string>}
 */
function loadTypeVocabulary() {
  const path = join(ROOT, 'okf-types.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

function main() {
  const allFiles = findMarkdownFiles(ROOT);
  const linkedPaths = collectLinkedPaths(allFiles);
  const vocabulary = loadTypeVocabulary();
  /** @type {string[]} */
  const violations = [];

  for (const file of allFiles) {
    const relPath = relative('.', file);
    const isReserved = RESERVED_NAMES.has(file.split('/').pop() ?? '');
    const text = readFileSync(file, 'utf8');
    const frontmatter = extractFrontmatterLines(text);

    if (isReserved) {
      const isBundleRootIndex = file === join(ROOT, 'index.md');
      if (isBundleRootIndex) {
        const okfVersion =
          frontmatter && readScalarField(frontmatter, 'okf_version');
        if (!okfVersion) {
          violations.push(
            `${relPath}: root-index-okf-version: bundle-root index.md must declare okf_version`,
          );
        }
      }
      continue;
    }

    if (!frontmatter) {
      violations.push(
        `${relPath}: frontmatter-fence: missing opening/closing "---" frontmatter fence`,
      );
      continue;
    }

    const subsetViolation = findMinimalSubsetViolation(frontmatter);
    if (subsetViolation) {
      violations.push(
        `${relPath}: minimal-yaml-subset: unrecognized line ${subsetViolation}`,
      );
      continue;
    }

    const type = readScalarField(frontmatter, 'type');
    if (!type) {
      violations.push(
        `${relPath}: type-required: missing or empty "type" field`,
      );
    } else if (!Object.hasOwn(vocabulary, type)) {
      violations.push(
        `${relPath}: type-vocabulary: "${type}" is not a key in ${join(ROOT, 'okf-types.json')}`,
      );
    }

    if (!linkedPaths.has(file)) {
      violations.push(
        `${relPath}: index-linked: not linked from any index.md in the bundle`,
      );
    }
  }

  if (violations.length > 0) {
    for (const violation of violations) console.error(violation);
    process.exit(1);
  }
}

main();
