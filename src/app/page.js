'use client';
import dynamic from 'next/dynamic';

// 動態導入 Background3D 組件，並禁用 SSR
const Background3D = dynamic(() => import('./components/Background3D'), {
  ssr: false,
});
const DataCharts = dynamic(() => import('./components/DataCharts'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <Background3D />
      <div className="w-full flex justify-center mt-5">
        <img
          src="/logo.png" /* 請將圖片放在 public 資料夾中 */
          alt="PYRAMID GO"
          className="w-full max-w-[600px] min-w-[300px] h-auto"
          style={{
            objectFit: 'contain',
          }}
        />
      </div>

      <DataCharts />
    </main>
  );
}
