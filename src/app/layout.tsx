import type { Metadata } from 'next';
import { MenuLayout } from './MenuLayout';
import { unauthenticated_currentSoldier } from './actions';
import './globals.css';
import { AntDesignRegistry } from './registry';

export const metadata: Metadata = {
  title: '병영생활 관리',
  description: '제2신속대응사단 병영생활 관리',
  authors: { name: 'Keyboard Warrior Club' },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1.0,
    userScalable: 'no',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await unauthenticated_currentSoldier();
  return (
    <html lang='ko'>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }

          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </head>
      <body>
        <AntDesignRegistry>
          <MenuLayout data={data}>{children}</MenuLayout>
        </AntDesignRegistry>
      </body>
    </html>
  );
}
