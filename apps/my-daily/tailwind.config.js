/** @type {import('tailwindcss').Config} */
module.exports = {
  // 루트 설정을 확장
  ...require('../../tailwind.config.js'),
  // 이 앱만의 content 경로 지정
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/*/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
} 