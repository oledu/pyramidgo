'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BeastScoreListChart = ({ data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationPlayed, setAnimationPlayed] = useState(false); // 追蹤動畫是否已播放

  // 創建繪製圖表的函數
  const drawChart = () => {
    if (!data || !data.length) return;

    // 過濾出野獸模式的資料，並按抱石分數降序排序
    const filteredData = data
      .filter((d) => d.BEAST_MODE === 'Y')
      .sort((a, b) => (b.TOTAL_SCORE_BLD || 0) - (a.TOTAL_SCORE_BLD || 0));

    // 獲取非 NPC 的數據，用於確定前三名
    const nonNpcData = filteredData.filter((d) => d.IS_NPC !== 'Y');

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

    // 為前三名添加特殊背景
    const rows = svg
      .selectAll('.row')
      .data(filteredData)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d, i) => {
        // 如果是 NPC 且元素可見且動畫尚未播放，初始位置在頂部更遠處（完全不可見）
        if (d.IS_NPC === 'Y' && isVisible && !animationPlayed) {
          return `translate(0, -${itemHeight * 2})`;
        }
        // 其他項目正常位置
        return `translate(0, ${i * itemHeight})`;
      });

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

        // 檢查是否為非 NPC 的前三名
        const nonNpcIndex = nonNpcData.indexOf(d);
        if (nonNpcIndex === 0) return 'url(#gold-gradient)';
        if (nonNpcIndex === 1) return 'url(#silver-gradient)';
        if (nonNpcIndex === 2) return 'url(#bronze-gradient)';
        return 'rgba(0, 0, 0, 0.2)';
      })
      .attr('rx', 8)
      .attr('ry', 8);

    // 為非 NPC 的前三名添加排名標記
    rows
      .filter((d) => {
        const nonNpcIndex = nonNpcData.indexOf(d);
        return nonNpcIndex >= 0 && nonNpcIndex < 3;
      })
      .append('circle')
      .attr('cx', 15)
      .attr('cy', itemHeight / 2)
      .attr('r', 12)
      .attr('fill', (d) => {
        const nonNpcIndex = nonNpcData.indexOf(d);
        if (nonNpcIndex === 0) return '#ffd700'; // 金
        if (nonNpcIndex === 1) return '#c0c0c0'; // 銀
        return '#cd7f32'; // 銅
      });

    rows
      .filter((d) => {
        const nonNpcIndex = nonNpcData.indexOf(d);
        return nonNpcIndex >= 0 && nonNpcIndex < 3;
      })
      .append('text')
      .attr('x', 15)
      .attr('y', itemHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#000')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text((d) => {
        const nonNpcIndex = nonNpcData.indexOf(d);
        return nonNpcIndex + 1;
      });

    // 添加名稱文字
    rows
      .append('text')
      .attr('x', (d) => {
        const nonNpcIndex = nonNpcData.indexOf(d);
        return nonNpcIndex >= 0 && nonNpcIndex < 3 ? 35 : 10;
      })
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('fill', (d) => {
        if (d.IS_NPC === 'Y') return '#00cc00'; // NPC 名稱使用綠色

        const nonNpcIndex = nonNpcData.indexOf(d);
        if (nonNpcIndex === 0) return '#FFD700'; // 金色
        if (nonNpcIndex === 1) return '#C0C0C0'; // 銀色
        if (nonNpcIndex === 2) return '#CD7F32'; // 銅色
        return 'white';
      })
      .style('font-size', (d) => {
        if (d.IS_NPC === 'Y') return '18px'; // NPC 使用大字體

        const nonNpcIndex = nonNpcData.indexOf(d);
        return nonNpcIndex >= 0 && nonNpcIndex < 3 ? '18px' : '16px';
      })
      .style('font-weight', (d) => {
        if (d.IS_NPC === 'Y') return 'bold'; // NPC 使用粗體

        const nonNpcIndex = nonNpcData.indexOf(d);
        return nonNpcIndex >= 0 && nonNpcIndex < 3 ? 'bold' : 'normal';
      })
      .text((d) => d.CLMBR_NM);

    // 添加分數文字
    rows
      .append('text')
      .attr('x', width - 10)
      .attr('y', itemHeight / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', (d) => {
        if (d.IS_NPC === 'Y') return '#00cc00'; // NPC 分數使用綠色

        const nonNpcIndex = nonNpcData.indexOf(d);
        if (nonNpcIndex === 0) return '#ffd700'; // 金
        if (nonNpcIndex === 1) return '#c0c0c0'; // 銀
        if (nonNpcIndex === 2) return '#cd7f32'; // 銅
        return 'rgba(255, 255, 255, 0.8)'; // 其他人使用半透明白色
      })
      .style('font-size', (d) => {
        if (d.IS_NPC === 'Y') return '20px'; // NPC 使用大字體

        const nonNpcIndex = nonNpcData.indexOf(d);
        return nonNpcIndex >= 0 && nonNpcIndex < 3 ? '20px' : '16px';
      })
      .style('font-weight', (d) => {
        if (d.IS_NPC === 'Y') return 'bold'; // NPC 使用粗體

        const nonNpcIndex = nonNpcData.indexOf(d);
        return nonNpcIndex >= 0 && nonNpcIndex < 3 ? 'bold' : 'normal';
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

    // 為 NPC 項目添加動畫，只有在元素可見且動畫尚未播放時才執行
    if (isVisible && !animationPlayed) {
      // 設置延遲 0.5 秒後開始動畫
      setTimeout(() => {
        rows
          .filter((d) => d.IS_NPC === 'Y')
          .transition()
          .duration(3000) // 動畫持續時間 3 秒
          .ease(d3.easeBounce) // 彈跳效果
          .attr('transform', (d, i) => {
            // 找到 NPC 在排序後的位置
            const index = filteredData.indexOf(d);
            return `translate(0, ${index * itemHeight})`;
          })
          .on('end', function () {
            // 動畫結束後添加閃爍效果
            d3.select(this)
              .select('rect')
              .transition()
              .duration(500)
              .attr('fill', 'rgba(0, 255, 0, 0.5)')
              .transition()
              .duration(500)
              .attr('fill', 'url(#npc-gradient)')
              .transition()
              .duration(500)
              .attr('fill', 'rgba(0, 255, 0, 0.5)')
              .transition()
              .duration(500)
              .attr('fill', 'url(#npc-gradient)')
              .on('end', () => {
                // 動畫完全結束後，設置動畫已播放標誌
                setAnimationPlayed(true);
              });
          });
      }, 500); // 延遲 0.5 秒
    }

    // 添加滑鼠事件
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
      const nonNpcIndex = nonNpcData.indexOf(d);

      // 獲取所有文字元素
      const texts = row.selectAll('text');

      // 第一個文字元素通常是名稱
      texts
        .filter(function (d, textIndex) {
          // 如果是非 NPC 的前三名，第一個文字是排名數字，第二個是名稱
          return nonNpcIndex >= 0 && nonNpcIndex < 3
            ? textIndex === 1
            : textIndex === 0;
        })
        .transition()
        .duration(300)
        .attr('fill', function () {
          if (d.IS_NPC === 'Y') return '#00cc00'; // NPC 名稱使用綠色
          if (nonNpcIndex === 0) return '#FFD700'; // 金色
          if (nonNpcIndex === 1) return '#C0C0C0'; // 銀色
          if (nonNpcIndex === 2) return '#CD7F32'; // 銅色
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
          if (nonNpcIndex === 0) return '#ffd700'; // 金
          if (nonNpcIndex === 1) return '#c0c0c0'; // 銀
          if (nonNpcIndex === 2) return '#cd7f32'; // 銅
          return 'rgba(255, 255, 255, 0.8)'; // 其他人使用半透明白色
        });

      // 如果是非 NPC 的前三名，第一個文字是排名數字
      if (nonNpcIndex >= 0 && nonNpcIndex < 3) {
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
          if (nonNpcIndex === 0) return 'url(#gold-gradient)';
          if (nonNpcIndex === 1) return 'url(#silver-gradient)';
          if (nonNpcIndex === 2) return 'url(#bronze-gradient)';
          return 'rgba(0, 0, 0, 0.2)';
        });
    });
  };

  // 初始繪製
  useEffect(() => {
    drawChart();
  }, [data, isVisible, animationPlayed]); // 添加 animationPlayed 作為依賴

  // 設置 Intersection Observer 來檢測元素是否可見
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 當元素進入視口時，設置 isVisible 為 true
        if (entry.isIntersecting) {
          setIsVisible(true);
          // 可選：一旦元素可見，就不再觀察
          observer.disconnect();
        }
      },
      {
        root: null, // 使用視口作為根
        rootMargin: '0px', // 無邊距
        threshold: 0.1, // 當 10% 的元素可見時觸發
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // 監聽視窗大小變化
  useEffect(() => {
    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, isVisible, animationPlayed]); // 添加 animationPlayed 作為依賴

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default BeastScoreListChart;
