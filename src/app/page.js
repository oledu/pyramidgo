'use client';
import dynamic from 'next/dynamic';
import { useAllData } from './hooks/useData';
import LogoImg from './components/LogoImg';
import MarqueeText from './components/MarqueeText';
import DataCharts from './components/DataCharts';

// 動態導入 Background3D 組件，並禁用 SSR
const Background3D = dynamic(() => import('./components/Background3D'), {
  ssr: false,
});

export default function Home() {
  console.log('data222');

  const { data, loading, error } = useAllData(); // 只在這裡調用一次
  console.log('data111', data);

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <Background3D />
      <LogoImg />
      <MarqueeText data={data} />
      <DataCharts data={data} loading={loading} error={error} />
    </main>
  );
}
