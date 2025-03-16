'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAllData } from './hooks/useData';
import LogoImg from './components/LogoImg';
import MarqueeText from './components/MarqueeText';
import DataCharts from './components/DataCharts';
import Banner from './components/Banner';
import { fetchData } from './services/api';

// 動態導入 Background3D 組件，並禁用 SSR
const Background3D = dynamic(() => import('./components/Background3D'), {
  ssr: false,
});

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePeriodChange = async (period) => {
    setLoading(true);
    try {
      const newData = await fetchData(period);
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    handlePeriodChange('202501T');
  }, []);

  return (
    <main className="min-h-screen">
      <Background3D />
      {/* <LogoImg /> */}
      <Banner onPeriodChange={handlePeriodChange} />
      <MarqueeText data={data} />
      <DataCharts data={data} loading={loading} error={error} />
    </main>
  );
}
