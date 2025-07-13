'use client';
import { useState, useEffect, useRef } from 'react';

const PeriodSelector = ({ onPeriodChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('202506T');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const periods = [
    { key: '202506T', label: '航行中 2025/07/12~07/25' },
    { key: '202505T', label: '已完成 2025/06/15~06/28' },
    { key: '202504T', label: '已完成 2025/05/11~05/29' },
    { key: '202503T', label: '已完成 2025/04/06~04/19' },
    { key: '202502T', label: '已完成 2025/03/16~03/29' },
    { key: '202501T', label: '已完成 2025/03/02~03/15' },
  ];

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

  const handlePeriodSelect = (periodKey) => {
    setSelectedPeriod(periodKey);
    setIsOpen(false);
    onPeriodChange(periodKey);
  };

  // 找到當前選擇的期間的顯示文字
  const selectedLabel = periods.find((p) => p.key === selectedPeriod)?.label;

  return (
    <div className="relative w-[300px] md:w-[320px]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-8 pr-6 md:pl-10 md:pr-8 py-2 
                 rounded-full
                 flex justify-between items-center gap-4 md:gap-6
                 transition-all
                 bg-black/80
                 border border-purple-500"
      >
        <span className="text-base md:text-lg font-extrabold text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text">
          {selectedLabel}
        </span>
        <svg
          className={`w-4 h-4 md:w-5 md:h-5 transition-transform stroke-purple-500 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
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

      {isOpen && (
        <div
          className="absolute w-full mt-2 bg-black/80
                    shadow-lg overflow-hidden z-50
                    border border-purple-500 rounded-2xl"
        >
          {periods.map((period, index) => (
            <button
              key={period.key}
              className={`w-full px-8 md:px-10 py-2 text-left text-base md:text-lg font-extrabold
                       transition-colors
                       ${index === 0 ? 'rounded-t-2xl' : ''}
                       ${index === periods.length - 1 ? 'rounded-b-2xl' : ''}
                       ${
                         selectedPeriod === period.key
                           ? 'text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text'
                           : 'text-white hover:text-transparent hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 hover:bg-clip-text'
                       }`}
              onClick={() => handlePeriodSelect(period.key)}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
