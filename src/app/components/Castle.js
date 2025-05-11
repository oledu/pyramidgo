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
  const [castlesData, setCastlesData] = useState([]);

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
            // 添加原始血量字段，用於保存城堡初始血量
            latest[castle].ORIGINAL_HP = record.HP;
          }

          return latest;
        }, {})
      );
    };

    // 處理城堡參與者數據，依據CLMBR_NM和HOME_GYM找出最新的記錄
    const processLatestCastleParticipants = (participants) => {
      if (
        !participants ||
        !Array.isArray(participants) ||
        participants.length === 0
      )
        return [];

      // 使用reduce方法處理所有參與者記錄
      // 創建一個對象，以 "玩家名稱-主場館" 組合為key，最新記錄為value
      return Object.values(
        participants.reduce((latest, participant) => {
          const key = `${participant.CLMBR_NM}-${participant.HOME_GYM}`;
          const currentDate = new Date(participant.START_DATE);

          // 如果這個組合尚未記錄，或此記錄的日期比已存在的更新
          if (!latest[key] || new Date(latest[key].START_DATE) < currentDate) {
            latest[key] = participant;
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
    }

    // 如果有參與者數據，處理參與者記錄
    let processedParticipants = [];
    if (data && data.castle_participants) {
      processedParticipants = processLatestCastleParticipants(
        data.castle_participants
      );
      console.log('處理後的參與者記錄:', processedParticipants);
    }

    // 處理攀岩記錄並與參與者信息結合
    const processClimbingRecordsWithParticipants = (
      climbingRecords,
      participants
    ) => {
      console.log(
        'processClimbingRecordsWithParticipants',
        climbingRecords,
        participants
      );

      if (
        !climbingRecords ||
        !Array.isArray(climbingRecords) ||
        climbingRecords.length === 0
      ) {
        return [];
      }

      // 只處理有效的攀岩記錄（需要有GYM_NM和DATE）
      const validRecords = climbingRecords.filter(
        (record) => record.GYM_NM && record.DATE
      );

      // 將參與者數據轉換為以CLMBR_NM為鍵的查找映射
      const participantMap = participants.reduce((map, participant) => {
        if (!map[participant.CLMBR_NM]) {
          map[participant.CLMBR_NM] = [];
        }
        map[participant.CLMBR_NM].push(participant);
        return map;
      }, {});

      // 處理每一條攀岩記錄
      return validRecords.map((record) => {
        // 獲取攀岩者的參與者記錄
        const climberParticipants = participantMap[record.CLMBR_NM] || [];

        // 格式化攀岩記錄的日期（添加年份）
        const recordYear = '2025/'; // 假設記錄的年份是2025
        const recordDate = new Date(recordYear + record.DATE);

        // 尋找匹配的參與者記錄
        const matchingParticipant = climberParticipants.find((participant) => {
          // 檢查健身房是否匹配
          const gymMatches = participant.HOME_GYM === record.GYM_NM;

          // 檢查日期是否在範圍內
          const startDate = new Date(participant.START_DATE);
          const endDate = new Date(participant.END_DATE);
          const dateInRange = recordDate >= startDate && recordDate <= endDate;

          return gymMatches && dateInRange;
        });

        // 只添加isHomeGym標記，表示是否為主場館
        return {
          ...record,
          isHomeGym: !!matchingParticipant, // 如果找到匹配的參與者記錄，則為主場館
        };
      });
    };

    // 處理攀岩記錄
    let processedClimbingRecords = [];
    if (data && data.climbRecords) {
      processedClimbingRecords = processClimbingRecordsWithParticipants(
        data.climbRecords,
        processedParticipants
      );
      console.log('處理後的攀岩記錄:', processedClimbingRecords);
    }

    // 計算並更新城堡血量
    const processCastleAttacks = (climbingRecords, castles) => {
      if (
        !climbingRecords ||
        !Array.isArray(climbingRecords) ||
        climbingRecords.length === 0 ||
        !castles ||
        !Array.isArray(castles) ||
        castles.length === 0
      ) {
        return castles;
      }

      console.log('計算城堡攻擊', climbingRecords, castles);

      // 創建城堡映射表，以城堡名稱為索引
      const castleMap = castles.reduce((map, castle) => {
        map[castle.CASTLE] = castle;
        // 確保每個城堡有原始HP值
        if (!castle.ORIGINAL_HP) {
          castle.ORIGINAL_HP = castle.HP;
        }
        // 初始化每個城堡的攻擊者貢獻統計
        map[castle.CASTLE].attackers = {};
        return map;
      }, {});

      // 為了確保每天每個攀岩者在每個健身房的攀爬記錄不超過5條
      // 創建一個計數器: "攀岩者-日期-健身房" => 已計算的路線數
      const dailyClimbCounter = {};

      // 遍歷所有攀岩記錄，計算對城堡的傷害
      climbingRecords.forEach((record) => {
        // 確保記錄有健身房名稱且該健身房存在於城堡列表中
        if (record.GYM_NM && castleMap[record.GYM_NM]) {
          const castle = castleMap[record.GYM_NM];

          // 檢查攀爬記錄時間是否在城堡的START_DATE之後
          const recordYear = '2025/'; // 假設記錄的年份是2025
          const recordDate = new Date(recordYear + record.DATE);
          const castleStartDate = new Date(castle.START_DATE);

          // 只處理城堡開放日期後的攀爬記錄
          if (recordDate >= castleStartDate) {
            let damage = 0;

            // 計算攀爬記錄的指定日期在指定健身房的計數鍵
            const climberKey = `${record.CLMBR_NM}-${record.DATE}-${record.GYM_NM}`;
            dailyClimbCounter[climberKey] = dailyClimbCounter[climberKey] || 0;

            // 如果該攀岩者當天在這個健身房的計數少於5，則計算傷害
            if (dailyClimbCounter[climberKey] < 5) {
              // 計算路線傷害
              if (record.SENT_COUNT && !isNaN(parseInt(record.SENT_COUNT))) {
                // 計算實際計入的路線數（考慮每日上限）
                const countToAdd = Math.min(
                  parseInt(record.SENT_COUNT),
                  5 - dailyClimbCounter[climberKey]
                );
                damage += countToAdd * 20; // 每條路線20點傷害

                // 更新計數器
                dailyClimbCounter[climberKey] += countToAdd;
              }

              // 如果是主場館，額外扣100血
              if (record.isHomeGym) {
                damage += 100;
              }

              // 更新城堡血量
              const currentHP = parseInt(castle.HP);
              castle.HP = Math.max(0, currentHP - damage).toString();

              // 記錄攀岩者對該城堡的貢獻
              if (!castle.attackers[record.CLMBR_NM]) {
                castle.attackers[record.CLMBR_NM] = 0;
              }
              castle.attackers[record.CLMBR_NM] += damage;

              console.log(
                `${record.CLMBR_NM} 在 ${record.GYM_NM} 造成 ${damage} 點傷害，剩餘血量: ${castle.HP}`
              );
            } else {
              console.log(
                `${record.CLMBR_NM} 當天在 ${record.GYM_NM} 已達到攀爬上限5條，不再造成傷害`
              );
            }
          } else {
            console.log(
              `${record.CLMBR_NM} 的攀爬記錄日期 ${record.DATE} 早於城堡 ${record.GYM_NM} 的開放日期 ${castle.START_DATE}`
            );
          }
        }
      });

      return Object.values(castleMap);
    };

    // 更新城堡血量
    let updatedCastles = [];
    if (processedCastles.length > 0 && processedClimbingRecords.length > 0) {
      updatedCastles = processCastleAttacks(processedClimbingRecords, [
        ...processedCastles,
      ]);
      console.log('更新後的城堡狀態:', updatedCastles);
      //   alert('更新後的城堡狀態:' + JSON.stringify(updatedCastles));
      setCastlesData(updatedCastles);
    } else {
      console.log('沒有更新城堡狀態', processedCastles);
      console.log('沒有更新攀岩記錄', updatedCastles);
      updatedCastles = processedCastles;
      setCastlesData(processedCastles);
    }

    // 創建漸變色血條的輔助函數
    function createGradient(ctx, x, y, width, height, healthPercent) {
      // 確保所有參數都是有效的數字，防止NaN或Infinity
      x = Number.isFinite(x) ? x : 0;
      y = Number.isFinite(y) ? y : 0;
      width = Number.isFinite(width) && width > 0 ? width : 1;
      height = Number.isFinite(height) ? height : 0;

      // 確保健康百分比有效
      healthPercent = Number.isFinite(healthPercent)
        ? Math.max(0, Math.min(1, healthPercent))
        : 0.5;

      // 創建線性漸變
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

    // 基於固定的位置信息創建城堡位置映射
    const castlePositionMap = {
      'Tup Mingde': { x: 0.38, y: 0.32, cname: '原岩明德' },
      'Corner Zhongshan': { x: 0.44, y: 0.44, cname: '角中山' },
      'Tup Wanhua': { x: 0.2, y: 0.55, cname: '原岩萬華' },
      'Corner Huashan': { x: 0.595, y: 0.515, cname: '角華山' },
      'Tup Zhonghe': { x: 0.36, y: 0.675, cname: '原岩中和' },
      'Tup A19': { x: 0.15, y: 0.81, cname: '原岩A19' },
      'Tup Hsindian': { x: 0.61, y: 0.75, cname: '原岩新店' },
      'Tup Nangang': { x: 0.86, y: 0.58, cname: '原岩南港' },
    };

    // 創建城堡位置數組
    let castlePositions = [];

    // 如果有城堡數據，根據數據創建位置
    if (updatedCastles && updatedCastles.length > 0) {
      console.log('使用城堡數據生成位置', updatedCastles);

      castlePositions = updatedCastles
        .map((castle) => {
          // 獲取城堡ID和位置信息
          const castleId = castle.CASTLE;
          const positionInfo = castlePositionMap[castleId];

          if (!positionInfo) {
            console.warn(`找不到城堡 ${castleId} 的位置信息`);
            return null;
          }

          // 安全獲取血量，確保值是有效的數字
          let hp = 0;
          let originalHp = 10000; // 默認值

          try {
            hp = castle.HP ? parseInt(castle.HP) : 0;
            hp = Number.isFinite(hp) ? Math.max(0, hp) : 0;

            originalHp = castle.ORIGINAL_HP
              ? parseInt(castle.ORIGINAL_HP)
              : 10000;
            originalHp =
              Number.isFinite(originalHp) && originalHp > 0
                ? originalHp
                : 10000;
          } catch (e) {
            console.error('解析城堡血量時出錯:', e);
          }

          // 返回完整的城堡位置信息
          return {
            x: positionInfo.x,
            y: positionInfo.y,
            health: {
              current: hp,
              total: originalHp,
            },
            cname: positionInfo.cname,
            castleId: castleId,
          };
        })
        .filter((castle) => castle !== null); // 過濾掉null值
    } else {
      // 如果沒有數據，使用默認值
      console.log('使用默認城堡位置');
      castlePositions = Object.entries(castlePositionMap).map(
        ([castleId, info]) => ({
          x: info.x,
          y: info.y,
          health: { current: 10000, total: 10000 },
          cname: info.cname,
          castleId: castleId,
        })
      );
    }

    // 更新城堡位置參考
    castlePositionsRef.current = castlePositions;
    console.log('最終的城堡位置:', castlePositions);

    castlePositions.forEach((pos) => {
      // 使用自定義血條
      layers.push({
        type: 'customHealthBar',
        x: pos.x - 0.06,
        y: pos.y + 0.08,
        w: 0.12,
        h: 0.025,
        health: pos.health,
        render: (ctx, x, y, w, h, health) => {
          // 計算健康百分比，確保數值有效
          let current = Number.isFinite(health.current)
            ? Math.max(0, health.current)
            : 0;
          let total =
            Number.isFinite(health.total) && health.total > 0
              ? health.total
              : 1;

          // 確保百分比在 0-1 範圍內
          const healthPercent = Math.max(0, Math.min(1, current / total));

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
            const percentValue = Math.max(
              0,
              Math.min(100, healthPercent * 100)
            );
            const percentText = `${Math.ceil(percentValue * 10) / 10}%`;

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

    // 根據健康值獲取顏色 - 統一使用紅色系
    function getHealthColor(healthPercent) {
      if (healthPercent > 0.7) return 'rgba(220, 20, 20, 1)'; // 亮紅色
      if (healthPercent > 0.4) return 'rgba(180, 0, 0, 1)'; // 深紅色
      return 'rgba(139, 0, 0, 1)'; // 深暗紅色
    }

    // 繪製所有圖層
    const drawImages = async () => {
      // 清除畫布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        for (const layer of layers) {
          console.log('drawImages', layer);
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
            // 使用圓形代替城堡圖示，移除懸停效果相關代碼
            // 繪製原始圓形
            ctx.beginPath();
            ctx.arc(
              layer.x * canvas.width,
              layer.y * canvas.height,
              layer.radius * canvas.width,
              0,
              Math.PI * 2
            );

            // 使用標準顏色
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
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/70"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-gray-900 border-2 border-red-800 rounded-lg p-6 max-w-md w-11/12 text-center relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-red-500">
              {selectedCastle.cname}
            </h2>

            {/* 添加城堡圖片 */}
            <div className="mb-4 flex justify-center">
              <img
                src="/castle.png"
                alt={`${selectedCastle.cname} 圖片`}
                className="h-32 object-contain rounded-lg border border-red-800/50"
              />
            </div>
            <div className="mb-4">
              <div className="w-full bg-gray-800 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-red-700 to-red-500 h-4 rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, (selectedCastle.health.current / selectedCastle.health.total) * 100))}%`,
                  }}
                ></div>
              </div>
              <p className="text-white">
                血量: {selectedCastle.health.current} /{' '}
                {selectedCastle.health.total}(
                {(() => {
                  // 安全計算百分比
                  const current = Number.isFinite(selectedCastle.health.current)
                    ? selectedCastle.health.current
                    : 0;
                  const total =
                    Number.isFinite(selectedCastle.health.total) &&
                    selectedCastle.health.total > 0
                      ? selectedCastle.health.total
                      : 1;
                  return Math.ceil((current / total) * 1000) / 10;
                })()}
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

            {/* 添加攻擊者貢獻榜 */}
            {selectedCastle &&
              castlesData &&
              castlesData.find((c) => c.CASTLE === selectedCastle.castleId)
                ?.attackers && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">
                    攻擊者貢獻榜
                  </h3>
                  <div className="bg-gray-800 p-3 rounded">
                    {Object.entries(
                      castlesData.find(
                        (c) => c.CASTLE === selectedCastle.castleId
                      ).attackers
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([name, damage], index) => (
                        <div
                          key={name}
                          className={`py-2 ${index !== 9 ? 'border-b border-gray-700' : ''} flex justify-between items-center`}
                        >
                          <div className="flex items-center">
                            {index < 3 && (
                              <span
                                className={`
                              w-5 h-5 rounded-full mr-2 text-xs flex items-center justify-center
                              ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-700'}
                            `}
                              >
                                {index + 1}
                              </span>
                            )}
                            <span
                              className={
                                index < 3
                                  ? 'font-medium text-white'
                                  : 'text-gray-300'
                              }
                            >
                              {name}
                            </span>
                          </div>
                          <span className="font-bold text-red-400">
                            {damage} 點
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="mt-2 text-xs text-gray-400 text-left">
                    <p>• 每條路線造成 20 點傷害，每人每天最多計 5 條</p>
                    <p>• 在主場館攀爬每日額外造成 100 點傷害</p>
                  </div>
                </div>
              )}

            <button
              className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full mt-4"
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
