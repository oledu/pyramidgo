'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BeastScoreListChart = ({ data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // 創建繪製圖表的函數
  const drawChart = () => {
    if (!data || !data.length) return;

    // 過濾出野獸模式的資料，並按總分數降序排序
    const filteredData = data
      .filter((d) => d.BEAST_MODE === 'Y')
      .sort(
        (a, b) =>
          (b.TOTAL_SCORE_BLD || 0) +
          (b.TOTAL_SCORE_SP || 0) -
          ((a.TOTAL_SCORE_BLD || 0) + (a.TOTAL_SCORE_SP || 0))
      );

    // 獲取容器寬度
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const margin = { top: 10, right: 20, bottom: 10, left: 10 };
    const width = containerWidth - margin.left - margin.right;

    // 設定每個項目的高度和間距
    const itemHeight = 35;
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

    // 建立每一行
    const rows = svg
      .selectAll('.row')
      .data(filteredData)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d, i) => `translate(0,${i * itemHeight})`);

    // 添加名稱文字
    rows
      .append('text')
      .attr('x', 10)
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .style('font-size', '16px')
      .text((d) => d.CLMBR_NM);

    // 添加分數文字
    rows
      .append('text')
      .attr('x', width - 10)
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#ffd700')
      .style('font-size', '16px')
      .text((d) => d.TOTAL_SCORE_BLD + d.TOTAL_SCORE_SP + ' 分');

    // 添加分隔線
    rows
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', itemHeight)
      .attr('y2', itemHeight)
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
