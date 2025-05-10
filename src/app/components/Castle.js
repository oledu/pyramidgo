'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Castle 組件 - 使用 Canvas 實現多層 PNG 圖片重疊效果
 * @param {Object} data - 數據物件
 * @param {string} period - 當前時期
 */
const Castle = ({ data, period }) => {
  if (period < '202504T') {
    return null;
  }

  console.log('dataCastle', data);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCastle, setSelectedCastle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const castlePositionsRef = useRef([]);

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

  // 處理點擊事件
  useEffect(() => {
    const handleClick = (event) => {
      if (!canvasRef.current) return;

      // 獲取點擊位置相對於Canvas的座標
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      // 檢查是否點擊了任何城堡
      const clickedCastle = castlePositionsRef.current.find((castle) => {
        // 計算點擊位置和城堡中心點的距離
        const dx = x - castle.x;
        const dy = y - castle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 擴大可點擊區域，使其更容易點擊
        return distance < 0.08; // 增加點擊區域範圍
      });

      if (clickedCastle) {
        setSelectedCastle(clickedCastle);
        setShowModal(true);
      }
    };

    // 如果Canvas已經加載，添加點擊事件監聽器
    if (canvasRef.current) {
      canvasRef.current.addEventListener('click', handleClick);
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [dimensions]);

  // 鼠標懸停效果
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 記錄原始繪圖函數的參考
    const originalDrawImages = canvas._drawImages;

    // 當前懸停的城堡
    let hoveredCastle = null;

    // 鼠標移動事件處理
    const handleMouseMove = (event) => {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      // 檢查是否懸停在任何城堡上
      const castle = castlePositionsRef.current.find((castle) => {
        const dx = x - castle.x;
        const dy = y - castle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 0.08; // 使用與點擊相同的範圍
      });

      // 改變鼠標指針樣式
      if (castle) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }

      // 如果懸停城堡發生變化，重繪Canvas
      if (castle !== hoveredCastle) {
        hoveredCastle = castle;
        // 重繪Canvas以顯示懸停效果
        if (typeof originalDrawImages === 'function') {
          originalDrawImages(hoveredCastle);
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dimensions]);

  // 繪製重疊圖片
  useEffect(() => {
    if (dimensions.width === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 設置 canvas 尺寸
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    setIsLoading(true);

    // 處理城堡記錄數據，找出每個城堡最新的記錄
    const processLatestCastleRecords = (records) => {
      if (!records || !Array.isArray(records) || records.length === 0)
        return [];

      // 使用reduce方法一次性處理所有記錄
      // 創建一個對象，以城堡名稱為key，最新記錄為value
      return Object.values(
        records.reduce((latest, record) => {
          const castle = record.CASTLE;
          const currentDate = new Date(record.START_DATE);

          // 如果這個城堡尚未記錄，或此記錄的日期比已存在的更新
          if (
            !latest[castle] ||
            new Date(latest[castle].START_DATE) < currentDate
          ) {
            latest[castle] = record;
          }

          return latest;
        }, {})
      );
    };

    // 如果有數據，處理城堡記錄
    let processedCastles = [];
    if (data && data.castle_records) {
      processedCastles = processLatestCastleRecords(data.castle_records);
      console.log('處理後的城堡記錄:', processedCastles);
    } else {
      // 如果沒有數據，使用示例數據進行測試
      const sampleCastleRecords = [
        {
          START_DATE: '2025/4/11',
          CASTLE: 'Tup Mingde',
          HP: '10000',
        },
        {
          START_DATE: '2025/4/6',
          CASTLE: 'Tup Wanhua',
          HP: '9000',
        },
        {
          START_DATE: '2025/4/12',
          CASTLE: 'Tup A19',
          HP: '8000',
        },
        {
          START_DATE: '2025/5/11',
          CASTLE: 'Tup Zhonghe',
          HP: '7000',
        },
        {
          START_DATE: '2025/5/11',
          CASTLE: 'Tup Hsindian',
          HP: '6000',
        },
        {
          START_DATE: '2025/5/11',
          CASTLE: 'Tup Nangang',
          HP: '5000',
        },
        {
          START_DATE: '2025/5/11',
          CASTLE: 'Corner Huashan',
          HP: '4000',
        },
        {
          START_DATE: '2025/5/11',
          CASTLE: 'Corner Zhongshan',
          HP: '3000',
        },
        {
          START_DATE: '2025/5/13',
          CASTLE: 'Corner Zhongshan',
          HP: '2800',
        },
      ];
      processedCastles = processLatestCastleRecords(sampleCastleRecords);
      console.log('處理後的示例城堡記錄:', processedCastles);
    }

    // 創建漸變色血條的輔助函數
    function createGradient(ctx, x, y, width, height, healthPercent) {
      const gradient = ctx.createLinearGradient(x, y, x + width, y);

      // 不同健康值下的紅色系漸變
      if (healthPercent > 0.7) {
        // 亮紅色漸變 - 高健康
        gradient.addColorStop(0, 'rgba(220, 20, 20, 1)'); // 亮紅色
        gradient.addColorStop(0.5, 'rgba(255, 50, 50, 1)'); // 更亮的紅色
        gradient.addColorStop(1, 'rgba(180, 0, 0, 1)'); // 深紅色
      } else if (healthPercent > 0.4) {
        // 中等紅色漸變 - 中等健康
        gradient.addColorStop(0, 'rgba(180, 0, 0, 1)'); // 深紅色
        gradient.addColorStop(0.5, 'rgba(220, 20, 20, 1)'); // 亮紅色
        gradient.addColorStop(1, 'rgba(139, 0, 0, 1)'); // 深暗紅色
      } else {
        // 暗紅色漸變 - 低健康
        gradient.addColorStop(0, 'rgba(139, 0, 0, 1)'); // 深暗紅色
        gradient.addColorStop(0.5, 'rgba(178, 34, 34, 1)'); // 火磚紅
        gradient.addColorStop(1, 'rgba(128, 0, 0, 1)'); // 栗色
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
            // 計算健康百分比
            const healthPercent = health.current / health.total;

            // 1. 調整外發光效果 - 復古風格減少發光效果
            ctx.shadowColor = getHealthColor(healthPercent);
            ctx.shadowBlur = 3; // 減少發光強度
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 2. 繪製血條背景容器 - 更深沉的背景
            ctx.fillStyle = 'rgba(48, 48, 48, 0.85)';
            // 降低圓角矩形的圓度
            ctx.beginPath();
            const radius = h / 4; // 減少圓角半徑
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

            // 3. 繪製血條邊框 - 復古風格邊框
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 4. 繪製血條內部填充
            // 計算血條實際寬度（稍微縮小內部區域）
            const healthWidth = (w - 6) * healthPercent;

            // 創建復古漸變填充
            const gradient = createGradient(
              ctx,
              x + 3,
              y + 3,
              healthWidth,
              h - 6,
              healthPercent
            );

            // 繪製降低圓角的血條
            ctx.fillStyle = gradient;

            if (healthWidth > 0) {
              ctx.beginPath();
              const innerRadius = Math.max(1, (h - 6) / 4); // 降低內部圓角

              if (healthWidth < innerRadius * 2) {
                // 如果健康值太低，繪製部分圓角
                ctx.moveTo(x + 3, y + h / 2);
                ctx.arc(
                  x + 3 + innerRadius,
                  y + h / 2,
                  healthWidth / 2,
                  Math.PI / 2,
                  -Math.PI / 2
                );
                ctx.arc(
                  x + 3 + innerRadius,
                  y + h / 2,
                  healthWidth / 2,
                  -Math.PI / 2,
                  Math.PI / 2
                );
              } else {
                // 正常繪製圓角血條
                ctx.moveTo(x + 3 + innerRadius, y + 3);
                ctx.lineTo(x + 3 + healthWidth - innerRadius, y + 3);
                ctx.arc(
                  x + 3 + healthWidth - innerRadius,
                  y + h / 2,
                  innerRadius,
                  -Math.PI / 2,
                  Math.PI / 2
                );
                ctx.lineTo(x + 3 + innerRadius, y + h - 3);
                ctx.arc(
                  x + 3 + innerRadius,
                  y + h / 2,
                  innerRadius,
                  Math.PI / 2,
                  -Math.PI / 2
                );
              }

              ctx.closePath();
              ctx.fill();

              // 5. 添加更微妙的高光效果 - 復古風格減少高光
              const highlightGradient = ctx.createLinearGradient(
                x + 3,
                y + 3,
                x + 3,
                y + h / 2
              );
              highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
              highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

              ctx.fillStyle = highlightGradient;
              ctx.fill();

              // 添加底部陰影效果增強復古感
              const shadowGradient = ctx.createLinearGradient(
                x + 3,
                y + h / 2,
                x + 3,
                y + h - 3
              );
              shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
              shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

              ctx.fillStyle = shadowGradient;
              ctx.fill();
            }

            // 6. 復古風格的百分比文字
            if (w > 30) {
              // 計算並進位到千分之一的百分比
              const percentText = `${Math.ceil(healthPercent * 100 * 10) / 10}%`;

              ctx.fillStyle = 'rgba(255, 250, 205, 0.9)'; // 淡黃色
              ctx.font = `bold ${Math.max(8, h * 0.7)}px monospace`; // 使用等寬字體更復古
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(percentText, x + w / 2, y + h / 2);

              // 復古文字描邊
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
              ctx.lineWidth = 0.5;
              ctx.strokeText(percentText, x + w / 2, y + h / 2);
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
        {
          x: 0.38,
          y: 0.32,
          health: { current: 8000, total: 10000 },
          cname: '原岩明德',
          castleId: 'Tup Mingde',
        },
        {
          x: 0.44,
          y: 0.44,
          health: { current: 7500, total: 10000 },
          cname: '角中山',
          castleId: 'Corner Zhongshan',
        },
        {
          x: 0.2,
          y: 0.55,
          health: { current: 6000, total: 10000 },
          cname: '原岩萬華',
          castleId: 'Tup Wanhua',
        },
        {
          x: 0.595,
          y: 0.515,
          health: { current: 9000, total: 10000 },
          cname: '角華山',
          castleId: 'Corner Huashan',
        },
        {
          x: 0.36,
          y: 0.675,
          health: { current: 4500, total: 10000 },
          cname: '原岩中和',
          castleId: 'Tup Zhonghe',
        },
        {
          x: 0.15,
          y: 0.81,
          health: { current: 15, total: 10000 },
          cname: '原岩A19',
          castleId: 'Tup A19',
        },
        {
          x: 0.61,
          y: 0.75,
          health: { current: 5000, total: 10000 },
          cname: '原岩新店',
          castleId: 'Tup Hsindian',
        },
        {
          x: 0.86,
          y: 0.58,
          health: { current: 2000, total: 10000 },
          cname: '原岩南港',
          castleId: 'Tup Nangang',
        },
      ];

      // 更新城堡位置參考
      castlePositionsRef.current = testPositions;

      // 根據處理後的城堡記錄更新城堡血量
      if (processedCastles.length > 0) {
        testPositions.forEach((position) => {
          const castleRecord = processedCastles.find(
            (record) => record.CASTLE === position.castleId
          );
          if (castleRecord) {
            position.health.current = parseInt(castleRecord.HP);
            // 確保當前血量不超過總血量
            if (position.health.current > position.health.total) {
              position.health.total = position.health.current;
            }
          }
        });
      }

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
            // 計算健康百分比
            const healthPercent = health.current / health.total;

            // 1. 調整外發光效果 - 復古風格減少發光效果
            ctx.shadowColor = getHealthColor(healthPercent);
            ctx.shadowBlur = 3; // 減少發光強度
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 2. 繪製血條背景容器 - 更深沉的背景
            ctx.fillStyle = 'rgba(48, 48, 48, 0.85)';
            // 降低圓角矩形的圓度
            ctx.beginPath();
            const radius = h / 4; // 減少圓角半徑
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

            // 3. 繪製血條邊框 - 復古風格邊框
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 4. 繪製血條內部填充
            // 計算血條實際寬度（稍微縮小內部區域）
            const healthWidth = (w - 6) * healthPercent;

            // 創建復古漸變填充
            const gradient = createGradient(
              ctx,
              x + 3,
              y + 3,
              healthWidth,
              h - 6,
              healthPercent
            );

            // 繪製降低圓角的血條
            ctx.fillStyle = gradient;

            if (healthWidth > 0) {
              ctx.beginPath();
              const innerRadius = Math.max(1, (h - 6) / 4); // 降低內部圓角

              if (healthWidth < innerRadius * 2) {
                // 如果健康值太低，繪製部分圓角
                ctx.moveTo(x + 3, y + h / 2);
                ctx.arc(
                  x + 3 + innerRadius,
                  y + h / 2,
                  healthWidth / 2,
                  Math.PI / 2,
                  -Math.PI / 2
                );
                ctx.arc(
                  x + 3 + innerRadius,
                  y + h / 2,
                  healthWidth / 2,
                  -Math.PI / 2,
                  Math.PI / 2
                );
              } else {
                // 正常繪製圓角血條
                ctx.moveTo(x + 3 + innerRadius, y + 3);
                ctx.lineTo(x + 3 + healthWidth - innerRadius, y + 3);
                ctx.arc(
                  x + 3 + healthWidth - innerRadius,
                  y + h / 2,
                  innerRadius,
                  -Math.PI / 2,
                  Math.PI / 2
                );
                ctx.lineTo(x + 3 + innerRadius, y + h - 3);
                ctx.arc(
                  x + 3 + innerRadius,
                  y + h / 2,
                  innerRadius,
                  Math.PI / 2,
                  -Math.PI / 2
                );
              }

              ctx.closePath();
              ctx.fill();

              // 5. 添加更微妙的高光效果 - 復古風格減少高光
              const highlightGradient = ctx.createLinearGradient(
                x + 3,
                y + 3,
                x + 3,
                y + h / 2
              );
              highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
              highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

              ctx.fillStyle = highlightGradient;
              ctx.fill();

              // 添加底部陰影效果增強復古感
              const shadowGradient = ctx.createLinearGradient(
                x + 3,
                y + h / 2,
                x + 3,
                y + h - 3
              );
              shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
              shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

              ctx.fillStyle = shadowGradient;
              ctx.fill();
            }

            // 6. 復古風格的百分比文字
            if (w > 30) {
              // 計算並進位到千分之一的百分比
              const percentText = `${Math.ceil(healthPercent * 100 * 10) / 10}%`;

              ctx.fillStyle = 'rgba(255, 250, 205, 0.9)'; // 淡黃色
              ctx.font = `bold ${Math.max(8, h * 0.7)}px monospace`; // 使用等寬字體更復古
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(percentText, x + w / 2, y + h / 2);

              // 復古文字描邊
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
              ctx.lineWidth = 0.5;
              ctx.strokeText(percentText, x + w / 2, y + h / 2);
            }
          },
        });
      });
    }

    // 根據健康值獲取顏色 - 統一使用紅色系
    function getHealthColor(healthPercent) {
      if (healthPercent > 0.7) return 'rgba(220, 20, 20, 1)'; // 亮紅色
      if (healthPercent > 0.4) return 'rgba(180, 0, 0, 1)'; // 深紅色
      return 'rgba(139, 0, 0, 1)'; // 深暗紅色
    }

    // 繪製所有圖層
    const drawImages = async (hoveredCastle = null) => {
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
            // 使用圓形代替城堡圖示，並處理懸停效果
            const isCastleHovered =
              hoveredCastle &&
              hoveredCastle.x === layer.x &&
              hoveredCastle.y === layer.y;

            // 如果正在懸停，繪製較大的提示圓圈
            if (isCastleHovered) {
              // 繪製外圍提示環
              ctx.beginPath();
              ctx.arc(
                layer.x * canvas.width,
                layer.y * canvas.height,
                layer.radius * 1.5 * canvas.width,
                0,
                Math.PI * 2
              );
              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
              ctx.fill();

              // 繪製內部提示陰影
              ctx.beginPath();
              ctx.arc(
                layer.x * canvas.width,
                layer.y * canvas.height,
                layer.radius * 1.2 * canvas.width,
                0,
                Math.PI * 2
              );
              ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
              ctx.fill();
            }

            // 繪製原始圓形
            ctx.beginPath();
            ctx.arc(
              layer.x * canvas.width,
              layer.y * canvas.height,
              layer.radius * canvas.width,
              0,
              Math.PI * 2
            );

            // 如果正在懸停，使用更亮的顏色
            ctx.fillStyle = isCastleHovered
              ? 'rgba(255, 200, 200, 0.9)'
              : layer.color;
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

        // 添加城堡可點擊提示
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('點擊城堡查看詳情', canvas.width / 2, 30);

        setIsLoading(false);
      } catch (error) {
        console.error('Error drawing images:', error);
        setIsLoading(false);
      }
    };

    // 保存繪圖函數引用以便懸停效果使用
    canvas._drawImages = drawImages;

    drawImages();
  }, [dimensions, data, period]);

  // 關閉Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCastle(null);
  };

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

      {/* 城堡詳情模態框 */}
      {showModal && selectedCastle && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="bg-gray-900 border-2 border-red-800 rounded-lg p-6 max-w-md w-11/12 text-center relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-red-500 mb-4">
              {selectedCastle.cname}
            </h2>

            <div className="mb-4">
              <div className="w-full bg-gray-800 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-red-700 to-red-500 h-4 rounded-full"
                  style={{
                    width: `${(selectedCastle.health.current / selectedCastle.health.total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-white">
                血量: {selectedCastle.health.current} /{' '}
                {selectedCastle.health.total}(
                {Math.ceil(
                  (selectedCastle.health.current /
                    selectedCastle.health.total) *
                    1000
                ) / 10}
                %)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">攻擊力</p>
                <p className="text-white font-bold">1200</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">防禦力</p>
                <p className="text-white font-bold">850</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">人口</p>
                <p className="text-white font-bold">5000</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">資源</p>
                <p className="text-white font-bold">10500</p>
              </div>
            </div>

            <button
              className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full"
              onClick={closeModal}
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Castle;
