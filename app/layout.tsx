import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '지수님께',
  description: '하루 만의 첫인상, 그리고 더 궁금한 것들',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preload"
          href="/fonts/Pretendard-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
