'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ClimbingDotChart = ({ data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const drawChart = () => {
    if (!data || !data.length) return;

    // 處理數據
    const processedData = data
      .map((d) => ({
        name: d.CLMBR_NM,
        team: d.TEAM_NM,
        records: d.climbRecords || [],
      }))
      .sort((a, b) => {
        if (a.team === b.team) {
          return a.name.localeCompare(b.name);
        }
        return a.team.localeCompare(b.team);
      });

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const width = containerWidth - margin.left - margin.right;
    const cellSize = 25;
    const teamHeaderHeight = 40;

    // 計算總高度
    let currentTeam = null;
    let totalHeight = 0;
    processedData.forEach((d) => {
      if (d.team !== currentTeam) {
        totalHeight += teamHeaderHeight;
        currentTeam = d.team;
      }
      totalHeight += cellSize + 5;
    });

    const height = totalHeight;

    // 清除現有的SVG內容
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 建立日期範圍
    const dateRange = d3.range(2, 16).map((d) => `3/${d}`);
    const x = d3.scalePoint().domain(dateRange).range([0, width]).padding(0.5);

    // 顏色比例尺
    const colorScale = d3
      .scaleLinear()
      .domain([0, 1, 10, 50, 100])
      .range(['#ffffff', '#ffcdd2', '#e57373', '#f44336', '#b71c1c'])
      .clamp(true);

    let yPosition = 0;
    currentTeam = null;

    processedData.forEach((d) => {
      if (d.team !== currentTeam) {
        if (currentTeam !== null) {
          svg
            .append('line')
            .attr('x1', -margin.left)
            .attr('x2', width + margin.right)
            .attr('y1', yPosition)
            .attr('y2', yPosition)
            .attr('stroke', 'rgba(255, 255, 255, 1)')
            .attr('stroke-width', 1);
        }

        svg
          .append('text')
          .attr('class', 'team-label')
          .attr('x', width / 2)
          .attr('y', yPosition + teamHeaderHeight / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text(d.team);

        yPosition += teamHeaderHeight;
        currentTeam = d.team;
      }

      // 添加名稱標籤
      svg
        .append('text')
        .attr('class', 'name-label')
        .attr('x', -5)
        .attr('y', yPosition + cellSize / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('fill', 'white')
        .style('font-size', '14px')
        .text(d.name);

      // 繪製熱力圖方格
      dateRange.forEach((date) => {
        const dayRecords = d.records.filter((r) => r.DATE === date);
        const totalCount =
          dayRecords.length > 0 ? d3.sum(dayRecords, (r) => +r.SENT_COUNT) : 0;

        svg
          .append('rect')
          .attr('x', x(date) - cellSize / 2)
          .attr('y', yPosition)
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('fill', colorScale(totalCount))
          .attr('stroke', '#444')
          .attr('stroke-width', 1)
          .append('title')
          .text(`${d.name} - ${date}: ${totalCount}次`);
      });

      yPosition += cellSize + 5;
    });

    // 添加 X 軸
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');
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

export default ClimbingDotChart;
