'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ClimbingDotChart = ({ data, period }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const drawChart = () => {
    if (!data || !data.length) return;
    // 處理數據並過濾無效數據
    const processedData = data
      .filter((d) => d.CLMBR_NM && d.TEAM_NM) // 過濾空值和特定團隊
      .map((d) => ({
        name: d.CLMBR_NM,
        team: d.TEAM_NM,
        records: d.climbRecords || [],
      }))
      .sort((a, b) => {
        const teamA = a.team;
        const teamB = b.team;
        const nameA = a.name;
        const nameB = b.name;

        if (teamA === teamB) {
          return nameA.localeCompare(nameB);
        }
        return teamA.localeCompare(teamB);
      });

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const width = containerWidth - margin.left - margin.right;
    const cellWidth = 20; // 固定寬度
    const cellHeight = 20; // 固定高度
    const cellPadding = 2; // 格子間距
    const teamHeaderHeight = 40;

    // 計算總高度
    let currentTeam = null;
    let totalHeight = 0;
    processedData.forEach((d) => {
      if (d.team !== currentTeam) {
        totalHeight += teamHeaderHeight;
        currentTeam = d.team;
      }
      totalHeight += cellHeight + cellPadding;
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

    const getDateRange = (period) => {
      switch (period) {
        case '202501T':
          return d3.range(2, 16).map((d) => `3/${d}`); // 3/2q-3/15
        case '202502T':
          return d3.range(16, 30).map((d) => `3/${d}`); // 3/16-3/28
        default:
          return d3.range(16, 30).map((d) => `3/${d}`); // 預設值
      }
    };

    // 建立日期範圍
    const dateRange = getDateRange(period);
    const x = d3.scalePoint().domain(dateRange).range([0, width]).padding(0.5);

    // 修改顏色函數，使用深紅到淺紅的漸變1
    const getColor = (value) => {
      if (value === 0) return '#1a1a2e'; // 深藍黑色背景
      if (value > 0 && value <= 5) return '#800000'; // 深紅色 - 較少
      if (value > 5 && value <= 10) return '#b30000'; // 中深紅色 - 中等
      if (value > 10 && value <= 15) return '#e60000'; // 中紅色 - 較多
      if (value > 15) return '#ff6666'; // 淺紅色 - 最多
      return '#1a1a2e'; // 默認
    };

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
        .attr('y', yPosition + cellHeight / 2)
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

        const cellGroup = svg.append('g').attr('class', 'cell-group');

        const rect = cellGroup
          .append('rect')
          .attr('x', x(date) - cellWidth / 2)
          .attr('y', yPosition)
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('fill', getColor(totalCount))
          .attr('stroke', '#444')
          .attr('stroke-width', 1);

        // 修改事件處理
        const showTooltip = (event, rect) => {
          const tooltip = d3.select('#tooltip');
          const isMobile = window.innerWidth <= 768;
          const tooltipWidth = isMobile ? 250 : 180;
          const tooltipHeight = 150; // 預估高度

          if (isMobile) {
            // 手機版：置中顯示
            tooltip
              .style('transform', 'translate(-50%, -50%)')
              .style('left', '50%')
              .style('top', '50%');
          } else {
            // 電腦版：顯示在方格旁邊
            const rectBounds = rect.getBoundingClientRect();
            const svgBounds = svgRef.current.getBoundingClientRect();

            // 預設顯示在方格右側
            let left = `${rectBounds.right + 10}px`;
            let top = `${rectBounds.top - tooltipHeight / 2 + rectBounds.height / 2}px`;

            // 如果 tooltip 會超出視窗右側，則顯示在方格左側
            if (rectBounds.right + tooltipWidth + 10 > window.innerWidth) {
              left = `${rectBounds.left - tooltipWidth - 10}px`;
            }

            tooltip
              .style('transform', 'none')
              .style('left', left)
              .style('top', top);
          }

          tooltip.style('opacity', 1).style('display', 'block').html(`
              <div class="text-base md:text-sm p-1">
                <div class="text-center mb-2 border-b border-gray-600 pb-2">
                  <div class="font-bold">${d.name}</div>
                  <div class="text-sm text-gray-300">隊伍：${d.team}</div>
                </div>
                <div class="mb-1">日期：<span class="font-bold">${date}</span></div>
                <div class="mb-1">完成次數：<span class="font-bold">${totalCount}</span></div>
                ${dayRecords
                  .map(
                    (r) =>
                      `<div class="text-sm">- ${r.SENT_LEVEL}: ${r.SENT_COUNT}次</div>`
                  )
                  .join('')}
              </div>
            `);
        };

        const hideTooltip = () => {
          d3.select('#tooltip').style('display', 'none');
        };

        rect
          .on('mouseover', function (event) {
            if (window.innerWidth > 768) {
              showTooltip(event, this);
            }
          })
          .on('mouseout', function () {
            if (window.innerWidth > 768) {
              hideTooltip();
            }
          })
          .on('click', function (event) {
            event.preventDefault();
            showTooltip(event, this);
            setTimeout(hideTooltip, 3000);
          })
          .on('touchstart', function (event) {
            event.preventDefault();
            showTooltip(event, this);
            setTimeout(hideTooltip, 3000);
          });
      });

      yPosition += cellHeight + cellPadding;
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
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div
        id="tooltip"
        className="fixed hidden bg-gray-800 text-white rounded-lg shadow-lg transition-opacity duration-200
                   p-3 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          pointerEvents: 'none',
          zIndex: 1000,
          width: window.innerWidth <= 768 ? '250px' : '180px',
        }}
      />
    </div>
  );
};

export default ClimbingDotChart;
