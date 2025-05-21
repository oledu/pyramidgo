export function calculatePompomTeam(data) {
  // 建立 team 總分的 map
  const teamMap = data.reduce((map, climber) => {
    const team = climber.TEAM_NM || 'N/A'; // 確保有隊名
    // 排除以"單人"開頭的隊伍
    if (team.startsWith('單人')) return map;

    if (!map[team]) {
      map[team] = {
        TEAM_NM: team,
        TOTAL_POMPOM: 0,
      };
    }
    // 累加 POMPOM_TOTAL，但確保不超過上限 9
    map[team].TOTAL_POMPOM = Math.min(
      map[team].TOTAL_POMPOM + climber.POMPOM_TOTAL,
      9
    );
    return map;
  }, {});

  // 轉換成陣列，並移除 TOTAL_POMPOM 為 0 的隊伍
  return Object.values(teamMap).filter((team) => team.TOTAL_POMPOM > 0);
}
