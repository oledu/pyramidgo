'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const IndividualSpScoreStackBarChart = ({ data, isOffseason }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const drawChart = () => {
    if (!data || !data.length) return;

    // 過濾並重組資料，先按隊伍分組再按分數排序
    const isOffSeasonMode = isOffseason;

    const processedData = data
      .filter((d) => {
        if (isOffSeasonMode) {
          // 淡季模式：檢查是否有攀登次數
          return Object.entries(d.climbRecordCount || {})
            .some(([_, value]) => value.category === 'SP' && value.total > 0);
        } else {
          // 正常模式：檢查是否有得分
          return d.TOTAL_SCORE_SP > 0;
        }
      })
      .map((d) => {
        // 找出所有運動攀登的記錄
        const spRecords = Object.entries(d.climbRecordCount)
          .filter(([_, value]) => value.category === 'SP')
          .map(([level, value]) => ({
            grade: level,
            count: value.total,
            score: value.score,
            scoreTotal: value.scoreTotal,
          }))
          .sort((a, b) => a.score - b.score); // 改為升序排序，讓較難的等級在後面

        // 計算總計值（得分或次數）
        let totalValue;
        if (isOffSeasonMode) {
          // 淡季模式：計算總次數
          totalValue = spRecords.reduce((sum, record) => sum + record.count, 0);
        } else {
          // 正常模式：使用總得分
          totalValue = d.TOTAL_SCORE_SP;
        }

        return {
          name: d.CLMBR_NM,
          team: d.TEAM_NM || 'Unknown',
          level: d.REG_SP_LEVEL || '', // 添加上攀等級
          total: totalValue,
          scores: spRecords,
        };
      })
      .sort((a, b) => {
        if (a.team === b.team) {
          return b.total - a.total;
        }
        return a.team.localeCompare(b.team);
      });

    // 添加名字格式化函數
    const formatName = (name) => {
      // 檢查是否包含中文字符的函數
      const isChinese = (str) => /[\u4E00-\u9FFF]/.test(str);

      // 檢查每個字符並計算長度
      let visualLength = 0;
      let cutIndex = 0;

      for (let i = 0; i < name.length; i++) {
        if (isChinese(name[i])) {
          visualLength += 2; // 中文字符計為2個長度
        } else {
          visualLength += 1; // 英文和其他字符計為1個長度
        }

        if (visualLength <= 6) {
          // 允許3個中文字或6個英文字
          cutIndex = i + 1;
        } else {
          break;
        }
      }

      return name.length > cutIndex
        ? name.substring(0, cutIndex) + '...'
        : name;
    };

    // 找出最大總分來計算所需寬度
    const maxTotalScore = Math.max(...processedData.map((d) => d.total));
    const scoreTextWidth = 40;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const margin = {
      top: 20,
      right: scoreTextWidth,
      bottom: 20,
      left: 80,
    };
    const width = containerWidth - margin.left - margin.right;
    const barHeight = 30;
    const teamHeaderHeight = 40; // 隊名標題的高度

    // 計算每個隊伍的成員數量和所需高度
    let currentTeam = null;
    let totalHeight = 0;
    processedData.forEach((d) => {
      if (d.team !== currentTeam) {
        totalHeight += teamHeaderHeight; // 隊名的高度
        currentTeam = d.team;
      }
      totalHeight += barHeight + 5; // 每個成員的高度
    });

    const height = totalHeight;

    // 清除現有的SVG內容
    d3.select(svgRef.current).selectAll('*').remove();

    // 建立SVG容器
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 定義顏色比例尺
    const color = d3
      .scaleOrdinal()
      .domain([
        '5.7',
        '5.8',
        '5.9',
        '5.10a',
        '5.10b',
        '5.10c',
        '5.10d',
        '5.11a',
        '5.11b',
        '5.11c',
        '5.11d',
        '5.12a',
        '5.12b',
        '5.12c',
        '5.12d',
      ])
      .range([
        '#B71C1C', // 深紅色
        '#C62828',
        '#D32F2F',
        '#E64A19',
        '#F4511E',
        '#FB8C00',
        '#FFB300',
        '#9E9D24',
        '#7CB342',
        '#558B2F',
        '#2E7D32',
        '#00695C',
        '#0277BD',
        '#1565C0',
        '#0D47A1', // 深藍色
      ]);

    // 創建比例尺
    const xScale = d3
      .scaleLinear()
      .domain([0, Math.sqrt(maxTotalScore)])
      .range([0, width]);

    // 繪製圖表
    let yPosition = 0;
    currentTeam = null;

    processedData.forEach((d) => {
      // 如果是新的隊伍，添加隊名和分隔線
      if (d.team !== currentTeam) {
        // 添加分隔線（除了第一個隊伍）
        if (currentTeam !== null) {
          svg
            .append('line')
            .attr('x1', -margin.left)
            .attr('x2', width + margin.right)
            .attr('y1', yPosition) // 調整位置，與上面的 bar 保持距離
            .attr('y2', yPosition)
            .attr('stroke', 'rgba(255, 255, 255, 1)') // 降低透明度
            .attr('stroke-width', 1);
        }

        // 添加隊名
        svg
          .append('text')
          .attr('class', 'team-label')
          .attr('x', width / 2) // 置中
          .attr('y', yPosition + teamHeaderHeight / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle') // 文字置中
          .attr('fill', 'white')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text(d.team);

        yPosition += teamHeaderHeight;
        currentTeam = d.team;
      }

      // 計算這個人的總寬度
      const totalWidth = xScale(Math.sqrt(d.total));

      // 計算每個分數段的平方根比例
      const totalSqrt = d.scores.reduce(
        (sum, score) => sum + Math.sqrt(isOffSeasonMode ? score.count : score.scoreTotal),
        0
      );

      let xPosition = 0;
      d.scores.forEach((score, i) => {
        const valueForWidth = isOffSeasonMode ? score.count : score.scoreTotal;
        const scaledWidth =
          totalWidth * (Math.sqrt(valueForWidth) / totalSqrt);

        // 創建一個群組來包含矩形和互動區域
        const group = svg.append('g').attr('class', 'bar-group');

        const rect = group
          .append('rect')
          .attr('class', 'score-bar')
          .attr('x', xPosition)
          .attr('y', yPosition)
          .attr('width', scaledWidth)
          .attr('height', barHeight)
          .attr('fill', color(score.grade));

        // 添加等級文字
        if (scaledWidth > 8) {
          // 當寬度足夠時顯示文字
          group
            .append('text')
            .attr('class', 'count-label')
            .attr('x', xPosition + scaledWidth / 2)
            .attr('y', yPosition + barHeight / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .style('font-size', '11px')
            .text(score.grade);
        }

        // 為這個特定的長條創建 showTooltip 函數
        const showTooltipForBar = (event) => {
          const currentBar = d3
            .select(event.target.parentNode)
            .select('.score-bar')
            .style('opacity', 0.8);

          const tooltip = d3.select('#tooltip');
          const isMobile = window.innerWidth <= 768;
          const tooltipWidth = isMobile ? 200 : 180;
          const tooltipHeight = isMobile ? 120 : 120;

          let left, top;

          if (isMobile) {
            left = (window.innerWidth - tooltipWidth) / 2;
            top = window.innerHeight * 0.4 - tooltipHeight / 2;
          } else {
            left = event.clientX + 10;
            top = event.clientY - 10;

            if (left + tooltipWidth > window.innerWidth) {
              left = event.clientX - tooltipWidth - 10;
            }
            if (top + tooltipHeight > window.innerHeight) {
              top = event.clientY - tooltipHeight - 10;
            }
          }

          const tooltipContent = isOffSeasonMode ?
            `<div class="text-base md:text-sm p-1">
              <div class="text-center mb-2 border-b border-gray-600 pb-2">
                <div class="font-bold">${d.name}</div>
                <div class="text-sm text-gray-300">參賽組別：${d.level}</div>
              </div>
              <div class="mb-1">路線等級: <span class="font-bold">${score.grade}</span></div>
              <div>完成次數: <span class="font-bold">${score.count}</span></div>
            </div>` :
            `<div class="text-base md:text-sm p-1">
              <div class="text-center mb-2 border-b border-gray-600 pb-2">
                <div class="font-bold">${d.name}</div>
                <div class="text-sm text-gray-300">參賽組別：${d.level}</div>
              </div>
              <div class="mb-1">路線等級: <span class="font-bold">${score.grade}</span></div>
              <div class="mb-1">完成次數: <span class="font-bold">${score.count}</span></div>
              <div>得分: <span class="font-bold">${score.scoreTotal}</span></div>
            </div>`;

          tooltip
            .style('opacity', 1)
            .style('display', 'block')
            .style('left', `${left}px`)
            .style('top', `${top}px`)
            .html(tooltipContent);
        };

        const hideTooltip = () => {
          d3.selectAll('.score-bar').style('opacity', 1);

          d3.select('#tooltip').style('display', 'none');
        };

        // 添加互動區域
        group
          .append('rect')
          .attr('x', xPosition)
          .attr('y', yPosition)
          .attr('width', scaledWidth)
          .attr('height', barHeight)
          .attr('fill', 'transparent')
          .attr('class', 'score-bar-overlay')
          .on('mouseover', function (event) {
            if (window.innerWidth > 768) {
              showTooltipForBar(event); // 使用新的函數名
            }
          })
          .on('mouseout', function () {
            if (window.innerWidth > 768) {
              hideTooltip();
            }
          })
          .on('touchstart', function (event) {
            event.preventDefault();
            showTooltipForBar(event); // 使用新的函數名
          })
          .on('touchend', function () {
            setTimeout(hideTooltip, 2000);
          });

        xPosition += scaledWidth;
      });

      // 修改名稱標籤部分
      const nameLabel = svg
        .append('text')
        .attr('class', 'name-label')
        .attr('x', -5)
        .attr('y', yPosition + barHeight / 2)
        .attr('text-anchor', 'end')
        .attr('fill', 'white')
        .style('font-size', '14px');

      // 添加名字（限制長度）
      nameLabel
        .append('tspan')
        .attr('x', -5)
        .attr('dy', '-0.5em')
        .text(formatName(d.name));

      // 添加等級
      nameLabel.append('tspan').attr('x', -5).attr('dy', '1.2em').text(d.level);

      // 調整總分文字的位置
      svg
        .append('text')
        .attr('class', 'score-label')
        .attr('x', width + 5)
        .attr('y', yPosition + barHeight / 2)
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .style('font-size', '14px')
        .text(isOffSeasonMode ? d.total : Math.round(d.total));

      yPosition += barHeight + 5;
    });
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
                   p-3"
        style={{
          pointerEvents: 'none',
          zIndex: 1000,
          minWidth: window.innerWidth <= 768 ? '250px' : '180px',
        }}
      />
    </div>
  );
};

export default IndividualSpScoreStackBarChart;
