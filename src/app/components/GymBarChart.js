'use client'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const GymBarChart = ({ data }) => {
  const chartRef = useRef()

  const drawChart = () => {
    if (!data.length || !chartRef.current) return

    // 清除現有的圖表
    d3.select(chartRef.current).selectAll("*").remove()

    // 計算每個岩館的總攀爬次數
    const gymStats = {}
    data.forEach(item => {
      if (!gymStats[item.gym]) {
        gymStats[item.gym] = 0
      }
      gymStats[item.gym] += Number(item.number)
    })

    // 轉換數據格式
    const chartData = Object.entries(gymStats)
      .map(([gym, count]) => ({ gym, count }))
      .sort((a, b) => b.count - a.count)

    // 設定圖表尺寸
    const margin = { top: 40, right: 20, bottom: 60, left: 40 }
    const width = chartRef.current.clientWidth - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    // 創建 SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 添加標題
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', 'white')
      .text('各岩館攀爬次數統計')

    // 設定比例尺
    const x = d3.scaleBand()
      .range([0, width])
      .domain(chartData.map(d => d.gym))
      .padding(0.2)

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(chartData, d => d.count)])

    // 添加 X 軸
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('fill', 'white')

    // 添加 Y 軸
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('fill', 'white')

    // 添加長條
    svg.selectAll('rect')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.gym))
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', '#69b3a2')
      .style('opacity', 0.8)

    // 添加數值標籤
    svg.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.gym) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.count)
      .style('fill', 'white')
  }

  useEffect(() => {
    // 初始繪製
    drawChart()

    // 添加 resize 事件監聽器
    const handleResize = () => {
      drawChart()
    }

    window.addEventListener('resize', handleResize)

    // 清理函數
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [data])

  return (
    <div
      ref={chartRef}
      style={{
        minHeight: '300px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '8px',
      }}
      // className="p-4"
    />
  )
}

export default GymBarChart