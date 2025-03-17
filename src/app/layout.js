import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import Analytics from './components/analytics';

const geistSans = Geist({
  variable: '--font-geist-sans', subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono', subsets: ['latin'],
});

export const metadata = {
  title: 'PYRAMID GO', description: '攀岩金字塔俱樂部',
};

const GA_TRACKING_ID = 'G-EVLBF0EKRQ'; // 替換成你的 GA ID


export default function RootLayout({ children }) {
  return (<html lang="en">
  <head>
    {/* Google Analytics 4 代碼 */}
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
    />
    <Script
      id="google-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });
          `,
      }}
    />
  </head>
  <body
    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  >
  <Analytics />
  {children}
  </body>
  </html>);
}
