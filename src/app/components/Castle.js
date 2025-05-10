'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Castle 組件 - 使用 Canvas 實現多層 PNG 圖片重疊效果
 * @param {Object} data - 數據物件
 * @param {string} period - 當前時期
 */
const Castle = ({ data, period }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 根據容器設置 Canvas 尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        // 獲取容器寬度
        const width = containerRef.current.clientWidth;
        // 設置高度為寬度的 1.78 倍（手機螢幕的通常長寬比例）
        // 您可以根據圖片的實際比例調整這個數字
        setDimensions({ width, height: width * 1.78 });
      }
    };

    // 初始化尺寸
    updateDimensions();

    // 添加 resize 監聽
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 繪製重疊圖片
  useEffect(() => {
    if (dimensions.width === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 設置 canvas 尺寸
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    setIsLoading(true);

    // 這裡定義要繪製的圖層
    // 每個圖層包含：圖片路徑、透明度、相對坐標和尺寸
    const layers = [
      {
        src: '/castle_bg3.png', // 使用您提供的背景圖
        opacity: 1,
        x: 0,
        y: 0,
        w: 1,
        h: 1,
      },
    ];

    // 根據數據添加動態圖層
    // 這裡只是示例，您可以根據實際數據結構調整
    if (data && data.scores) {
      // 舉例：根據分數添加不同的旗幟或裝飾
      const score =
        data.scores.reduce((total, item) => total + item.SCORE_TOTAL, 0) || 0;
    }

    // 繪製所有圖層
    const drawImages = async () => {
      // 清除畫布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        for (const layer of layers) {
          await new Promise((resolve, reject) => {
            const imgElement = new Image();

            imgElement.onload = () => {
              // 設置透明度
              ctx.globalAlpha = layer.opacity;

              // 將相對座標轉換為像素座標
              const x = layer.x * canvas.width;
              const y = layer.y * canvas.height;
              const w = layer.w * canvas.width;
              const h = layer.h * canvas.height;

              // 繪製圖片
              ctx.drawImage(imgElement, x, y, w, h);
              resolve();
            };

            imgElement.onerror = () => {
              console.error(`Failed to load image: ${layer.src}`);
              // 繼續處理下一個圖層，而不是中斷整個流程
              resolve();
            };

            imgElement.src = layer.src;
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error drawing images:', error);
        setIsLoading(false);
      }
    };

    drawImages();
  }, [dimensions, data, period]);

  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={containerRef}
        className="w-full mx-auto bg-black/50 rounded-lg overflow-hidden relative"
        style={{ aspectRatio: '9/16', maxWidth: '900px' }} // 添加最大寬度 900px
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default Castle;
