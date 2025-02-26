export function calculateScores(data) {
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
    };
    return map;
  }, {});

  // 處理攀爬紀錄，將紀錄加到對應的參與者
  climbRecords.forEach((record) => {
    const { CLMBR_NM, SENT_LEVEL, SENT_COUNT, SP_LEADING, SP_RP } = record;
    if (!CLMBR_NM || !SENT_LEVEL || !SENT_COUNT) return;

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
      };
    }

    const climber = participantMap[CLMBR_NM];

    // 加入攀爬紀錄
    climber.climbRecords.push(record);

    const sentCount = parseInt(SENT_COUNT, 10);
    if (isNaN(sentCount)) return;

    // 初始化 climbRecordCount 結構
    if (!climber.climbRecordCount[SENT_LEVEL]) {
      climber.climbRecordCount[SENT_LEVEL] = {
        total: 0,
        leading: 0,
        rp: 0,
        isScored: 'N',
        score: 0,
        limit: 0,
        scoreTotal: 0,
        category: 'N/A', // 記錄是 Sport Climbing 還是 Bouldering
      };
    }

    // 更新統計數據
    climber.climbRecordCount[SENT_LEVEL].total += sentCount;
    if (SP_LEADING === 'Y') {
      climber.climbRecordCount[SENT_LEVEL].leading += sentCount;
    }
    if (SP_RP === 'Y') {
      climber.climbRecordCount[SENT_LEVEL].rp += sentCount;
    }

    // **嘗試匹配分數**
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

    // **填入 isScored, score, limit, scoreTotal, category**
    if (scoreEntry) {
      const baseScore = parseInt(scoreEntry.SCORE, 10);
      const limit = parseInt(scoreEntry.LIMIT, 10);

      if (!isNaN(baseScore) && !isNaN(limit)) {
        climber.climbRecordCount[SENT_LEVEL].isScored = 'Y';
        climber.climbRecordCount[SENT_LEVEL].score = baseScore;
        climber.climbRecordCount[SENT_LEVEL].limit = limit;
        climber.climbRecordCount[SENT_LEVEL].category = category;

        const totalAttempts = climber.climbRecordCount[SENT_LEVEL].total;
        if (totalAttempts <= limit) {
          climber.climbRecordCount[SENT_LEVEL].scoreTotal =
            totalAttempts * baseScore;
        } else {
          climber.climbRecordCount[SENT_LEVEL].scoreTotal =
            limit * baseScore + (totalAttempts - limit) * baseScore * 0.3;
        }
      }
    } else {
      climber.climbRecordCount[SENT_LEVEL].isScored = 'N';
      climber.climbRecordCount[SENT_LEVEL].score = 0;
      climber.climbRecordCount[SENT_LEVEL].limit = 0;
      climber.climbRecordCount[SENT_LEVEL].scoreTotal = 0;
      climber.climbRecordCount[SENT_LEVEL].category = 'N/A';
    }
  });

  // **計算 TOTAL_SCORE_SP 和 TOTAL_SCORE_BLD**
  Object.values(participantMap).forEach((climber) => {
    climber.TOTAL_SCORE_SP = Object.values(climber.climbRecordCount)
      .filter((record) => record.category === 'SP')
      .reduce((sum, record) => sum + record.scoreTotal, 0);

    climber.TOTAL_SCORE_BLD = Object.values(climber.climbRecordCount)
      .filter((record) => record.category === 'BLD')
      .reduce((sum, record) => sum + record.scoreTotal, 0);
  });

  // 轉換為結果陣列
  return Object.values(participantMap);
}
