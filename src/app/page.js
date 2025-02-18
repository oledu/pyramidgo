'use client'
import dynamic from 'next/dynamic'

// 動態導入 Background3D 組件，並禁用 SSR
const Background3D = dynamic(() => import('./components/Background3D'), {
  ssr: false
})
const DataCharts = dynamic(() => import('./components/DataCharts'), {
  ssr: false
})

export default function Home() {
  return (
    <main>
      <Background3D />
      <div>
        {/* 標題區塊 */}
        <div className="flex justify-center w-full mt-5">
          <div
            style={{
              minWidth: '350px',
              maxWidth: '500px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
            }}
            className="title flex flex-col justify-center items-center p-5"
          >
            <h1>PYRAMID GO</h1>
            <h2>攀岩金字塔俱樂部</h2>
          </div>
        </div>
        <DataCharts />
      </div>
    </main>
  )
}