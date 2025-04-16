'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const FragmentListChart = ({ data }) => {
  console.log('FragmentListChart data', data);

  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // 創建繪製圖表的函數
  const drawChart = () => {
    if (!data || !data.length) return;

    // 計算每個人擁有的碎片總數
    const fragmentByPerson = {};
    data.forEach((item) => {
      const name = item.CLMBR_NM;
      const amount = parseInt(item.AMOUNT) || 0;

      if (!fragmentByPerson[name]) {
        fragmentByPerson[name] = {
          CLMBR_NM: name,
          FRAGMENT_TOTAL: 0,
          details: [],
        };
      }

      fragmentByPerson[name].FRAGMENT_TOTAL += amount;
      fragmentByPerson[name].details.push({
        DATE: item.DATE,
        AMOUNT: amount,
        NOTE: item.NOTE,
      });
    });

    // 轉換為數組並按碎片數量降序排序
    const sortedData = Object.values(fragmentByPerson)
      .filter((d) => d.FRAGMENT_TOTAL > 0)
      .sort((a, b) => b.FRAGMENT_TOTAL - a.FRAGMENT_TOTAL);

    // 獲取容器寬度
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const margin = { top: 10, right: 20, bottom: 10, left: 10 };
    const width = containerWidth - margin.left - margin.right;

    // 設定每個項目的高度和間距
    const itemHeight = 40;
    const height = sortedData.length * itemHeight;
    const circleRadius = 12;
    const circleSpacing = 40;

    // 改回固定的右側邊距
    const rightPadding = 0; // 使用較小的固定值，而不是根據容器寬度計算

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
      .data(sortedData)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d, i) => `translate(0,${i * itemHeight})`);

    // 添加名稱文字
    rows
      .append('text')
      .attr('x', 20)
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .style('font-size', '16px')
      .text((d) => d.CLMBR_NM);

    // 為每一行添加碎片圖片
    rows.each(function (d, i) {
      const row = d3.select(this);
      const fragmentCount = d.FRAGMENT_TOTAL;
      const maxIcons = 5; // 最多顯示的圖標數量
      const displayCount = Math.min(fragmentCount, maxIcons);

      // 添加背景矩形
      row
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', itemHeight - 2)
        .attr('fill', 'rgba(20, 20, 40, 0.3)')
        .attr('rx', 5)
        .attr('ry', 5);

      // 添加圖片群組，位於最右邊
      const totalIconsWidth = displayCount * circleSpacing;
      const startX = width - rightPadding - totalIconsWidth;

      const images = row
        .append('g')
        .attr('transform', `translate(${startX}, ${itemHeight / 2})`);

      // 添加碎片圖片
      for (let i = 0; i < displayCount; i++) {
        // 添加碎片圖標
        const image = images
          .append('g')
          .attr('class', 'fragment-icon')
          .attr('transform', `translate(${i * circleSpacing}, 0)`)
          .style('cursor', 'pointer');

        // 在添加實際圖片之前添加圓形背景
        image
          .append('circle')
          .attr('r', circleRadius + 3)
          .attr('fill', 'rgba(80, 80, 200, 0.15)')
          .attr('stroke', 'rgba(120, 120, 255, 0.5)')
          .attr('stroke-width', 1.5);

        // 添加一個額外的外圈增強視覺分離
        image
          .append('circle')
          .attr('r', circleRadius + 5)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(100, 100, 200, 0.1)')
          .attr('stroke-width', 1);

        // 保持圖片大小不變，但調整發光效果
        image
          .append('image')
          .attr('x', -circleRadius + 1)
          .attr('y', -circleRadius + 1)
          .attr('width', circleRadius * 2 - 2)
          .attr('height', circleRadius * 2 - 2)
          .attr('xlink:href', '/fragment.png')
          .style('filter', 'drop-shadow(0 0 3px rgba(100, 200, 255, 0.6))');

        // 為每個圖標添加邊界指示器
        image
          .append('circle')
          .attr('r', circleRadius)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(180, 180, 255, 0.2)')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2,2');

        // 在圖片元素上添加交互效果
        image
          .on('mouseenter', function () {
            d3.select(this)
              .select('image')
              .transition()
              .duration(200)
              .attr('x', -circleRadius)
              .attr('y', -circleRadius)
              .attr('width', circleRadius * 2)
              .attr('height', circleRadius * 2)
              .style('filter', 'drop-shadow(0 0 4px rgba(150, 220, 255, 0.8))');

            // 高亮邊界
            d3.select(this)
              .select('circle:last-of-type')
              .transition()
              .duration(200)
              .attr('stroke', 'rgba(180, 180, 255, 0.6)')
              .attr('stroke-width', 1.5)
              .attr('stroke-dasharray', '3,1');
          })
          .on('mouseleave', function () {
            d3.select(this)
              .select('image')
              .transition()
              .duration(200)
              .attr('x', -circleRadius + 1)
              .attr('y', -circleRadius + 1)
              .attr('width', circleRadius * 2 - 2)
              .attr('height', circleRadius * 2 - 2)
              .style('filter', 'drop-shadow(0 0 2px rgba(100, 200, 255, 0.5))');

            // 恢復原來的邊界
            d3.select(this)
              .select('circle:last-of-type')
              .transition()
              .duration(200)
              .attr('stroke', 'rgba(180, 180, 255, 0.2)')
              .attr('stroke-width', 1)
              .attr('stroke-dasharray', '2,2');
          });
      }

      // 如果碎片數量超過最大顯示數量，添加 +X 提示
      if (fragmentCount > maxIcons) {
        const extraCount = fragmentCount - maxIcons;
        const extraGroup = images
          .append('g')
          .attr('class', 'extra-count')
          .attr('transform', `translate(${maxIcons * circleSpacing}, 0)`)
          .style('cursor', 'pointer');

        // 添加+X文字
        extraGroup
          .append('text')
          .attr('y', 5)
          .attr('text-anchor', 'start')
          .attr('fill', 'white')
          .style('font-size', '14px')
          .text(`+${extraCount}`);
      }
    });

    // 添加行互動效果
    rows
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .select('rect')
          .transition()
          .duration(200)
          .attr('fill', 'rgba(100, 100, 255, 0.2)');

        d3.select(this)
          .selectAll('text')
          .transition()
          .duration(200)
          .attr('fill', '#c08aff');
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .select('rect')
          .transition()
          .duration(200)
          .attr('fill', 'rgba(50, 50, 50, 0.1)');

        d3.select(this)
          .selectAll('text')
          .transition()
          .duration(200)
          .attr('fill', 'white');
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
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  );
};

export default FragmentListChart;
