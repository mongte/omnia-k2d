import './global.css';
import { Providers } from './providers/providers';

export const metadata = {
  title: 'Sourcing Box - Qoo10 크롤링 도구',
  description: 'Qoo10 상품 정보를 크롤링하고 엑셀로 내보내는 도구',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
