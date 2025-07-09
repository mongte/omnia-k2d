//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gd.image-qoo10.jp',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dp.image-qoo10.jp',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'simage-qoo10.qoo10.jp',
        pathname: '/**',
      },
    ],
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
