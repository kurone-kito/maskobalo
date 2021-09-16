/** @type {import('@storybook/core-common').StorybookConfig} */
module.exports = {
  addons: [
    '@storybook/addon-essentials',
    {
      name: 'storybook-addon-turbo-build',
      options: {
        esbuildMinifyOptions: { target: 'es2021' },
        optimizationLevel: 2,
      },
    },
  ],
  core: { builder: 'webpack5' },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  typescript: { reactDocgen: false },
};
