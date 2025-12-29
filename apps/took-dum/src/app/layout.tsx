import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'Took Dum - 간편 운동 기록',
  description: '터치와 슬라이더만으로 운동을 기록하는 모바일 헬스 앱',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
