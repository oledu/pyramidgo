export const fetchData = async (period) => {
  try {
    const response = await fetch(
      `https://asia-east1-pyramidgo-1923c.cloudfunctions.net/getDataTw?period=${period}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
