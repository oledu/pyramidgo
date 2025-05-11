export function calculateScoresNoLimitsGymDate(data) {
  // 確保 data 至少是一個物件，避免 null/undefined 錯誤
  const {
    participants = [],
    scoringSp = [],
    scoringBld = [],
    climbRecords = [],
  } = data || {};

  // 建立參與者的映射表
  const participantMap = participants.reduce((map, p) => {
    map[p.CLMBR_NM] = {
      ...p, // 保留原始 participant 資料
      REG_SP_LEVEL: (p.REG_SP_LEVEL || '').trim(),
      REG_BLD_LEVEL: (p.REG_BLD_LEVEL || '').trim(),
      climbRecords: [], // 存放該參與者的攀爬紀錄
      climbRecordCount: {}, // 用來統計 SENT_LEVEL、SP_LEADING、SP_RP、分數
      TOTAL_SCORE_SP: 0, // Sport Climbing 總分
      TOTAL_SCORE_BLD: 0, // Bouldering 總分
      // 簡化後的分數統計
      GYM_SCORES: {}, // 各健身房的得分統計
      DATE_SCORES: {}, // 各日期的得分統計
      GYM_DATE_SCORES: {}, // 各健身房下的日期得分統計(簡化，只統計總分)
    };
    return map;
  }, {});

  // 紀錄健身房和日期的分數統計的臨時存儲
  const tempScores = {};

  // 處理攀爬紀錄，將紀錄加到對應的參與者
  climbRecords.forEach((record) => {
    const {
      CLMBR_NM,
      SENT_LEVEL,
      SENT_COUNT,
      SP_LEADING,
      SP_RP,
      GYM_NM,
      DATE,
    } = record;
    if (!CLMBR_NM || !SENT_LEVEL || !SENT_COUNT) return;

    // 確保有健身房名稱和日期，如果沒有則設為預設值
    const gymName = GYM_NM || '未知';
    const climbDate = DATE || '未知日期';

    if (!participantMap[CLMBR_NM]) {
      // 若該攀爬者不在 participants 清單，則創建一個預設對象
      participantMap[CLMBR_NM] = {
        CLMBR_NM,
        REG_SP_LEVEL: 'N/A',
        REG_BLD_LEVEL: 'N/A',
        TEAM_NM: 'N/A',
        BEAST_MODE: 'N/A',
        climbRecords: [], // 存放該參與者的攀爬紀錄
        climbRecordCount: {}, // 用來統計 SENT_LEVEL、SP_LEADING、SP_RP、分數
        TOTAL_SCORE_SP: 0,
        TOTAL_SCORE_BLD: 0,
        // 簡化後的分數統計
        GYM_SCORES: {}, // 各健身房的得分統計
        DATE_SCORES: {}, // 各日期的得分統計
        GYM_DATE_SCORES: {}, // 各健身房下的日期得分統計(簡化，只統計總分)
      };
    }

    const climber = participantMap[CLMBR_NM];

    // 加入攀爬紀錄
    climber.climbRecords.push(record);

    const sentCount = parseInt(SENT_COUNT, 10);
    if (isNaN(sentCount)) return;

    // 初始化 climbRecordCount 結構 (總體統計)
    initCountStructure(climber.climbRecordCount, SENT_LEVEL);

    // 初始化臨時分數存儲
    if (!tempScores[CLMBR_NM]) {
      tempScores[CLMBR_NM] = {
        gyms: {},
        dates: {},
        gymDates: {},
      };
    }

    // 初始化健身房臨時分數
    if (!tempScores[CLMBR_NM].gyms[gymName]) {
      tempScores[CLMBR_NM].gyms[gymName] = {
        levels: {},
        SP: 0,
        BLD: 0,
        TOTAL: 0,
      };
    }

    // 初始化日期臨時分數
    if (!tempScores[CLMBR_NM].dates[climbDate]) {
      tempScores[CLMBR_NM].dates[climbDate] = {
        levels: {},
        SP: 0,
        BLD: 0,
        TOTAL: 0,
      };
    }

    // 初始化健身房+日期臨時分數
    if (!tempScores[CLMBR_NM].gymDates[gymName]) {
      tempScores[CLMBR_NM].gymDates[gymName] = {};
    }
    if (!tempScores[CLMBR_NM].gymDates[gymName][climbDate]) {
      tempScores[CLMBR_NM].gymDates[gymName][climbDate] = {
        levels: {},
        SP: 0,
        BLD: 0,
        TOTAL: 0,
      };
    }

    // 更新總體統計數據
    updateCounts(
      climber.climbRecordCount[SENT_LEVEL],
      sentCount,
      SP_LEADING,
      SP_RP
    );

    // 嘗試匹配分數
    let scoreEntry = null;
    let category = 'N/A';

    // 先用 Sport Climbing (scoringSp) 查找
    if (climber.REG_SP_LEVEL) {
      scoreEntry = scoringSp.find(
        (s) =>
          s.REG_SP_LEVEL === climber.REG_SP_LEVEL && s.SENT_LEVEL === SENT_LEVEL
      );
      if (scoreEntry) category = 'SP'; // Sport Climbing 類別
    }

    // 如果 Sport Climbing 沒找到，再用 Bouldering (scoringBld) 查找
    if (!scoreEntry && climber.REG_BLD_LEVEL) {
      scoreEntry = scoringBld.find(
        (s) =>
          s.REG_BLD_LEVEL === climber.REG_BLD_LEVEL &&
          s.SENT_LEVEL === SENT_LEVEL
      );
      if (scoreEntry) category = 'BLD'; // Bouldering 類別
    }

    // 計算分數
    if (scoreEntry) {
      const baseScore = parseInt(scoreEntry.SCORE, 10);

      if (!isNaN(baseScore)) {
        // 更新總體記錄
        updateScoreData(
          climber.climbRecordCount[SENT_LEVEL],
          baseScore,
          category
        );

        // 計算當前記錄的得分
        const totalAttempts = sentCount;
        const leadingCount = SP_LEADING ? parseInt(SP_LEADING, 10) || 0 : 0;
        const rpCount = SP_RP ? parseInt(SP_RP, 10) || 0 : 0;

        // 基礎分數
        let scoreTotal = totalAttempts * baseScore;

        // 加入先鋒和確保點的額外加分
        const leadingBonus = leadingCount * (baseScore * 0.3);
        const rpBonus = rpCount * (baseScore * 0.2);

        scoreTotal += leadingBonus + rpBonus;

        // 更新臨時分數統計
        if (!tempScores[CLMBR_NM].gyms[gymName].levels[SENT_LEVEL]) {
          tempScores[CLMBR_NM].gyms[gymName].levels[SENT_LEVEL] = {
            scoreTotal: 0,
            category: category,
          };
        }
        tempScores[CLMBR_NM].gyms[gymName].levels[SENT_LEVEL].scoreTotal +=
          scoreTotal;

        if (!tempScores[CLMBR_NM].dates[climbDate].levels[SENT_LEVEL]) {
          tempScores[CLMBR_NM].dates[climbDate].levels[SENT_LEVEL] = {
            scoreTotal: 0,
            category: category,
          };
        }
        tempScores[CLMBR_NM].dates[climbDate].levels[SENT_LEVEL].scoreTotal +=
          scoreTotal;

        if (
          !tempScores[CLMBR_NM].gymDates[gymName][climbDate].levels[SENT_LEVEL]
        ) {
          tempScores[CLMBR_NM].gymDates[gymName][climbDate].levels[SENT_LEVEL] =
            {
              scoreTotal: 0,
              category: category,
            };
        }
        tempScores[CLMBR_NM].gymDates[gymName][climbDate].levels[
          SENT_LEVEL
        ].scoreTotal += scoreTotal;
      }
    }
  });

  // 初始化計數結構的輔助函數
  function initCountStructure(container, level) {
    if (!container[level]) {
      container[level] = {
        total: 0,
        leading: 0,
        rp: 0,
        isScored: 'N',
        score: 0,
        scoreTotal: 0,
        category: 'N/A',
      };
    }
  }

  // 更新計數的輔助函數
  function updateCounts(record, sentCount, spLeading, spRp) {
    record.total += sentCount;
    if (spLeading) {
      record.leading += parseInt(spLeading, 10) || 0;
    }
    if (spRp) {
      record.rp += parseInt(spRp, 10) || 0;
    }
  }

  // 輔助函數：更新指定數據記錄的分數相關字段
  function updateScoreData(record, baseScore, category) {
    record.isScored = 'Y';
    record.score = baseScore;
    record.category = category;

    const totalAttempts = record.total;
    const leadingCount = record.leading;
    const rpCount = record.rp;

    // 基礎分數計算 - 無限制數量
    let totalScore = totalAttempts * baseScore;

    // 加入先鋒和確保點的額外加分
    const leadingBonus = leadingCount * (baseScore * 0.3); // 先鋒加分：原分數的30%
    const rpBonus = rpCount * (baseScore * 0.2); // 確保點加分：原分數的20%

    record.scoreTotal = totalScore + leadingBonus + rpBonus;
  }

  // 計算各分組的總分並生成簡化的輸出結構
  Object.keys(tempScores).forEach((clmbrNm) => {
    const climber = participantMap[clmbrNm];
    const tempScore = tempScores[clmbrNm];

    // 計算總體分數
    climber.TOTAL_SCORE_SP = calculateTotalForCategory(
      climber.climbRecordCount,
      'SP'
    );
    climber.TOTAL_SCORE_BLD = calculateTotalForCategory(
      climber.climbRecordCount,
      'BLD'
    );

    // 計算各健身房的得分
    Object.keys(tempScore.gyms).forEach((gymName) => {
      const gym = tempScore.gyms[gymName];

      // 計算SP和BLD分數
      Object.keys(gym.levels).forEach((level) => {
        const levelData = gym.levels[level];
        if (levelData.category === 'SP') {
          gym.SP += levelData.scoreTotal;
        } else if (levelData.category === 'BLD') {
          gym.BLD += levelData.scoreTotal;
        }
      });

      gym.TOTAL = gym.SP + gym.BLD;

      // 更新最終輸出
      climber.GYM_SCORES[gymName] = {
        SP: gym.SP,
        BLD: gym.BLD,
        TOTAL: gym.TOTAL,
      };
    });

    // 計算各日期的得分
    Object.keys(tempScore.dates).forEach((date) => {
      const dateData = tempScore.dates[date];

      // 計算SP和BLD分數
      Object.keys(dateData.levels).forEach((level) => {
        const levelData = dateData.levels[level];
        if (levelData.category === 'SP') {
          dateData.SP += levelData.scoreTotal;
        } else if (levelData.category === 'BLD') {
          dateData.BLD += levelData.scoreTotal;
        }
      });

      dateData.TOTAL = dateData.SP + dateData.BLD;

      // 更新最終輸出 - 簡化版，只返回總分
      climber.DATE_SCORES[date] = dateData.TOTAL;
    });

    // 計算各健身房+日期組合的得分
    climber.GYM_DATE_SCORES = {};

    Object.keys(tempScore.gymDates).forEach((gymName) => {
      climber.GYM_DATE_SCORES[gymName] = {};

      Object.keys(tempScore.gymDates[gymName]).forEach((date) => {
        const gymDateData = tempScore.gymDates[gymName][date];

        // 計算SP和BLD分數
        Object.keys(gymDateData.levels).forEach((level) => {
          const levelData = gymDateData.levels[level];
          if (levelData.category === 'SP') {
            gymDateData.SP += levelData.scoreTotal;
          } else if (levelData.category === 'BLD') {
            gymDateData.BLD += levelData.scoreTotal;
          }
        });

        gymDateData.TOTAL = gymDateData.SP + gymDateData.BLD;

        // 更新最終輸出 - 簡化版，只返回總分
        climber.GYM_DATE_SCORES[gymName][date] = gymDateData.TOTAL;
      });
    });
  });

  // 輔助函數：計算指定類別的總分
  function calculateTotalForCategory(recordObject, category) {
    return Object.values(recordObject)
      .filter((record) => record.category === category)
      .reduce((sum, record) => sum + record.scoreTotal, 0);
  }

  // 轉換為結果陣列
  return Object.values(participantMap);
}
