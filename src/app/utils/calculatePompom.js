const pompomCheckBld = [
  {
    REG_BLD_LEVEL: 'V1',
    FIRST_CHECK: 15,
    SECOND_CHECK: 30,
    THIRD_CHECK: 45,
  },
  {
    REG_BLD_LEVEL: 'V2',
    FIRST_CHECK: 30,
    SECOND_CHECK: 50,
    THIRD_CHECK: 70,
  },
  {
    REG_BLD_LEVEL: 'V3',
    FIRST_CHECK: 50,
    SECOND_CHECK: 80,
    THIRD_CHECK: 110,
  },
  {
    REG_BLD_LEVEL: 'V4',
    FIRST_CHECK: 60,
    SECOND_CHECK: 95,
    THIRD_CHECK: 130,
  },
  {
    REG_BLD_LEVEL: 'V5',
    FIRST_CHECK: 80,
    SECOND_CHECK: 110,
    THIRD_CHECK: 140,
  },
  {
    REG_BLD_LEVEL: 'V6',
    FIRST_CHECK: 90,
    SECOND_CHECK: 120,
    THIRD_CHECK: 150,
  },
];

const pompomCheckSp = [
  {
    REG_SP_LEVEL: '5.9',
    FIRST_CHECK: 15,
    SECOND_CHECK: 20,
    THIRD_CHECK: 25,
  },
  {
    REG_SP_LEVEL: '5.10ab',
    FIRST_CHECK: 30,
    SECOND_CHECK: 40,
    THIRD_CHECK: 45,
  },
  {
    REG_SP_LEVEL: '5.10cd',
    FIRST_CHECK: 50,
    SECOND_CHECK: 70,
    THIRD_CHECK: 75,
  },
  {
    REG_SP_LEVEL: '5.11ab',
    FIRST_CHECK: 60,
    SECOND_CHECK: 70,
    THIRD_CHECK: 80,
  },
  {
    REG_SP_LEVEL: '5.11cd',
    FIRST_CHECK: 80,
    SECOND_CHECK: 95,
    THIRD_CHECK: 110,
  },
  {
    REG_SP_LEVEL: '5.12ab',
    FIRST_CHECK: 80,
    SECOND_CHECK: 110,
    THIRD_CHECK: 130,
  },
];

export function calculatePompom(data) {
  // 計算 pompom
  return data.map((climber) => {
    // 預設 pompom 為 0
    let pompomSp = 0;
    let pompomBld = 0;

    // 根據 Sport Climbing 標準檢查
    const spCheck = pompomCheckSp.find(
      (check) => check.REG_SP_LEVEL === climber.REG_SP_LEVEL
    );
    if (spCheck) {
      if (climber.TOTAL_SCORE_SP >= spCheck.THIRD_CHECK) {
        pompomSp = 3;
      } else if (climber.TOTAL_SCORE_SP >= spCheck.SECOND_CHECK) {
        pompomSp = 2;
      } else if (climber.TOTAL_SCORE_SP >= spCheck.FIRST_CHECK) {
        pompomSp = 1;
      }
    }

    // 根據 Bouldering 標準檢查
    const bldCheck = pompomCheckBld.find(
      (check) => check.REG_BLD_LEVEL === climber.REG_BLD_LEVEL
    );
    if (bldCheck) {
      if (climber.TOTAL_SCORE_BLD >= bldCheck.THIRD_CHECK) {
        pompomBld = 3;
      } else if (climber.TOTAL_SCORE_BLD >= bldCheck.SECOND_CHECK) {
        pompomBld = 2;
      } else if (climber.TOTAL_SCORE_BLD >= bldCheck.FIRST_CHECK) {
        pompomBld = 1;
      }
    }

    // 總計 POMPOM，但最大值為 3
    const pompomTotal = Math.min(pompomSp + pompomBld, 3);

    // 回傳結果
    return {
      CLMBR_NM: climber.CLMBR_NM,
      TOTAL_SCORE_SP: climber.TOTAL_SCORE_SP,
      TOTAL_SCORE_BLD: climber.TOTAL_SCORE_BLD,
      REG_SP_LEVEL: climber.REG_SP_LEVEL,
      REG_BLD_LEVEL: climber.REG_BLD_LEVEL,
      TEAM_NM: climber.TEAM_NM,
      POMPOM_SP: pompomSp,
      POMPOM_BLD: pompomBld,
      POMPOM_TOTAL: pompomTotal,
    };
  });
}
