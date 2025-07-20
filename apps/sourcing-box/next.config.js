/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
