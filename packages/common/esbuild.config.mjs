import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from 'esbuild';

/** @typedef {import('esbuild').BuildOptions} BuildOptions */
/** @typedef {import('esbuild').Format} Format */

/**
 * `package.json` のパース済みデータ。
 *
 * @type {import('type-fest').PackageJson}
 */
const PackageJson = JSON.parse(await readFile('package.json', 'utf8'));

/** 外部パッケージの依存関係情報。 */
const { dependencies = {}, peerDependencies = {} } = PackageJson;

/**
 * ESBuild のための、共通設定。
 *
 * @type {BuildOptions}
 */
const options = {
  bundle: true,
  entryPoints: [join('src', 'index.ts')],
  external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
  keepNames: true,
  platform: 'node',
  sourcemap: 'external',
  target: 'node16',
  treeShaking: true,
  watch: !!process.env.WATCH,
};

/**
 * ESBuild のための、追加設定を生成します。
 *
 * @param {Format} format 出力形式。
 * @returns {BuildOptions} ESBuild の追加設定。
 */
const createAdditionalOptions = (format) => ({
  format,
  outfile: join('dist', `index.${format === 'esm' ? 'mjs' : format}`),
});

/**
 * ESBuild の出力形式一覧。
 *
 * @type {ReadonlyArray<Format>}
 */
const formats = Object.freeze(['esm', 'cjs']);

formats.forEach((format) =>
  build({ ...options, ...createAdditionalOptions(format) }).catch((error) => {
    console.error(error);
    process.exit(1);
  })
);
