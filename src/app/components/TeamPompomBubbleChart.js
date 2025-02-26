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

    // 建立顏色比例尺
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // 建立pack布局，增加padding值
    const pack = d3
      .pack()
      .size([width - margin * 2, height - margin * 2])
      .padding(10); // 增加間距

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

    // 放置節點
    const node = svg
      .append('g')
      .selectAll()
      .data(root.leaves())
      .join('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // 添加提示框
    node.append('title').text((d) => `${d.data.id}\n${format(d.value)} 顆彩球`);

    // 添加圓圈
    node
      .append('circle')
      .attr('fill-opacity', 0.7) // 改回原本的透明度
      .attr('fill', (d) => color(d.data.id))
      .attr('r', (d) => d.r);

    // 添加標籤，調整字體大小和位置
    const text = node.append('text').attr('clip-path', (d) => `circle(${d.r})`);

    // 添加團隊名稱
    text
      .append('tspan')
      .attr('x', 0)
      .attr('y', (d) => d.r / -3) // 調整垂直位置
      .attr('font-weight', 'bold')
      .attr('font-size', (d) => Math.min(d.r / 3, 16) + 'px') // 根據圓圈大小調整字體
      .text((d) => d.data.id);

    // 添加分數
    text
      .append('tspan')
      .attr('x', 0)
      .attr('y', (d) => d.r / 4) // 調整垂直位置
      .attr('fill-opacity', 0.7)
      .attr('font-size', (d) => Math.min(d.r / 4, 14) + 'px') // 根據圓圈大小調整字體
      .text((d) => format(d.value));
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default TeamPompomBubbleChart;
