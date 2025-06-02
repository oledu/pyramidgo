'use client';
import { useState, useRef, useEffect } from 'react';

const Prize = ({ prizeImagePath = '/prize.png' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    // Update container height based on viewport
    const updateContainerHeight = () => {
      setContainerHeight(window.innerHeight - 250); // Adjust as needed
    };

    // Initial setup
    updateContainerHeight();

    // Add resize listener
    window.addEventListener('resize', updateContainerHeight);

    return () => {
      window.removeEventListener('resize', updateContainerHeight);
    };
  }, []);

  // Handle scrolling events
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollTop);
    }
  };

  // 處理圖片載入完成事件
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-white text-center text-2xl font-bold mb-4">
        得獎名單
      </h2>

      <div className="w-full max-w-4xl mx-auto bg-black/80 rounded-lg p-4">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="relative overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black"
          style={{
            height: `${containerHeight}px`,
            maxHeight: `${containerHeight}px`,
          }}
          onScroll={handleScroll}
        >
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {/* 替換 Image 組件為普通 img 標籤 */}
          <div className="relative w-full">
            <img
              src={prizeImagePath}
              alt="得獎名單"
              className="w-full rounded-lg"
              onLoad={handleImageLoad}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="w-full h-1 bg-gray-800 mt-4 rounded-full">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{
              width:
                scrollContainerRef.current &&
                scrollContainerRef.current.scrollHeight > 0
                  ? `${(scrollPosition / (scrollContainerRef.current.scrollHeight - containerHeight)) * 100}%`
                  : '0%',
            }}
          ></div>
        </div>
      </div>

      <p className="text-gray-300 text-center text-sm mt-4">
        可上下滾動查看完整得獎名單
      </p>
    </div>
  );
};

export default Prize;
