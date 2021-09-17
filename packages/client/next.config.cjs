/** @type {Partial<import('next/dist/server/config-shared').NextConfig>} */
module.exports = {
  basePath: process.env.CLIENT_NEXT_BASE_HREF || undefined,
  experimental: { esmExternals: true },
  future: { strictPostcssConfiguration: true },
};
