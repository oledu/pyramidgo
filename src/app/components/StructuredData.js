export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: '抱石猛獸爭霸賽',
    description: '台灣攀岩趣味或棟，展示最佳攀岩選手的技巧和實力',
    startDate: '2025-03-02',
    endDate: '2025-03-29',
    location: {
      '@type': 'Place',
      name: '全台各地 線下挑戰 線上集合',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'TW',
        addressRegion: 'TW',
        addressCountry: 'TW',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'PryamidGo 攀岩金字塔俱樂部',
      url: 'https://pyramidgo.pages.dev/',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
