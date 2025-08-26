'use client';
import { useEffect, useRef, useState } from 'react';

const devMode = true; // 或用 URL 判斷 new URLSearchParams(window.location.search).get('dev') === '1'

/**
 * Castle3 組件 - 使用 Canvas 實現多層 PNG 圖片重疊效果，使用 castle_bg5.png
 * @param {Object} data - 數據物件
 * @param {string} period - 當前時期
 */
const Castle3 = ({ data, period, scoresNoLimitsGymDate }) => {
  if (period < '202504T') {
    return null;
  }

  console.log('Castle3data', data);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCastle, setSelectedCastle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const castlePositionsRef = useRef([]);
  const [castlesData, setCastlesData] = useState([]);
  const processedDataRef = useRef({
    processedCastles: [],
    processedParticipants: [],
    processedClimbingRecords: [],
  });
  const [dataProcessed, setDataProcessed] = useState(false);

  // 根據容器設置 Canvas 尺寸 - 調整為新的比例
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        // 獲取容器寬度
        const width = containerRef.current.clientWidth;
        // 根據 castle_bg5.png 的比例調整 (約 9:16)
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
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      if (devMode) {
        // 開發模式下直接顯示座標
        console.log(`{ x: ${x.toFixed(3)}, y: ${y.toFixed(3)} }`);
      }

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
        console.log('clickedCastle', clickedCastle);

        // 發送 GA 事件
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'castle_click', {
            event_category: 'castle',
            event_label: clickedCastle.cname,
            value: Math.round(
              (clickedCastle.health.current / clickedCastle.health.total) * 100
            ),
            castle_id: clickedCastle.castleId,
            health_percentage: Math.round(
              (clickedCastle.health.current / clickedCastle.health.total) * 100
            ),
            current_health: clickedCastle.health.current,
            total_health: clickedCastle.health.total,
          });
        }

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

  // 處理城堡記錄數據，找出每個城堡最新的記錄
  const processLatestCastleRecords = (records) => {
    if (!records || !Array.isArray(records) || records.length === 0) return [];

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
          // 確保每次都保存原始血量字段，用於保存城堡初始血量
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

    // 只處理有效的攀岩記錄（需要有GYM_NM和DATE，且過濾休賽季記錄）
    const validRecords = climbingRecords.filter(
      (record) => record.GYM_NM && record.DATE && record.OFF_SEASON !== 'Y'
    );

    // 收集休賽季記錄
    const offseasonRecords = climbingRecords.filter(
      (record) => record.GYM_NM && record.DATE && record.OFF_SEASON === 'Y'
    );

    console.log('offseasonRecords', offseasonRecords);

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

  // 計算並更新城堡血量
  const processCastleAttacks = (
    climbingRecords,
    castles,
    scoresNoLimitsGymDate,
    offseasonRecords,
    originalClimbingRecords
  ) => {
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
    console.log('使用scoresNoLimitsGymDate計算', scoresNoLimitsGymDate);

    // 創建城堡映射表，以城堡名稱為索引
    const castleMap = castles.reduce((map, castle) => {
      map[castle.CASTLE] = castle;
      // 確保每個城堡有原始HP值 - 如果不存在才賦值，防止覆蓋
      if (!castle.ORIGINAL_HP) {
        castle.ORIGINAL_HP = castle.HP;
      }
      // 初始化每個城堡的攻擊者貢獻統計
      map[castle.CASTLE].attackers = {};
      // 初始化休賽季攀登者貢獻統計
      map[castle.CASTLE].offseasonAttackers = {};
      // 初始化攻擊次數
      map[castle.CASTLE].attackCount = 0;
      return map;
    }, {});

    // 如果沒有scoresNoLimitsGymDate數據，則直接返回原始城堡
    if (
      !scoresNoLimitsGymDate ||
      !Array.isArray(scoresNoLimitsGymDate) ||
      scoresNoLimitsGymDate.length === 0
    ) {
      console.log('沒有scoresNoLimitsGymDate數據，返回原始城堡數據');
      return Object.values(castleMap);
    }

    // 為了記錄每位攀岩者的主場館，創建一個映射
    const climberHomeGymMap = {};

    // 只处理climbingRecords中的主场馆信息，不再修改mainAttackers
    climbingRecords.forEach((record) => {
      if (record.isHomeGym && record.CLMBR_NM && record.GYM_NM) {
        climberHomeGymMap[`${record.CLMBR_NM}-${record.GYM_NM}`] = true;
      }
    });

    // 遍歷所有攀岩者的得分記錄，計算對城堡的傷害
    scoresNoLimitsGymDate.forEach((climber) => {
      const climberName = climber.CLMBR_NM;
      if (!climberName) return;

      // 遍歷該攀岩者的所有健身房得分
      if (climber.GYM_DATE_SCORES) {
        Object.entries(climber.GYM_DATE_SCORES).forEach(
          ([gymName, dateScores]) => {
            // 確認這個健身房是否存在於城堡列表中
            if (castleMap[gymName]) {
              const castle = castleMap[gymName];

              // 遍歷該健身房下的所有日期得分
              Object.entries(dateScores).forEach(([date, score]) => {
                // 檢查這個日期的記錄是否為 off_season
                const isOffseasonRecord = originalClimbingRecords && originalClimbingRecords.some(record =>
                  record.CLMBR_NM === climberName &&
                  record.GYM_NM === gymName &&
                  record.DATE === date &&
                  record.OFF_SEASON === 'Y'
                );

                // 跳過 off_season 記錄，這些會在後面單獨處理
                if (isOffseasonRecord) {
                  console.log(`跳過 off_season 記錄: ${climberName} 在 ${gymName} (${date})`);
                  return;
                }

                // 檢查攀爬記錄時間是否在城堡的START_DATE之後
                const recordYear = '2025/'; // 假設記錄的年份是2025
                const recordDate = new Date(recordYear + date);
                const castleStartDate = new Date(castle.START_DATE);

                // 只處理城堡開放日期後的攀爬記錄
                if (recordDate >= castleStartDate) {
                  // 計算傷害 - 直接使用得分作為傷害值
                  let damage = score;

                  // 不管如何先加100
                  damage += 100;

                  // 更新城堡血量
                  const currentHP = parseInt(castle.HP);
                  castle.HP = Math.max(0, currentHP - damage).toString();

                  // 記錄攀岩者對該城堡的貢獻
                  if (!castle.attackers[climberName]) {
                    castle.attackers[climberName] = 0;
                  }
                  castle.attackers[climberName] += damage;

                  // 统计攻击次数 - 每个日期计为一次攻击
                  castle.attackCount++;

                  console.log(
                    `${climberName} 在 ${gymName} (${date}) 造成 ${damage} 點傷害，剩餘血量: ${castle.HP}`
                  );
                } else {
                  console.log(
                    `${climberName} 的攀爬記錄日期 ${date} 早於城堡 ${gymName} 的開放日期 ${castle.START_DATE}`
                  );
                }
              });
            }
          }
        );
      }
    });

    // 處理休賽季記錄的攻城邏輯
    if (offseasonRecords && Array.isArray(offseasonRecords) && offseasonRecords.length > 0) {
      console.log('處理休賽季記錄攻城', offseasonRecords);

      // 統計每個館每天的休賽季記錄數量和攀登者
      const gymDayCounts = {};
      const gymDayClimbers = {};

      offseasonRecords.forEach((record) => {
        const gymName = record.GYM_NM;
        const date = record.DATE;
        const climberName = record.CLMBR_NM;

        // 檢查這個健身房是否存在於城堡列表中，並驗證日期
        if (castleMap[gymName]) {
          const castle = castleMap[gymName];
          
          // 檢查休賽季記錄時間是否在城堡的START_DATE之後
          const recordYear = '2025/'; // 假設記錄的年份是2025
          const recordDate = new Date(recordYear + date);
          const castleStartDate = new Date(castle.START_DATE);

          // 只處理城堡開放日期後的休賽季記錄
          if (recordDate >= castleStartDate) {
            if (!gymDayCounts[gymName]) {
              gymDayCounts[gymName] = {};
              gymDayClimbers[gymName] = {};
            }

            if (!gymDayCounts[gymName][date]) {
              gymDayCounts[gymName][date] = 0;
              gymDayClimbers[gymName][date] = new Set();
            }

            gymDayCounts[gymName][date]++;
            if (climberName) {
              gymDayClimbers[gymName][date].add(climberName);
            }
          } else {
            console.log(
              `休賽季記錄：${climberName} 的記錄日期 ${date} 早於城堡 ${gymName} 的開放日期 ${castle.START_DATE}`
            );
          }
        }
      });

      // 對每個有休賽季記錄的攀登者每館每天貢獻20點攻城能量
      Object.entries(gymDayCounts).forEach(([gymName, dateCounts]) => {
        const castle = castleMap[gymName];
        if (castle) {
          Object.entries(dateCounts).forEach(([date, count]) => {
            const climbers = Array.from(gymDayClimbers[gymName][date] || []);
            const damagePerClimber = 20; // 每人每館每天貢獻20點攻城能量
            const totalDamage = climbers.length * damagePerClimber;

            // 更新城堡血量
            const currentHP = parseInt(castle.HP);
            castle.HP = Math.max(0, currentHP - totalDamage).toString();

            // 記錄休賽季攀登者的貢獻（每人貢獻20點）
            climbers.forEach((climberName) => {
              if (!castle.offseasonAttackers[climberName]) {
                castle.offseasonAttackers[climberName] = 0;
              }
              castle.offseasonAttackers[climberName] += damagePerClimber;
            });

            console.log(
              `休賽季記錄：${gymName} 在 ${date} 有 ${count} 筆記錄（${climbers.length} 位攀登者），每人貢獻 ${damagePerClimber} 點，總計 ${totalDamage} 點攻城能量，剩餘血量: ${castle.HP}`
            );
          });
        }
      });
    }

    return Object.values(castleMap);
  };

  // 新增：單獨處理數據的useEffect，只在data或period變化時執行
  useEffect(() => {
    if (!data) return;

    console.log('處理城堡數據...');

    // 如果有數據，處理城堡記錄
    let processedCastles = [];
    if (data.castle_records) {
      processedCastles = processLatestCastleRecords(data.castle_records);
      console.log('處理後的城堡記錄:', processedCastles);
    }

    // 如果有參與者數據，處理參與者記錄
    let processedParticipants = [];
    if (data.castle_participants) {
      processedParticipants = processLatestCastleParticipants(
        data.castle_participants
      );
      console.log('處理後的參與者記錄:', processedParticipants);

      // 预处理每个城堡的主攻玩家
      const castleMainAttackers = {};
      processedParticipants.forEach((participant) => {
        if (participant.HOME_GYM) {
          if (!castleMainAttackers[participant.HOME_GYM]) {
            castleMainAttackers[participant.HOME_GYM] = [];
          }
          if (
            !castleMainAttackers[participant.HOME_GYM].includes(
              participant.CLMBR_NM
            )
          ) {
            castleMainAttackers[participant.HOME_GYM].push(
              participant.CLMBR_NM
            );
          }
        }
      });

      // 将预处理的主攻玩家添加到各个城堡
      if (processedCastles.length > 0) {
        processedCastles.forEach((castle) => {
          castle.mainAttackers = castleMainAttackers[castle.CASTLE] || [];
        });
      }
    }

    // 处理攀岩记录
    let processedClimbingRecords = [];
    if (data.climbRecords) {
      processedClimbingRecords = processClimbingRecordsWithParticipants(
        data.climbRecords,
        processedParticipants
      );
      console.log('處理後的攀岩記錄:', processedClimbingRecords);
    }

    // 獲取休賽季記錄
    let offseasonRecords = [];
    if (data.climbRecords) {
      offseasonRecords = data.climbRecords.filter(
        (record) => record.GYM_NM && record.DATE && record.OFF_SEASON === 'Y'
      );
      console.log('休賽季記錄:', offseasonRecords);
    }

    // 更新城堡血量 - 只在有新数据时执行
    let updatedCastles = [];
    if (processedCastles.length > 0 && processedClimbingRecords.length > 0) {
      // 深度复制城堡数据，避免直接修改原始数据
      updatedCastles = processCastleAttacks(
        processedClimbingRecords,
        JSON.parse(JSON.stringify(processedCastles)),
        scoresNoLimitsGymDate,
        offseasonRecords,
        data.climbRecords
      );
      console.log('更新後的城堡狀態:', updatedCastles);
      setCastlesData(updatedCastles);
    } else {
      console.log('沒有更新城堡狀態', processedCastles);
      console.log('沒有更新攀岩記錄', processedClimbingRecords);

      // 即使沒有正常攀爬記錄，也要處理休賽季記錄
      if (processedCastles.length > 0 && offseasonRecords.length > 0) {
        updatedCastles = processCastleAttacks(
          [], // 空的攀爬記錄
          JSON.parse(JSON.stringify(processedCastles)),
          scoresNoLimitsGymDate,
          offseasonRecords,
          data.climbRecords
        );
        console.log('僅處理休賽季記錄後的城堡狀態:', updatedCastles);
        setCastlesData(updatedCastles);
      } else {
        updatedCastles = processedCastles;
        setCastlesData(processedCastles);
      }
    }

    // 保存处理过的数据到ref中
    processedDataRef.current = {
      processedCastles: updatedCastles,
      processedParticipants,
      processedClimbingRecords,
    };

    // 标记数据已处理 - 确保只有数据或期间改变时才重新处理
    setDataProcessed(true);
  }, [data, period, scoresNoLimitsGymDate]); // 添加 scoresNoLimitsGymDate 作為依賴

  // 繪製重疊圖片，只依賴於 dimensions 和數據處理狀態
  useEffect(() => {
    if (dimensions.width === 0 || !canvasRef.current || !dataProcessed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 設置 canvas 尺寸
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    setIsLoading(true);

    // 使用ref中存儲的處理好的數據，而不是重新處理
    const { processedCastles } = processedDataRef.current;

    // 直接使用處理好的城堡數據，不需要額外修改
    const updatedCastles = processedCastles;

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

    // 基於新的 castle_bg5.png 調整城堡位置映射
    const castlePositionMap = {
      'Tup Mingde': { x: 0.371, y: 0.281, cname: '原岩明德' },
      Flow: { x: 0.794, y: 0.301, cname: '心流' },
      'Corner Zhongshan': { x: 0.429, y: 0.374, cname: '角中山' },
      'Corner Huashan': { x: 0.592, y: 0.429, cname: '角華山' },
      'Tup Wanhua': { x: 0.192, y: 0.457, cname: '原岩萬華' },
      'Tup Nangang': { x: 0.853, y: 0.478, cname: '原岩南港' },
      'Tup Zhonghe': { x: 0.352, y: 0.550, cname: '原岩中和' },
      'Tup Hsindian': { x: 0.605, y: 0.607, cname: '原岩新店' },
      'Tup A19': { x: 0.141, y: 0.648, cname: '原岩A19' },
      Passion: { x: 0.301, y: 0.723, cname: '爬森' },
      'Iclimb Shengli': { x: 0.541, y: 0.776, cname: '風城勝利' },
      'Iclimb Chenggong': { x: 0.416, y: 0.868, cname: '風城成功' },
    };

    // 這裡定義要繪製的圖層
    // 每個圖層包含：圖片路徑、透明度、相對坐標和尺寸
    const layers = [
      {
        src: '/castle_bg5.png', // 使用新的背景圖
        opacity: 1,
        x: 0,
        y: 0,
        w: 1,
        h: 1,
      },
    ];

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

            // 使用存儲在城堡數據中的ORIGINAL_HP，避免重新計算
            originalHp = castle.ORIGINAL_HP
              ? parseInt(castle.ORIGINAL_HP)
              : 10000;
            originalHp =
              Number.isFinite(originalHp) && originalHp > 0
                ? originalHp
                : 10000;

            console.log(`城堡 ${castleId} 血量: ${hp}/${originalHp}`);
          } catch (e) {
            console.error('解析城堡血量時出錯:', e);
          }

          // 返回完整的城堡位置信息
          return {
            x: positionInfo.x,
            y: positionInfo.y,
            health: {
              current: hp,
              total: originalHp, // 使用原始存儲的HP值
            },
            cname: positionInfo.cname,
            castleId: castleId,
          };
        })
        .filter((castle) => castle !== null); // 過濾掉null值
    }

    // 更新城堡位置參考
    castlePositionsRef.current = castlePositions;
    console.log('最終的城堡位置:', castlePositions);
    console.log('城堡位置:', castlePositions);
    castlePositions.forEach((pos) => {
      // 使用自定義血條
      layers.push({
        type: 'customHealthBar',
        x: pos.x - 0.055,
        y: pos.y + 0.015,
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
  }, [dimensions, dataProcessed]); // 只在尺寸變化或數據處理完成時重繪

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

            <h2 className="font-bold text-center">
              <div className="text-red-400 text-lg">岩城</div>
              <div className="text-red-500 text-2xl mt-1">
                {selectedCastle.cname}
              </div>
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
                {selectedCastle.health.total}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">押寶人數</p>
                <p className="text-white font-bold">
                  {(() => {
                    // 直接使用城堡的主攻玩家数量
                    const castle = castlesData.find(
                      (c) => c.CASTLE === selectedCastle.castleId
                    );
                    if (!castle) return 0;

                    return castle.mainAttackers?.length || 0;
                  })()}
                  人
                </p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">被攻擊次數</p>
                <p className="text-white font-bold">
                  {(() => {
                    // 直接使用城堡的攻击次数
                    const castle = castlesData.find(
                      (c) => c.CASTLE === selectedCastle.castleId
                    );
                    if (!castle) return 0;

                    return castle.attackCount || 0;
                  })()}
                  次
                </p>
              </div>
            </div>

            {/* 添加攻城英雄榜 */}
            {selectedCastle &&
              castlesData &&
              castlesData.find((c) => c.CASTLE === selectedCastle.castleId)
                ?.attackers && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">
                    攻城英雄榜
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
                            {parseFloat(damage.toFixed(1))} 🩸
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="mt-2 text-xs text-gray-400 text-left">
                    <p>
                      📈 收線越多＝對岩城傷害越大
                      <br />
                      💥 岩城血條歸零 ＝ 掉寶！
                    </p>
                    <br />
                    <p className="font-bold text-yellow-300 mb-1">
                      1. 攻城 ⚔️
                    </p>
                    <p>
                      🔥 每次進攻 造成岩城扣血-100
                      <br />
                      🧗‍♀️ 爬掉路線得到的積分，
                      <br />
                      🎱 除了可以獲得抽獎彩球，
                      <br />
                      💀 還可以造成岩城扣血
                    </p>
                    <br />
                    <p className="font-bold text-yellow-300 mb-1">
                      2. 取得月票掉寶資格 🎯
                    </p>
                    <p>📹 累積 5 條路線影片</p>
                    <p>🎫 月票 就可能掉到你手上</p>
                    <br />
                    <p className="font-bold text-yellow-300 mb-1">
                      3. 城破掉寶 💎
                    </p>
                    <p>
                      ⚡ 當岩城攻破掉寶時，依攻城貢獻機率掉寶：
                      <br />
                      🎫 月票---攻城越多次，機率越高
                      <br />
                      🏆 徽章碎片---根據攻城貢獻英雄榜掉寶
                    </p>
                  </div>
                </div>
              )}

            {/* 添加淡季英雄榜 */}
            {selectedCastle &&
              castlesData &&
              castlesData.find((c) => c.CASTLE === selectedCastle.castleId)
                ?.offseasonAttackers &&
              Object.keys(castlesData.find((c) => c.CASTLE === selectedCastle.castleId).offseasonAttackers).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-purple-400 mb-2">
                    休賽季紀錄榜 🌙
                  </h3>
                  <div className="bg-gray-900 p-3 rounded border border-purple-500">
                    {Object.entries(
                      castlesData.find(
                        (c) => c.CASTLE === selectedCastle.castleId
                      ).offseasonAttackers
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([name, damage], index) => (
                        <div
                          key={name}
                          className={`py-2 ${index !== 9 && index !== Object.entries(castlesData.find((c) => c.CASTLE === selectedCastle.castleId).offseasonAttackers).length - 1 ? 'border-b border-purple-700' : ''} flex justify-between items-center`}
                        >
                          <div className="flex items-center">
                            {index < 3 && (
                              <span
                                className={`
                              w-5 h-5 rounded-full mr-2 text-xs flex items-center justify-center
                              ${index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-purple-600' : 'bg-purple-700'}
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
                          <span className="font-bold text-purple-400">
                            {parseFloat(damage.toFixed(1))} 🌙
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="mt-2 text-xs text-gray-400 text-left">
                    <p className="text-purple-300">
                      <strong>🌙 休賽季持續紀錄</strong>
                      <br />
                      鼓勵選手在休賽季期間繼續攀爬並記錄
                      <br />
                      每館每天貢獻20點攻城能量
                    </p>
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

export default Castle3;