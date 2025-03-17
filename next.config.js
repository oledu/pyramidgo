/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 這行確保 Next.js 生成靜態站點（Cloudflare Pages 需要）
  async headers() {
    return [
      {
        source: '/(.*)', // 這會影響所有頁面
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://www.googletagmanager.com https://www.google-analytics.com;',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=()',
          },
        ],
      },
    ];
  },
};


module.exports = nextConfig;