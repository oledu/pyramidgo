'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TeamPompomBubbleChart = ({ data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.length) return;

    // 將資料轉換為需要的格式
    const formattedData = data.map((item) => ({
      id: item.TEAM_NM || 'Unknown',
      value: item.TOTAL_POMPOM || 0,
    }));

    // 獲取容器寬度
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const width = containerWidth;
    const height = containerWidth; // 保持正方形比例
    const margin = 1;

    // 設定數值格式
    const format = d3.format(',d');

    // 修改顏色比例尺，使顏色更暗沉
    const color = d3
      .scaleOrdinal()
      .range(d3.schemeTableau10.map((c) => d3.rgb(c).darker(0.3)));

    // 建立pack布局，增加padding值
    const pack = d3
      .pack()
      .size([width - margin * 2, height - margin * 2])
      .padding(3); // 減少間距使排列更緊密

    // 計算層級結構
    const root = pack(
      d3.hierarchy({ children: formattedData }).sum((d) => d.value)
    );

    // 清除現有的SVG內容
    d3.select(svgRef.current).selectAll('*').remove();

    // 建立SVG容器，調整字體大小
    const svg = d3
      .select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [-margin, -margin, width, height])
      .attr('style', 'max-width: 100%; height: auto; font: 14px sans-serif;') // 增加字體大小
      .attr('text-anchor', 'middle');

    // 在 SVG 定義中添加漸層
    const defs = svg.append('defs');

    // 為每個球體創建獨特的漸層
    root.leaves().forEach((node, i) => {
      const gradientId = `gradient-${i}`;
      const baseColor = color(node.data.id);

      const gradient = defs
        .append('radialGradient')
        .attr('id', gradientId)
        .attr('cx', '35%')
        .attr('cy', '35%')
        .attr('r', '60%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.rgb(baseColor).brighter(0.3))
        .attr('stop-opacity', 1);

      gradient
        .append('stop')
        .attr('offset', '50%')
        .attr('stop-color', baseColor)
        .attr('stop-opacity', 1);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(baseColor).darker(0.5))
        .attr('stop-opacity', 1);

      // 為每個球體添加水平弧形文字路徑
      defs
        .append('path')
        .attr('id', `textPath-${i}`)
        .attr('d', () => {
          const r = node.r * 0.8;
          return `
            M ${-r},-5
            A ${r},${r * 0.3} 0 0,1 ${r},-5
          `;
        });
    });

    // 放置節點
    const node = svg
      .append('g')
      .selectAll()
      .data(root.leaves())
      .join('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // 添加圓圈，使用漸層填充
    node
      .append('circle')
      .attr('fill-opacity', 1) // 改為不透明
      .attr('fill', (d, i) => `url(#gradient-${i})`) // 使用漸層
      .attr('r', (d) => d.r);

    // 添加陰影效果
    node
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.1);

    // 添加文字組
    const textGroups = node.append('g');

    // 修改文字部分
    textGroups.each(function (d, i) {
      const textGroup = d3.select(this);

      // 添加隊名（改為黑色）
      textGroup
        .append('text')
        .style('font-size', `${Math.min(d.r / 3.5, 14)}px`)
        .style('font-weight', 'bold')
        .style('fill', '#000000') // 改為黑色
        .append('textPath')
        .attr('href', `#textPath-${i}`)
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .text(d.data.id);

      // 添加數字（改為黑色）
      textGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', `${d.r * 0.3}px`)
        .style('fill', '#000000') // 改為黑色
        .style('font-size', `${Math.min(d.r / 3.5, 14)}px`)
        .style('fill-opacity', '0.8') // 稍微調整透明度
        .text(format(d.value));
    });

    const showTooltip = (event, d) => {
      const tooltip = d3.select('#tooltip');
      const isMobile = window.innerWidth <= 768;
      const tooltipWidth = isMobile ? 250 : 180;
      const tooltipHeight = 100; // 預估高度

      let left, top;

      if (isMobile) {
        // 手機版：置中顯示
        left = '50%';
        top = '50%';
        tooltip
          .style('transform', 'translate(-50%, -50%)')
          .style('left', left)
          .style('top', top);
      } else {
        // 電腦版：顯示在球體旁邊
        const svgBounds = svgRef.current.getBoundingClientRect();
        const circleCenterX = svgBounds.left + d.x;
        const circleCenterY = svgBounds.top + d.y;

        // 預設顯示在球體右側
        left = `${circleCenterX + d.r + 10}px`;
        top = `${circleCenterY - tooltipHeight / 2}px`;

        // 如果 tooltip 會超出視窗右側，則顯示在球體左側
        if (circleCenterX + d.r + tooltipWidth + 10 > window.innerWidth) {
          left = `${circleCenterX - d.r - tooltipWidth - 10}px`;
        }

        tooltip
          .style('transform', 'none')
          .style('left', left)
          .style('top', top);
      }

      tooltip.style('opacity', 1).style('display', 'block').html(`
          <div class="text-base md:text-sm p-1">
            <div class="text-center mb-2 border-b border-gray-600 pb-2">
              <div class="font-bold">${d.data.id}</div>
            </div>
            <div class="text-xl text-center text-yellow-400 font-bold">
              ${format(d.value)} 顆彩球
            </div>
          </div>
        `);
    };

    const hideTooltip = () => {
      d3.select('#tooltip').style('display', 'none');
    };

    // 更新事件處理
    node
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', 'transparent')
      .attr('class', 'interaction-area')
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        if (window.innerWidth > 768) {
          showTooltip(event, d);
        }
      })
      .on('mouseout', function () {
        if (window.innerWidth > 768) {
          hideTooltip();
        }
      })
      .on('click', function (event, d) {
        event.preventDefault();
        showTooltip(event, d);
        setTimeout(hideTooltip, 3000);
      });
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div
        id="tooltip"
        className="fixed hidden bg-gray-800 text-white rounded-lg shadow-lg transition-opacity duration-200 p-3"
        style={{
          pointerEvents: 'none',
          zIndex: 1000,
          width: window.innerWidth <= 768 ? '250px' : '180px',
        }}
      />
    </div>
  );
};

export default TeamPompomBubbleChart;
