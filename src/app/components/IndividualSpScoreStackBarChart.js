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
      .map((d) => ({
        name: d.CLMBR_NM,
        team: d.TEAM_NM || 'Unknown',
        total: d.TOTAL_SCORE_SP,
      }))
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
      left: 80, // 減少左邊距，因為不需要放隊名了
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

    // 建立比例尺
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.total)])
      .range([0, width]);

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

      // 繪製長條
      svg
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', yPosition)
        .attr('width', x(d.total))
        .attr('height', barHeight)
        .attr('fill', '#ffd700');

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

      // 添加分數標籤
      svg
        .append('text')
        .attr('class', 'score-label')
        .attr('x', x(d.total) + 5)
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
