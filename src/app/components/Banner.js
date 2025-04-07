'use client';
import { useState, useEffect, useRef } from 'react';

const Banner = ({ onPeriodChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('202503T');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    onPeriodChange('202503T');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const periods = ['202501T', '202502T', '202503T'];

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    setIsOpen(false);
    onPeriodChange(period);
  };

  return (
    <div className="w-full bg-black bg-opacity-10 shadow-lg px-6 py-4 md:py-8">
      <div className="container mx-auto relative flex justify-between items-center">
        {/* Logo 區域 */}
        <div className="flex items-center md:absolute md:left-1/2 md:-translate-x-1/2">
          <img src="/logo.png" alt="Logo" className="h-12 md:h-20 w-auto" />
        </div>

        {/* 在手機版時隱藏，在電腦版時顯示並佔位 */}
        <div className="hidden md:block invisible">
          <div className="w-[120px]"></div>
        </div>

        {/* 自定義 Dropdown */}
        <div className="relative w-[100px] md:w-[120px]" ref={dropdownRef}>
          {/* Dropdown 觸發按鈕 */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full pl-3 pr-2 md:pl-4 md:pr-3 py-1.5 bg-black/40 text-white
                     rounded-full border border-white/20
                     flex justify-between items-center gap-1 md:gap-2
                     hover:bg-black/50 hover:border-white/30 
                     transition-all"
          >
            <span className="text-sm md:text-base">{selectedPeriod}</span>
            <svg
              className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown 選項 */}
          {isOpen && (
            <div
              className="absolute w-full mt-1 bg-black/90 rounded-xl 
                          shadow-lg overflow-hidden z-50
                          border border-white/10"
            >
              {periods.map((period) => (
                <button
                  key={period}
                  className={`w-full px-3 md:px-4 py-1.5 text-left text-sm md:text-base
                           transition-colors
                           ${
                             selectedPeriod === period
                               ? 'bg-purple-500 text-white'
                               : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                           }`}
                  onClick={() => handlePeriodSelect(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;
