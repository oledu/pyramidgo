export const fetchSheetData = async () => {
  try {
    const response = await fetch('https://getsheetdata-lo3qmou5ga-uc.a.run.app/')
    const jsonData = await response.json()
    
    // 過濾有效資料
    const validData = jsonData.data.filter(item => 
      item.name && 
      item.level && 
      item.number &&
      item.date
    )
    
    return validData
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
} 