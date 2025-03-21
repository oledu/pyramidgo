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
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', itemHeight - 1)
      .attr('fill', (d, i) => {
        // 檢查是否為 NPC
        if (d.IS_NPC === 'Y') {
          return 'url(#npc-gradient)'; // NPC 使用綠色漸層
        }

        // 原有的前三名漸層
        if (i === 0) return 'url(#gold-gradient)';
        if (i === 1) return 'url(#silver-gradient)';
        if (i === 2) return 'url(#bronze-gradient)';
        return 'rgba(0, 0, 0, 0.2)';
      })
      .attr('rx', 8)
      .attr('ry', 8);

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

    // 添加 NPC 綠色漸變
    const npcGradient = defs
      .append('linearGradient')
      .attr('id', 'npc-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    npcGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(0, 128, 0, 0.3)'); // 深綠色

    npcGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(144, 238, 144, 0.3)'); // 淺綠色

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
      .attr('x', (d, i) => (i < 3 ? 35 : 10))
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('fill', (d, i) => {
        if (d.IS_NPC === 'Y') return '#00cc00'; // NPC 名稱使用綠色
        if (i === 0) return '#FFD700'; // 金色
        if (i === 1) return '#C0C0C0'; // 銀色
        if (i === 2) return '#CD7F32'; // 銅色
        return 'white';
      })
      .style('font-size', (d, i) => {
        if (d.IS_NPC === 'Y' || i < 3) return '18px'; // NPC 和前三名使用大字體
        return '16px';
      })
      .style('font-weight', (d, i) => {
        if (d.IS_NPC === 'Y' || i < 3) return 'bold'; // NPC 和前三名使用粗體
        return 'normal';
      })
      .text((d) => d.CLMBR_NM);

    // 添加分數文字
    rows
      .append('text')
      .attr('x', width - 10)
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', (d, i) => {
        if (d.IS_NPC === 'Y') return '#00cc00'; // NPC 分數使用綠色
        if (i === 0) return '#ffd700'; // 金
        if (i === 1) return '#c0c0c0'; // 銀
        if (i === 2) return '#cd7f32'; // 銅
        return 'rgba(255, 255, 255, 0.8)'; // 其他人使用半透明白色
      })
      .style('font-size', (d, i) => {
        if (d.IS_NPC === 'Y' || i < 3) return '20px'; // NPC 和前三名使用大字體
        return '16px';
      })
      .style('font-weight', (d, i) => {
        if (d.IS_NPC === 'Y' || i < 3) return 'bold'; // NPC 和前三名使用粗體
        return 'normal';
      })
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

    // 添加滑鼠事件 - 完整修復版本
    rows.on('mouseenter', function (event, d) {
      const row = d3.select(this);
      row.selectAll('text').transition().duration(150).attr('fill', '#c08aff'); // 淡紫色，不那麼刺眼

      row
        .select('rect')
        .transition()
        .duration(150)
        .attr('fill', 'rgba(150, 100, 255, 0.3)'); // 更淡的背景
    });

    rows.on('mouseleave', function (event, d) {
      const row = d3.select(this);
      const i = filteredData.indexOf(d);

      // 獲取所有文字元素
      const texts = row.selectAll('text');

      // 第一個文字元素通常是名稱
      texts
        .filter(function (d, textIndex) {
          // 如果是前三名，第一個文字是排名數字，第二個是名稱
          return i < 3 ? textIndex === 1 : textIndex === 0;
        })
        .transition()
        .duration(300)
        .attr('fill', function () {
          if (d.IS_NPC === 'Y') return '#00cc00'; // NPC 名稱使用綠色
          if (i === 0) return '#FFD700'; // 金色
          if (i === 1) return '#C0C0C0'; // 銀色
          if (i === 2) return '#CD7F32'; // 銅色
          return 'white';
        });

      // 最後一個文字元素是分數
      texts
        .filter(function (d, textIndex) {
          return textIndex === texts.size() - 1;
        })
        .transition()
        .duration(300)
        .attr('fill', function () {
          if (d.IS_NPC === 'Y') return '#00cc00'; // NPC 分數使用綠色
          if (i === 0) return '#ffd700'; // 金
          if (i === 1) return '#c0c0c0'; // 銀
          if (i === 2) return '#cd7f32'; // 銅
          return 'rgba(255, 255, 255, 0.8)'; // 其他人使用半透明白色
        });

      // 如果是前三名，第一個文字是排名數字
      if (i < 3) {
        texts
          .filter(function (d, textIndex) {
            return textIndex === 0;
          })
          .transition()
          .duration(300)
          .attr('fill', '#000');
      }

      // 恢復背景顏色
      row
        .select('rect')
        .transition()
        .duration(300)
        .attr('fill', function () {
          if (d.IS_NPC === 'Y') return 'url(#npc-gradient)'; // NPC 使用綠色漸層
          if (i === 0) return 'url(#gold-gradient)';
          if (i === 1) return 'url(#silver-gradient)';
          if (i === 2) return 'url(#bronze-gradient)';
          return 'rgba(0, 0, 0, 0.2)';
        });
    });

    rows.on('click', function (event, d) {
      console.log('Row clicked:', d);

      // 發送 Google Analytics 事件
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'beast_score_item_click', {
          event_category: 'beast_mode',
          event_label: d.CLMBR_NM,
          value: d.TOTAL_SCORE_BLD || 0,
          position: filteredData.indexOf(d) + 1,
        });
        console.log('GA Event sent:', 'beast_score_item_click', d.CLMBR_NM);
      } else {
        console.log('Google Analytics not available');
      }
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
