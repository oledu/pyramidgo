'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BeastScoreListChart = ({ data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  // 創建繪製圖表的函數
  const drawChart = () => {
    if (!data || !data.length) return;

    // 過濾出野獸模式的資料，並按抱石分數降序排序
    const filteredData = data
      .filter((d) => d.BEAST_MODE === 'Y')
      .sort((a, b) => (b.TOTAL_SCORE_BLD || 0) - (a.TOTAL_SCORE_BLD || 0));

    // 獲取容器寬度
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const margin = { top: 10, right: 20, bottom: 10, left: 10 };
    const width = containerWidth - margin.left - margin.right;

    // 設定每個項目的高度和間距
    const itemHeight = 40;
    const height = filteredData.length * itemHeight;

    // 清除現有的SVG內容
    d3.select(svgRef.current).selectAll('*').remove();

    // 建立SVG容器
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 為前三名添加特殊背景
    const rows = svg
      .selectAll('.row')
      .data(filteredData)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d, i) => `translate(0,${i * itemHeight})`)
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .style('-webkit-user-select', 'none')
      .style('-moz-user-select', 'none')
      .style('-ms-user-select', 'none');

    // 添加背景矩形
    rows
      .append('rect')
      .attr('class', 'row-bg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', itemHeight - 1)
      .attr('fill', (d, i) => {
        if (i === 0) return 'url(#gold-gradient)';
        if (i === 1) return 'url(#silver-gradient)';
        if (i === 2) return 'url(#bronze-gradient)';
        return 'rgba(0, 0, 0, 0.2)';
      });

    // 定義漸變
    const defs = svg.append('defs');

    // 金牌漸變
    const goldGradient = defs
      .append('linearGradient')
      .attr('id', 'gold-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    goldGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(255, 215, 0, 0.2)');

    goldGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(255, 215, 0, 0.2)');

    // 銀牌漸變
    const silverGradient = defs
      .append('linearGradient')
      .attr('id', 'silver-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    silverGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(192, 192, 192, 0.2)');

    silverGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(192, 192, 192, 0.2)');

    // 銅牌漸變
    const bronzeGradient = defs
      .append('linearGradient')
      .attr('id', 'bronze-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    bronzeGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(205, 127, 50, 0.2)');

    bronzeGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(205, 127, 50, 0.2)');

    // 為前三名添加排名標記
    rows
      .filter((d, i) => i < 3)
      .append('circle')
      .attr('cx', 15)
      .attr('cy', itemHeight / 2)
      .attr('r', 12)
      .attr('fill', (d, i) => {
        if (i === 0) return '#ffd700'; // 金
        if (i === 1) return '#c0c0c0'; // 銀
        return '#cd7f32'; // 銅
      });

    rows
      .filter((d, i) => i < 3)
      .append('text')
      .attr('class', 'rank-text')
      .attr('x', 15)
      .attr('y', itemHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#000')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text((d, i) => i + 1);

    // 添加名稱文字
    rows
      .append('text')
      .attr('class', 'name-text')
      .attr('x', (d, i) => (i < 3 ? 35 : 10))
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('fill', (d, i) => {
        if (i === 0) return '#FFD700'; // 金色
        if (i === 1) return '#C0C0C0'; // 銀色
        if (i === 2) return '#CD7F32'; // 銅色
        return 'white'; // 其他維持白色
      })
      .style('font-size', (d, i) => (i < 3 ? '18px' : '16px'))
      .style('font-weight', (d, i) => (i < 3 ? 'bold' : 'normal'))
      .style('pointer-events', 'none')
      .text((d) => d.CLMBR_NM);

    // 添加分數文字
    rows
      .append('text')
      .attr('class', 'score-text')
      .attr('x', width - 10)
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', (d, i) => {
        if (i === 0) return '#ffd700'; // 金
        if (i === 1) return '#c0c0c0'; // 銀
        if (i === 2) return '#cd7f32'; // 銅
        return 'rgba(255, 255, 255, 0.8)'; // 其他人使用半透明白色
      })
      .style('font-size', (d, i) => (i < 3 ? '20px' : '16px'))
      .style('font-weight', (d, i) => (i < 3 ? 'bold' : 'normal'))
      .style('pointer-events', 'none')
      .text(
        (d) =>
          (d.TOTAL_SCORE_BLD % 1 === 0
            ? d.TOTAL_SCORE_BLD
            : d.TOTAL_SCORE_BLD.toFixed(1)) + ' 分'
      );

    // 添加分隔線
    rows
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', itemHeight - 1)
      .attr('y2', itemHeight - 1)
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-width', 1);
    
    // 添加滑鼠事件 - 簡化版本
    rows.on('mouseenter', function(event, d) {
      const row = d3.select(this);
      row.selectAll('text')
        .transition()
        .duration(150)
        .attr('fill', '#c08aff'); // 淡紫色，不那麼刺眼
        
      row.select('rect')
        .transition()
        .duration(150)
        .attr('fill', 'rgba(150, 100, 255, 0.3)'); // 更淡的背景
    });
    
    rows.on('mouseleave', function(event, d) {
      const row = d3.select(this);
      const i = filteredData.indexOf(d);
      
      // 恢復排名數字顏色 (只有前三名有)
      if (i < 3) {
        row.select('.rank-text')
          .transition()
          .duration(300)
          .attr('fill', '#000');
      }
        
      // 恢復名稱文字顏色
      row.select('.name-text')
        .transition()
        .duration(300)
        .attr('fill', () => {
          if (i === 0) return '#FFD700';
          if (i === 1) return '#C0C0C0';
          if (i === 2) return '#CD7F32';
          return 'white';
        });
        
      // 恢復分數文字顏色
      row.select('.score-text')
        .transition()
        .duration(300)
        .attr('fill', () => {
          if (i === 0) return '#ffd700';
          if (i === 1) return '#c0c0c0';
          if (i === 2) return '#cd7f32';
          return 'rgba(255, 255, 255, 0.8)';
        });
        
      // 恢復背景顏色
      row.select('rect')
        .transition()
        .duration(300)
        .attr('fill', () => {
          if (i === 0) return 'url(#gold-gradient)';
          if (i === 1) return 'url(#silver-gradient)';
          if (i === 2) return 'url(#bronze-gradient)';
          return 'rgba(0, 0, 0, 0.2)';
        });
    });
    
    rows.on('click', function(event, d) {
      console.log('Row clicked:', d);
      // 點擊效果可以在這裡添加
    });
  };

  // 初始繪製
  useEffect(() => {
    drawChart();
  }, [data]);

  // 監聽視窗大小變化
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

export default BeastScoreListChart;
