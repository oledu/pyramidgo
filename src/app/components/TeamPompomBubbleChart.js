'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TeamPompomBubbleChart = ({ data, individualData }) => {
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

    // 修改顏色比例尺
    const color = d3
      .scaleOrdinal()
      .range(d3.schemeTableau10);

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

    // 為每個球體創建漸層
    root.leaves().forEach((node, i) => {
      const gradientId = `gradient-${i}`;
      const baseColor = color(node.data.id);
      
      // 創建徑向漸層
      const gradient = defs
        .append('radialGradient')
        .attr('id', gradientId)
        .attr('cx', '30%')
        .attr('cy', '30%')
        .attr('r', '70%');

      // 添加漸層步驟
      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.rgb(baseColor).brighter(0.7))
        .attr('stop-opacity', 1);

      gradient
        .append('stop')
        .attr('offset', '50%')
        .attr('stop-color', baseColor)
        .attr('stop-opacity', 1);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(baseColor).darker(0.7))
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
      .join('g');

    // 添加圓圈，使用漸層填充
    const circles = node
      .append('circle')
      .attr('fill-opacity', 1)
      .attr('fill', (d, i) => `url(#gradient-${i})`)
      .attr('r', (d) => d.r);

    // 添加陰影效果
    const shadows = node
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.2)
      .style('filter', 'blur(1px)');

    // 添加文字組
    const textGroups = node.append('g');

    // 修改文字部分
    textGroups.each(function (d, i) {
      const textGroup = d3.select(this);

      // 添加隊名
      textGroup
        .append('text')
        .style('font-size', `${Math.min(d.r / 3.5, 14)}px`)
        .style('font-weight', 'bold')
        .style('fill', '#000000')
        .append('textPath')
        .attr('href', `#textPath-${i}`)
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .text(d.data.id);

      // 添加數字
      textGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', `${d.r * 0.3}px`)
        .style('fill', '#000000')
        .style('font-size', `${Math.min(d.r / 3.5, 14)}px`)
        .style('fill-opacity', '0.8')
        .text(format(d.value));
    });

    // 創建力導向模擬
    const simulation = d3
      .forceSimulation(root.leaves())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceManyBody().strength(-30))  // 增加排斥力
      .force(
        'collide',
        d3
          .forceCollide()
          .radius((d) => d.r + 1)  // 添加一点点间距
          .strength(1)  // 最大碰撞强度
          .iterations(3)  // 增加迭代次数以提高精确度
      )
      .force(
        'x',
        d3
          .forceX()
          .x((d) => d.x)
          .strength(0.2)
      )
      .force(
        'y',
        d3
          .forceY()
          .y((d) => d.y)
          .strength(0.2)
      );

    // 更新節點位置
    simulation.on('tick', () => {
      // 在每次tick时进行碰撞检测
      for (let i = 0; i < 3; i++) {  // 多次迭代以确保分离
        root.leaves().forEach((d1) => {
          root.leaves().forEach((d2) => {
            if (d1 !== d2) {
              const dx = d1.x - d2.x;
              const dy = d1.y - d2.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = d1.r + d2.r;
              
              if (distance < minDistance) {
                const moveX = (dx / distance) * (minDistance - distance) * 0.5;
                const moveY = (dy / distance) * (minDistance - distance) * 0.5;
                
                d1.x += moveX;
                d1.y += moveY;
                d2.x -= moveX;
                d2.y -= moveY;
              }
            }
          });
        });
      }

      // 应用边界限制
      node.attr('transform', (d) => {
        d.x = Math.max(d.r, Math.min(width - d.r, d.x));
        d.y = Math.max(d.r, Math.min(height - d.r, d.y));
        return `translate(${d.x},${d.y})`;
      });
    });

    // 添加拖拽行為
    node.call(
      d3
        .drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
          
          // 追蹤拖曳開始事件
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'teampompom_drag_start', {
              'event_category': 'interaction',
              'event_label': d.data.id,
              'value': d.value
            });
          }
        })
        .on('drag', (event, d) => {
          // 限制拖拽范围
          d.fx = Math.max(d.r, Math.min(width - d.r, event.x));
          d.fy = Math.max(d.r, Math.min(height - d.r, event.y));
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          
          // 追蹤拖曳結束事件
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'teampompom_drag_end', {
              'event_category': 'interaction',
              'event_label': d.data.id,
              'value': d.value
            });
          }
        })
    );

    // 互動區域
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
        
        // 追蹤點擊事件
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'teampompom_click', {
            'event_category': 'interaction',
            'event_label': d.data.id,
            'value': d.value
          });
        }
      });

    const showTooltip = (event, d) => {
      // 找出該隊伍的所有成員並排序
      const teamMembers = individualData
        ?.filter((member) => member.TEAM_NM === d.data.id)
        .sort((a, b) => b.POMPOM_TOTAL - a.POMPOM_TOTAL);

      const tooltip = d3.select('#tooltip');
      const isMobile = window.innerWidth <= 768;
      const tooltipWidth = isMobile ? 250 : 180;
      const tooltipHeight = 100;

      // 設置位置
      if (isMobile) {
        tooltip
          .style('transform', 'translate(-50%, -50%)')
          .style('left', '50%')
          .style('top', '50%');
      } else {
        const svgBounds = svgRef.current.getBoundingClientRect();
        const circleCenterX = svgBounds.left + d.x;
        const circleCenterY = svgBounds.top + d.y;

        let left = `${circleCenterX + d.r + 10}px`;
        let top = `${circleCenterY - tooltipHeight / 2}px`;

        if (circleCenterX + d.r + tooltipWidth + 10 > window.innerWidth) {
          left = `${circleCenterX - d.r - tooltipWidth - 10}px`;
        }

        tooltip
          .style('transform', 'none')
          .style('left', left)
          .style('top', top);
      }

      // 設置內容
      tooltip.style('opacity', 1).style('display', 'block').html(`
          <div class="text-base md:text-sm p-1">
            <div class="text-center mb-3 border-b border-gray-600 pb-2">
              <div class="font-bold text-xl md:text-2xl mb-2">${d.data.id}</div>
              <div class="font-bold">
                <span class="text-gray-300">共</span>
                <span class="text-yellow-400 text-xl md:text-2xl mx-1">${format(d.value)}</span>
                <span class="text-gray-300">顆彩球</span>
              </div>
            </div>
            <div class="max-h-[200px] overflow-y-auto">
              ${teamMembers
                .map(
                  (member) => `
                <div class="mb-1 flex justify-between items-center">
                  <span class="truncate pr-2">${member.CLMBR_NM}</span>
                  <div class="flex items-center gap-1">
                    ${Array(member.POMPOM_TOTAL)
                      .fill(0)
                      .map(
                        () =>
                          `<span class="inline-block w-3 h-3 rounded-full bg-red-500"></span>`
                      )
                      .join('')}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `);
    };

    const hideTooltip = () => {
      d3.select('#tooltip').style('display', 'none');
    };

    // 清理函數
    return () => {
      simulation.stop();
    };
  }, [data, individualData]);

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
