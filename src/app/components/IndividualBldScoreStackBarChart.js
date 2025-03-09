'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const IndividualBldScoreStackBarChart = ({ data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const drawChart = () => {
    if (!data || !data.length) return;

    // 過濾並重組資料，先按隊伍分組再按分數排序
    const processedData = data
      .filter((d) => d.TOTAL_SCORE_BLD > 0)
      .map((d) => {
        // 找出所有抱石的記錄
        const bldRecords = Object.entries(d.climbRecordCount)
          .filter(([_, value]) => value.category === 'BLD')
          .map(([level, value]) => ({
            grade: level,
            count: value.total,
            score: value.score,
            scoreTotal: value.scoreTotal,
          }))
          .sort((a, b) => a.score - b.score); // 改為升序排序，讓較難的等級在後面

        return {
          name: d.CLMBR_NM,
          team: d.TEAM_NM || 'Unknown',
          level: d.REG_BLD_LEVEL || '',
          total: d.TOTAL_SCORE_BLD,
          scores: bldRecords,
        };
      })
      .sort((a, b) => {
        if (a.team === b.team) {
          return b.total - a.total;
        }
        return a.team.localeCompare(b.team);
      });

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
    const teamHeaderHeight = 40;

    // 計算總高度
    let currentTeam = null;
    let totalHeight = 0;
    processedData.forEach((d) => {
      if (d.team !== currentTeam) {
        totalHeight += teamHeaderHeight;
        currentTeam = d.team;
      }
      totalHeight += barHeight + 5;
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
        'V0',
        'V1',
        'V2',
        'V3',
        'V4',
        'V5',
        'V6',
        'V7',
        'V8',
        'V9',
        'V10',
        'V11',
        'V12',
      ])
      .range([
        '#B71C1C', // 深紅色
        '#E53935', // 鮮紅色 (增加亮度)
        '#F4511E', // 橘紅色
        '#FF9800', // 亮橘色
        '#FFC107', // 黃色
        '#AFB42B', // 黃綠色 (降低飽和度)
        '#388E3C', // 深綠色
        '#009688', // 青色
        '#1976D2', // 深藍色
        '#0288D1', // 亮藍色
        '#7B1FA2', // 紫色
        '#6A1B9A', // 深紫色
        '#4E342E', // 棕色
      ]);

    // 創建比例尺，使用平方根值
    const xScale = d3
      .scaleLinear()
      .domain([0, Math.sqrt(maxTotalScore)]) // 使用平方根作為domain
      .range([0, width]);

    // 繪製圖表
    let yPosition = 0;
    currentTeam = null;

    processedData.forEach((d) => {
      if (d.team !== currentTeam) {
        if (currentTeam !== null) {
          svg
            .append('line')
            .attr('x1', -margin.left)
            .attr('x2', width + margin.right)
            .attr('y1', yPosition)
            .attr('y2', yPosition)
            .attr('stroke', 'rgba(255, 255, 255, 1)')
            .attr('stroke-width', 1);
        }

        svg
          .append('text')
          .attr('class', 'team-label')
          .attr('x', width / 2)
          .attr('y', yPosition + teamHeaderHeight / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
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
        (sum, score) => sum + Math.sqrt(score.scoreTotal),
        0
      );

      let xPosition = 0;
      d.scores.forEach((score, i) => {
        // 使用平方根比例計算寬度
        const scaledWidth =
          totalWidth * (Math.sqrt(score.scoreTotal) / totalSqrt);

        const rect = svg
          .append('rect')
          .attr('class', 'score-bar')
          .attr('x', xPosition)
          .attr('y', yPosition)
          .attr('width', scaledWidth)
          .attr('height', barHeight)
          .attr('fill', color(score.grade));

        // 進一步降低顯示閾值，讓更多文字顯示
        if (scaledWidth > 8) {
          // 降低到8px
          svg
            .append('text')
            .attr('class', 'count-label')
            .attr('x', xPosition + scaledWidth / 2)
            .attr('y', yPosition + barHeight / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .style('font-size', '11px') // 稍微縮小字體
            .text(score.grade);
        }

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

      nameLabel
        .append('tspan')
        .attr('x', -5)
        .attr('dy', '-0.5em')
        .text(formatName(d.name));

      // 添加等級
      nameLabel.append('tspan').attr('x', -5).attr('dy', '1.2em').text(d.level);

      svg
        .append('text')
        .attr('class', 'score-label')
        .attr('x', width + 5) // 位置調整到最右邊
        .attr('y', yPosition + barHeight / 2)
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .style('font-size', '14px')
        .text(Math.round(d.total));

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
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default IndividualBldScoreStackBarChart;
