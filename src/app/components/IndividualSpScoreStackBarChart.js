'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const IndividualSpScoreStackBarChart = ({ data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const drawChart = () => {
    if (!data || !data.length) return;

    // 過濾並重組資料，先按隊伍分組再按分數排序
    const processedData = data
      .filter((d) => d.TOTAL_SCORE_SP > 0)
      .map((d) => {
        // 找出所有運動攀登的記錄
        const spRecords = Object.entries(d.climbRecordCount)
          .filter(([_, value]) => value.category === 'SP')
          .map(([level, value]) => ({
            grade: level,
            count: value.total,
            score: value.score,
            scoreTotal: value.scoreTotal,
          }))
          .sort((a, b) => a.score - b.score); // 改為升序排序，讓較難的等級在後面

        return {
          name: d.CLMBR_NM,
          team: d.TEAM_NM || 'Unknown',
          total: d.TOTAL_SCORE_SP,
          scores: spRecords,
        };
      })
      .sort((a, b) => {
        if (a.team === b.team) {
          return b.total - a.total;
        }
        return a.team.localeCompare(b.team);
      });

    // 設定圖表尺寸
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const margin = {
      top: 20,
      right: 50,
      bottom: 20,
      left: 80, // 改回 80px
    };
    const width = containerWidth - margin.left - margin.right;
    const barHeight = 30;
    const teamHeaderHeight = 40; // 隊名標題的高度

    // 計算每個隊伍的成員數量和所需高度
    let currentTeam = null;
    let totalHeight = 0;
    processedData.forEach((d) => {
      if (d.team !== currentTeam) {
        totalHeight += teamHeaderHeight; // 隊名的高度
        currentTeam = d.team;
      }
      totalHeight += barHeight + 5; // 每個成員的高度
    });

    const height = totalHeight;

    // 清除現有的SVG內容
    d3.select(svgRef.current).selectAll('*').remove();

    // 建立SVG容器
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 定義顏色比例尺
    const color = d3
      .scaleOrdinal()
      .domain([
        '5.7',
        '5.8',
        '5.9',
        '5.10a',
        '5.10b',
        '5.10c',
        '5.10d',
        '5.11a',
        '5.11b',
        '5.11c',
        '5.11d',
        '5.12a',
        '5.12b',
        '5.12c',
        '5.12d',
      ])
      .range([
        '#B71C1C', // 深紅色
        '#C62828',
        '#D32F2F',
        '#E64A19',
        '#F4511E',
        '#FB8C00',
        '#FFB300',
        '#9E9D24',
        '#7CB342',
        '#558B2F',
        '#2E7D32',
        '#00695C',
        '#0277BD',
        '#1565C0',
        '#0D47A1', // 深藍色
      ]);

    // 繪製圖表
    let yPosition = 0;
    currentTeam = null;

    processedData.forEach((d) => {
      // 如果是新的隊伍，添加隊名和分隔線
      if (d.team !== currentTeam) {
        // 添加分隔線（除了第一個隊伍）
        if (currentTeam !== null) {
          svg
            .append('line')
            .attr('x1', -margin.left)
            .attr('x2', width + margin.right)
            .attr('y1', yPosition) // 調整位置，與上面的 bar 保持距離
            .attr('y2', yPosition)
            .attr('stroke', 'rgba(255, 255, 255, 1)') // 降低透明度
            .attr('stroke-width', 1);
        }

        // 添加隊名
        svg
          .append('text')
          .attr('class', 'team-label')
          .attr('x', width / 2) // 置中
          .attr('y', yPosition + teamHeaderHeight / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle') // 文字置中
          .attr('fill', 'white')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text(d.team);

        yPosition += teamHeaderHeight;
        currentTeam = d.team;
      }

      // 繪製分層長條
      let xPosition = 0;
      d.scores.forEach((score) => {
        if (score.count > 0) {
          // 繪製長條
          const bar = svg
            .append('rect')
            .attr('class', `bar-${score.grade}`)
            .attr('x', xPosition)
            .attr('y', yPosition)
            .attr('width', score.scoreTotal)
            .attr('height', barHeight)
            .attr('fill', color(score.grade));

          // 添加 title 元素作為提示
          bar.append('title').text(score.grade);

          // 只在寬度足夠時顯示固定標籤
          if (score.scoreTotal > 30) {
            svg
              .append('text')
              .attr('class', 'count-label')
              .attr('x', xPosition + score.scoreTotal / 2)
              .attr('y', yPosition + barHeight / 2)
              .attr('dy', '0.35em')
              .attr('text-anchor', 'middle')
              .attr('fill', 'white')
              .style('font-size', '12px')
              .text(score.grade);
          }

          xPosition += score.scoreTotal;
        }
      });

      // 添加名稱標籤
      svg
        .append('text')
        .attr('class', 'name-label')
        .attr('x', -5)
        .attr('y', yPosition + barHeight / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('fill', 'white')
        .style('font-size', '14px')
        .text(d.name);

      // 添加總分標籤
      svg
        .append('text')
        .attr('class', 'score-label')
        .attr('x', xPosition + 5)
        .attr('y', yPosition + barHeight / 2)
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .style('font-size', '14px')
        .text(Math.round(d.total));

      yPosition += barHeight + 5;
    });
  };

  useEffect(() => {
    drawChart();
  }, [data]);

  useEffect(() => {
    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default IndividualSpScoreStackBarChart;
