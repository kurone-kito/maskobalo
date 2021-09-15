/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: { es2021: true, node: true },
  extends: [
    'plugin:editorconfig/noconflict',
    'plugin:jsdoc/recommended',
    'plugin:lodash/recommended',
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    // 極力 Airbnb ルールを適用したいため、末尾に近づけて配置する
    'airbnb-typescript/base',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ['*.?(c)js'],
      rules: {
        // JavaScript に限り `require` 構文を許容する。既定では全面禁止。
        // JavaScript は各種設定ファイルなど、トランスパイルの範囲外で
        // 使用する状況が多く、import が使いづらい。
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    { files: ['*.json'], extends: ['plugin:json/recommended'] },
    { files: ['*.md'], extends: ['plugin:markdown/recommended'] },
    { files: ['*.y@(a)ml'], extends: ['plugin:yaml/recommended'] },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { impliedStrict: true },
    extraFileExtensions: ['.cjs', '.cts', '.mjs', '.mts', '.json'],
    project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  root: true,
  rules: {
    // import 構文における、型のみのインポートで通常インポートを使用する
    // ことを警告付きで許可する。既定は無条件許可。バンドルサイズを削減
    // するために、ビルド時における Tree Shaking を正しく機能させる必要が
    // あるが、型インポート構文の積極的な活用は、これに大きく貢献できる。
    '@typescript-eslint/consistent-type-imports': 'warn',
    // クラスメンバーにおける、ブラケット表記を許可する。既定では全面禁止。
    // 本来 tsconfig.json における、noPropertyAccessFromIndexSignature 設定
    // に従い、適切な設定がされるべきであるが、Monorepo 環境ではなぜか
    // 機能せず、やむを得ず暫定的に無効化している。そのため、
    // ! TODO: この設定は仮設のもので、問題が解決出来次第削除する。
    '@typescript-eslint/dot-notation': 'off',
    // 特定のファイルを除き、devDependencies に対する依存は禁止。
    // 既定では全面禁止。内部的に Bundler により Tree Shaking されるため、
    // 厳格な依存パッケージの分離を行う必要性は薄いが、整理しやすくする
    // ために一部パッケージを devDependencies へと分離している。
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.config.?([cm])[jt]s'] },
    ],
    // import 構文における、順序の任意並び替えを警告付きで許可する。
    // 既定は無条件許可。import 部の雪だるま式肥大化問題対処のため導入。
    'import/order': 'warn',
    // JSDoc における、引数の型明示を無条件許可する。既定では全面禁止。
    // TypeScript プロジェクトでは、コードの型定義から推測可能であるため。
    // TODO: ドキュメント生成時に不都合がある場合は、このルールは削除する
    'jsdoc/require-param-type': 'off',
    // JSDoc における、戻り値の型明示を無条件許可する。既定では全面禁止。
    // TypeScript プロジェクトでは、コードの型定義から推測可能であるため。
    // TODO: ドキュメント生成時に不都合がある場合は、このルールは削除する
    'jsdoc/require-returns-type': 'off',
    // Lodash 関数における、ネイティブ関数代替を無条件許可する。
    // 既定では全面禁止。現代のモダンブラウザ事情では、
    // 関数仕様における差異は考えにくいものと考えている。
    'lodash/prefer-lodash-method': 'off',
    // import 構文の複数 export における、順序の任意
    // 並び替えを警告付きで許可する。既定は無条件許可。
    // import 部の雪だるま式肥大化問題対処のため。
    'sort-imports': ['warn', { ignoreCase: true, ignoreDeclarationSort: true }],
  },
  // `eslint-import-resolver-node` を導入しているが、直接 devDependencies
  // にいれていないと、Linter がいくつか不可解なエラーを出す。
  // また、`node: {}` を設定に含めても、別の不可解なエラーを出す。
  // see: https://github.com/airbnb/javascript/issues/1730
  settings: { 'import/resolver': { typescript: { alwaysTryTypes: true } } },
};
