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
  title: 'PYRAMID GO | 攀岩金字塔俱樂部',
  description: 'PYRAMID GO 攀岩金字塔俱樂部 - 台灣專業攀岩社群，提供抱石、運動攀登競賽資訊與成績統計，打造攀岩愛好者的交流平台',
  keywords: '攀岩, 抱石, 運動攀登, 攀岩俱樂部, 攀岩比賽, 台灣攀岩, climbing, bouldering, sport climbing',
  authors: [{ name: 'PYRAMID GO 攀岩金字塔俱樂部' }],
  creator: 'PYRAMID GO',
  publisher: 'PYRAMID GO',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://pyramidgo.pages.dev/',
    title: 'PYRAMID GO | 攀岩金字塔俱樂部',
    description: 'PYRAMID GO 攀岩金字塔俱樂部 - 台灣專業攀岩社群，提供抱石、運動攀登競賽資訊與成績統計',
    siteName: 'PYRAMID GO',
    images: [
      {
        url: 'https://pyramidgo.pages.dev/logo.png',
        width: 1200,
        height: 630,
        alt: 'PYRAMID GO 攀岩金字塔俱樂部',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PYRAMID GO | 攀岩金字塔俱樂部',
    description: 'PYRAMID GO 攀岩金字塔俱樂部 - 台灣專業攀岩社群，提供抱石、運動攀登競賽資訊與成績統計',
    images: ['https://pyramidgo.pages.dev/logo.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
};

const GA_TRACKING_ID = 'G-EVLBF0EKRQ'; // 替換成你的 GA ID


export default function RootLayout({ children }) {
  return (<html lang="zh-TW">
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
