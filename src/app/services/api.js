export const fetchData = async () => {
  try {
    const response = await fetch(
      // 'https://us-central1-pyramidgo-1923c.cloudfunctions.net/getData'
      ' https://asia-east1-pyramidgo-1923c.cloudfunctions.net/getDataTw'
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
