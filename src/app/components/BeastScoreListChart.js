'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BeastScoreListChart = ({ data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

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
    const itemHeight = 40; // 增加高度以容納特效
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
      .attr('transform', (d, i) => `translate(0,${i * itemHeight})`);

    // 添加背景矩形
    rows
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', itemHeight - 1)
      .attr('fill', (d, i) => {
        if (i === 0) return 'url(#gold-gradient)';
        if (i === 1) return 'url(#silver-gradient)';
        if (i === 2) return 'url(#bronze-gradient)';
        return 'rgba(0, 0, 0, 0.2)';
      })
      .attr('rx', 5)
      .attr('ry', 5);

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
      .attr('stop-color', 'rgba(255, 215, 0, 0.3)');

    goldGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(255, 215, 0, 0.1)');

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
      .attr('stop-color', 'rgba(192, 192, 192, 0.3)');

    silverGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(192, 192, 192, 0.1)');

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
      .attr('stop-color', 'rgba(205, 127, 50, 0.3)');

    bronzeGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(205, 127, 50, 0.1)');

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
      .attr('x', 15)
      .attr('y', itemHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#000')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text((d, i) => i + 1);

    // 添加名稱文字
    rows
      .append('text')
      .attr('x', (d, i) => (i < 3 ? 35 : 10))
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .style('font-size', (d, i) => (i < 3 ? '18px' : '16px'))
      .style('font-weight', (d, i) => (i < 3 ? 'bold' : 'normal'))
      .text((d) => d.CLMBR_NM);

    // 添加分數文字
    rows
      .append('text')
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
