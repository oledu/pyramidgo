'use client';
import { useState } from 'react';

const Banner = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('202502T');

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  return (
    <div
      className="w-full bg-black bg-opacity-10
                    shadow-lg px-6 py-4 md:py-8"
    >
      <div className="container mx-auto relative flex justify-between items-center">
        {/* Logo 區域 */}
        <div className="flex items-center md:absolute md:left-1/2 md:-translate-x-1/2">
          <img src="/logo.png" alt="Logo" className="h-12 md:h-20 w-auto" />
        </div>

        {/* 在手機版時隱藏，在電腦版時顯示並佔位 */}
        <div className="hidden md:block invisible">
          <div className="w-[180px]"></div>
        </div>

        {/* Dropdown 區域 */}
        <div className="relative">
          <select
            className="bg-black bg-opacity-20 text-white px-6 py-3 
                     rounded-lg border border-white/20
                     focus:outline-none focus:ring-2 focus:ring-white/30 
                     text-lg hover:bg-opacity-30 transition-all
                     shadow-sm"
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
