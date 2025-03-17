'use client'; // 確保這段程式碼在客戶端執行

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const GA_TRACKING_ID = 'G-EVLBF0EKRQ';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: pathname,
        cookie_flags: 'SameSite=None; Secure',
        cookie_domain: 'auto',
      });
    }
  }, [pathname]);

  return null;
}
