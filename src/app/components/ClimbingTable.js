'use client'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const ClimbingTable = ({ data }) => {
  const tableRef = useRef()

  useEffect(() => {
    if (data.length > 0 && tableRef.current) {
      // 清除現有的表格
      d3.select(tableRef.current).selectAll("*").remove()

      // 創建表格
      const table = d3.select(tableRef.current)
        .append('table')
        .style('width', '100%')
        .style('border-collapse', 'collapse')
        .style('color', 'white')

      // 添加表頭
      const headers = ['日期', '姓名', '難度', '次數', '岩館']
      table.append('thead')
        .append('tr')
        .selectAll('th')
        .data(headers)
        .enter()
        .append('th')
        .text(d => d)
        .style('padding', '8px')
        .style('border-bottom', '2px solid white')
        .style('text-align', 'left')

      // 添加表格內容
      const tbody = table.append('tbody')
      const rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr')
        .style('border-bottom', '1px solid rgba(255, 255, 255, 0.2)')

      rows.selectAll('td')
        .data(d => [d.date, d.name, d.level, d.number, d.gym])
        .enter()
        .append('td')
        .text(d => d)
        .style('padding', '8px')
    }
  }, [data])

  return (
    <div
      ref={tableRef}
      style={{
        minHeight: '300px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        overflow: 'auto'
      }}
      className="p-4"
    />
  )
}

export default ClimbingTable 