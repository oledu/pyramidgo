export const fetchParticipants = async () => {
  try {
    const response = await fetch(
      'https://us-central1-pyramidgo-1923c.cloudfunctions.net/getParticipants'
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const fetchScoringSp = async () => {
  try {
    const response = await fetch(
      'https://us-central1-pyramidgo-1923c.cloudfunctions.net/getScoringSp'
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const fetchScoringBld = async () => {
  try {
    const response = await fetch(
      'https://us-central1-pyramidgo-1923c.cloudfunctions.net/getScoringBld'
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const fetchClimbRecords = async () => {
  try {
    const response = await fetch(
      'https://us-central1-pyramidgo-1923c.cloudfunctions.net/getClimbRecords'
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const fetchData = async () => {
  try {
    const response = await fetch(
      'https://us-central1-pyramidgo-1923c.cloudfunctions.net/getData'
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
