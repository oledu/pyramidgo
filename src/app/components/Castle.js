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

    // 創建漸變色血條的輔助函數
    function createGradient(ctx, x, y, width, height, health) {
      const gradient = ctx.createLinearGradient(x, y, x + width, y);

      // 根據健康值選擇不同的顏色漸變
      if (health > 0.7) {
        // 綠色漸變 - 高健康
        gradient.addColorStop(0, 'rgba(0, 255, 100, 1)');
        gradient.addColorStop(0.5, 'rgba(100, 255, 150, 1)');
        gradient.addColorStop(1, 'rgba(50, 255, 100, 1)');
      } else if (health > 0.4) {
        // 黃色漸變 - 中等健康
        gradient.addColorStop(0, 'rgba(255, 200, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(1, 'rgba(255, 200, 50, 1)');
      } else {
        // 紅色漸變 - 低健康
        gradient.addColorStop(0, 'rgba(255, 50, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 50, 1)');
        gradient.addColorStop(1, 'rgba(200, 0, 0, 1)');
      }

      return gradient;
    }

    // 這裡定義要繪製的圖層
    // 每個圖層包含：圖片路徑、透明度、相對坐標和尺寸
    const layers = [
      {
        src: '/castle_bg3.png', // 使用背景圖
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
      // 取得分數
      const score =
        data.scores.reduce((total, item) => total + item.SCORE_TOTAL, 0) || 0;

      // 定義城堡位置和對應的標籤
      const castles = [
        { x: 0.2, y: 0.25, label: '經典-房間', health: 0.75 }, // 示例
        { x: 0.4, y: 0.35, label: '樓層-房間', health: 0.9 },
        { x: 0.35, y: 0.45, label: '樓層-房間', health: 0.6 },
        { x: 0.65, y: 0.45, label: '樓層-房間', health: 0.8 },
        { x: 0.8, y: 0.55, label: '樓層-房間', health: 0.4 },
        { x: 0.15, y: 0.58, label: '樓層-房間', health: 0.85 },
        { x: 0.4, y: 0.65, label: '樓層-房間', health: 0.3 },
        { x: 0.2, y: 0.75, label: '樓層-房間', health: 0.5 },
        { x: 0.4, y: 0.85, label: '樓層-房間', health: 0.7 },
      ];

      // 根據數據調整健康值
      if (data.castleHealth) {
        // 這裡可以使用真實數據替換模擬值
        castles.forEach((castle, index) => {
          if (data.castleHealth[index]) {
            castle.health = data.castleHealth[index];
          }
        });
      }

      // 首先添加所有的背景和血條元素，讓它們在城堡圖片下方
      castles.forEach((castle) => {
        // 血條容器背景 - 深色半透明背景
        layers.push({
          type: 'customHealthBar',
          x: castle.x - 0.06,
          y: castle.y + 0.13,
          w: 0.12,
          h: 0.025,
          health: castle.health,
          render: (ctx, x, y, w, h, health) => {
            // 1. 繪製外發光效果
            ctx.shadowColor = getHealthColor(health);
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 2. 繪製血條背景容器
            ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
            // 圓角矩形
            ctx.beginPath();
            const radius = h / 2;
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.arc(
              x + w - radius,
              y + radius,
              radius,
              -Math.PI / 2,
              Math.PI / 2
            );
            ctx.lineTo(x + radius, y + h);
            ctx.arc(x + radius, y + radius, radius, Math.PI / 2, -Math.PI / 2);
            ctx.closePath();
            ctx.fill();

            // 重置陰影，避免影響其他元素
            ctx.shadowBlur = 0;

            // 3. 繪製血條邊框
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 4. 繪製血條內部填充
            // 計算血條實際寬度
            const healthWidth = (w - 4) * health;

            // 創建漸變填充
            const gradient = createGradient(
              ctx,
              x + 2,
              y + 2,
              healthWidth,
              h - 4,
              health
            );

            // 繪製圓角血條
            ctx.fillStyle = gradient;

            if (healthWidth > 0) {
              ctx.beginPath();
              const innerRadius = Math.max(1, (h - 4) / 2);

              if (healthWidth < innerRadius * 2) {
                // 如果健康值太低，繪製部分圓角
                ctx.moveTo(x + 2, y + h / 2);
                ctx.arc(
                  x + 2 + innerRadius,
                  y + h / 2,
                  healthWidth / 2,
                  Math.PI / 2,
                  -Math.PI / 2
                );
                ctx.arc(
                  x + 2 + innerRadius,
                  y + h / 2,
                  healthWidth / 2,
                  -Math.PI / 2,
                  Math.PI / 2
                );
              } else {
                // 正常繪製圓角血條
                ctx.moveTo(x + 2 + innerRadius, y + 2);
                ctx.lineTo(x + 2 + healthWidth - innerRadius, y + 2);
                ctx.arc(
                  x + 2 + healthWidth - innerRadius,
                  y + h / 2,
                  innerRadius,
                  -Math.PI / 2,
                  Math.PI / 2
                );
                ctx.lineTo(x + 2 + innerRadius, y + h - 2);
                ctx.arc(
                  x + 2 + innerRadius,
                  y + h / 2,
                  innerRadius,
                  Math.PI / 2,
                  -Math.PI / 2
                );
              }

              ctx.closePath();
              ctx.fill();

              // 5. 添加高光效果
              const highlightGradient = ctx.createLinearGradient(
                x + 2,
                y + 2,
                x + 2,
                y + h / 2
              );
              highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
              highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

              ctx.fillStyle = highlightGradient;
              ctx.fill();
            }

            // 6. 可選：添加百分比文字
            if (w > 30) {
              // 只在血條夠寬時顯示文字
              ctx.fillStyle = 'white';
              ctx.font = `${Math.max(8, h * 0.8)}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(
                `${Math.round(health * 100)}%`,
                x + w / 2,
                y + h / 2
              );
            }
          },
        });
      });

      // 然後添加所有城堡圖片和標籤，讓它們在血條上方
      castles.forEach((castle) => {
        // 使用圓形代替城堡圖片進行測試
        layers.push({
          type: 'circle',
          color: 'rgba(200, 200, 200, 0.9)',
          x: castle.x,
          y: castle.y + 0.05,
          radius: 0.04,
        });

        // 在繪製圖片時將標籤信息傳遞給繪製函數
        layers.push({
          type: 'label',
          text: castle.label,
          color: '#FF00FF', // 亮粉色
          x: castle.x,
          y: castle.y + 0.11,
          size: 0.02,
        });
      });
    } else {
      // 如果沒有數據，添加一些測試元素
      console.log('No data available, adding test elements');

      // 添加測試用的城堡和血條
      const testPositions = [
        { x: 0.37, y: 0.32, health: 0.8, cname: '原岩明德' },
        { x: 0.42, y: 0.44, health: 0.8, cname: '角中山' },
        { x: 0.2, y: 0.55, health: 0.8, cname: '原岩萬華' },
        { x: 0.58, y: 0.53, health: 0.8, cname: '角華山' },
        { x: 0.32, y: 0.68, health: 0.8, cname: '原岩中和' },
        { x: 0.1, y: 0.8, health: 0.8, cname: '原岩A19' },
        { x: 0.6, y: 0.75, health: 0.8, cname: '原岩新店' },
        { x: 0.83, y: 0.57, health: 0.8, cname: '原岩南港' },
      ];

      testPositions.forEach((pos) => {
        // 使用自定義血條
        layers.push({
          type: 'customHealthBar',
          x: pos.x - 0.06,
          y: pos.y + 0.08,
          w: 0.12,
          h: 0.025,
          health: pos.health,
          render: (ctx, x, y, w, h, health) => {
            // 1. 繪製外發光效果
            ctx.shadowColor = getHealthColor(health);
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 2. 繪製血條背景容器
            ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
            // 圓角矩形
            ctx.beginPath();
            const radius = h / 2;
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.arc(
              x + w - radius,
              y + radius,
              radius,
              -Math.PI / 2,
              Math.PI / 2
            );
            ctx.lineTo(x + radius, y + h);
            ctx.arc(x + radius, y + radius, radius, Math.PI / 2, -Math.PI / 2);
            ctx.closePath();
            ctx.fill();

            // 重置陰影，避免影響其他元素
            ctx.shadowBlur = 0;

            // 3. 繪製血條邊框
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 4. 繪製血條內部填充
            // 計算血條實際寬度
            const healthWidth = (w - 4) * health;

            // 創建漸變填充
            const gradient = createGradient(
              ctx,
              x + 2,
              y + 2,
              healthWidth,
              h - 4,
              health
            );

            // 繪製圓角血條
            ctx.fillStyle = gradient;

            if (healthWidth > 0) {
              ctx.beginPath();
              const innerRadius = Math.max(1, (h - 4) / 2);

              if (healthWidth < innerRadius * 2) {
                // 如果健康值太低，繪製部分圓角
                ctx.moveTo(x + 2, y + h / 2);
                ctx.arc(
                  x + 2 + innerRadius,
                  y + h / 2,
                  healthWidth / 2,
                  Math.PI / 2,
                  -Math.PI / 2
                );
                ctx.arc(
                  x + 2 + innerRadius,
                  y + h / 2,
                  healthWidth / 2,
                  -Math.PI / 2,
                  Math.PI / 2
                );
              } else {
                // 正常繪製圓角血條
                ctx.moveTo(x + 2 + innerRadius, y + 2);
                ctx.lineTo(x + 2 + healthWidth - innerRadius, y + 2);
                ctx.arc(
                  x + 2 + healthWidth - innerRadius,
                  y + h / 2,
                  innerRadius,
                  -Math.PI / 2,
                  Math.PI / 2
                );
                ctx.lineTo(x + 2 + innerRadius, y + h - 2);
                ctx.arc(
                  x + 2 + innerRadius,
                  y + h / 2,
                  innerRadius,
                  Math.PI / 2,
                  -Math.PI / 2
                );
              }

              ctx.closePath();
              ctx.fill();

              // 5. 添加高光效果
              const highlightGradient = ctx.createLinearGradient(
                x + 2,
                y + 2,
                x + 2,
                y + h / 2
              );
              highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
              highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

              ctx.fillStyle = highlightGradient;
              ctx.fill();
            }

            // 6. 可選：添加百分比文字
            if (w > 30) {
              // 只在血條夠寬時顯示文字
              ctx.fillStyle = 'white';
              ctx.font = `${Math.max(8, h * 0.8)}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(
                `${Math.round(health * 100)}%`,
                x + w / 2,
                y + h / 2
              );
            }
          },
        });
      });
    }

    // 根據健康值獲取顏色 - 調整為更鮮艷的顏色
    function getHealthColor(health) {
      if (health > 0.7) return 'rgba(50, 255, 50, 1)'; // 更亮的綠色
      if (health > 0.4) return 'rgba(255, 255, 50, 1)'; // 更亮的黃色
      return 'rgba(255, 50, 50, 1)'; // 更亮的紅色
    }

    // 繪製所有圖層
    const drawImages = async () => {
      // 清除畫布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        for (const layer of layers) {
          if (layer.type === 'rect') {
            // 繪製矩形（用於血條）
            ctx.fillStyle = layer.color;
            ctx.fillRect(
              layer.x * canvas.width,
              layer.y * canvas.height,
              layer.w * canvas.width,
              layer.h * canvas.height
            );
          } else if (layer.type === 'customHealthBar') {
            // 使用自定義渲染函數繪製血條
            layer.render(
              ctx,
              layer.x * canvas.width,
              layer.y * canvas.height,
              layer.w * canvas.width,
              layer.h * canvas.height,
              layer.health
            );
          } else if (layer.type === 'circle') {
            // 繪製圓形（用於城堡圖示）
            ctx.beginPath();
            ctx.arc(
              layer.x * canvas.width,
              layer.y * canvas.height,
              layer.radius * canvas.width,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = layer.color;
            ctx.fill();
          } else if (layer.type === 'castle') {
            // 繪製復古風格城堡
            layer.render(
              ctx,
              layer.x * canvas.width,
              layer.y * canvas.height,
              layer.radius * canvas.width,
              layer.cname
            );
          } else if (layer.type === 'label') {
            // 繪製文字標籤
            ctx.fillStyle = layer.color;
            ctx.font = `${Math.max(12, layer.size * canvas.width)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(
              layer.text,
              layer.x * canvas.width,
              layer.y * canvas.height
            );
          } else {
            // 繪製圖片
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
                ctx.globalAlpha = 1.0; // 重置透明度
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
