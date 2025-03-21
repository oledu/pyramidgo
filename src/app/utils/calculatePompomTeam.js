export function calculatePompomTeam(data) {
  // 建立 team 總分的 map
  const teamMap = data.reduce((map, climber) => {
    const team = climber.TEAM_NM || 'N/A'; // 確保有隊名
    if (!map[team]) {
      map[team] = {
        TEAM_NM: team,
        TOTAL_POMPOM: 0,
      };
    }
    // 累加 POMPOM_TOTAL
    map[team].TOTAL_POMPOM += climber.POMPOM_TOTAL;
    return map;
  }, {});

  // 轉換成陣列，並移除 TOTAL_POMPOM 為 0 的隊伍
  return Object.values(teamMap).filter((team) => team.TOTAL_POMPOM > 0);
}
