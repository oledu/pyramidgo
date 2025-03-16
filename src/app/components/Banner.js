'use client';
import { useState } from 'react';

const Banner = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('202502T');

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
    // 這裡可以添加期數切換的邏輯
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-900 to-purple-900 px-6 py-4 mb-8">
      <div className="container mx-auto relative flex justify-between items-center">
        {/* Logo 區域 */}
        <div className="flex items-center md:absolute md:left-1/2 md:-translate-x-1/2">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-12 md:h-16 w-auto" // 增加 logo 大小，並加入響應式設計
          />
        </div>

        {/* 在手機版時隱藏，在電腦版時顯示並佔位，確保 Logo 能置中 */}
        <div className="hidden md:block invisible">
          <div className="w-[180px]"></div> {/* 約等於 select 的寬度 */}
        </div>

        {/* Dropdown 區域 */}
        <div className="relative">
          <select
            className="bg-opacity-50 bg-black text-white px-6 py-3 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-emerald-400 
                       text-lg hover:bg-opacity-70 transition-all"
            value={selectedPeriod}
            onChange={handlePeriodChange}
          >
            <option value="202501T">202501T</option>
            <option value="202502T">202502T</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Banner;
