//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  // 다크 모드 고정
  // PWA 준비
};

const plugins = [
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
