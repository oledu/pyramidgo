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

        // 先創建一個群組來包含方格和tooltip
        const cellGroup = svg.append('g').attr('class', 'cell-group');

        // 繪製方格
        const rect = cellGroup
          .append('rect')
          .attr('x', x(date) - cellSize / 2)
          .attr('y', yPosition)
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('fill', colorScale(totalCount))
          .attr('stroke', '#444')
          .attr('stroke-width', 1);

        // 創建tooltip組
        const tooltipGroup = cellGroup
          .append('g')
          .attr('class', 'tooltip-group')
          .style('opacity', 0)
          .style('pointer-events', 'none'); // 防止tooltip干擾事件

        // 添加背景矩形
        const tooltipText = `日期: ${date}\n次數: ${totalCount}`;
        const padding = { x: 8, y: 4 };

        tooltipGroup
          .append('rect')
          .attr('class', 'tooltip-bg')
          .attr('fill', 'rgba(0, 0, 0, 0.8)')
          .attr('rx', 4)
          .attr('ry', 4);

        // 添加文字（分兩行）
        const tooltipTextElement = tooltipGroup
          .append('text')
          .attr('class', 'tooltip-text')
          .attr('x', x(date))
          .attr('y', yPosition - 20)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .style('font-size', '12px');

        tooltipTextElement
          .append('tspan')
          .attr('x', x(date))
          .attr('dy', '0')
          .text(`日期: ${date}`);

        tooltipTextElement
          .append('tspan')
          .attr('x', x(date))
          .attr('dy', '1.2em')
          .text(`次數: ${totalCount}`);

        // 設置tooltip背景大小
        const textBBox = tooltipTextElement.node().getBBox();
        tooltipGroup
          .select('.tooltip-bg')
          .attr('x', textBBox.x - padding.x)
          .attr('y', textBBox.y - padding.y)
          .attr('width', textBBox.width + padding.x * 2)
          .attr('height', textBBox.height + padding.y * 2);

        // 添加事件處理
        rect
          .on('mouseover', function () {
            tooltipGroup.style('opacity', 1);
          })
          .on('mouseout', function () {
            tooltipGroup.style('opacity', 0);
          })
          .on('touchstart', function (event) {
            event.preventDefault();
            d3.selectAll('.tooltip-group').style('opacity', 0);
            tooltipGroup.style('opacity', 1);
          })
          .on('touchend', function () {
            setTimeout(() => {
              tooltipGroup.style('opacity', 0);
            }, 1500);
          });
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
