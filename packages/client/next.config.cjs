/** @type {Partial<import('next/dist/server/config-shared').NextConfig>} */
module.exports = {
  experimental: { esmExternals: true },
  future: { strictPostcssConfiguration: true },
};
