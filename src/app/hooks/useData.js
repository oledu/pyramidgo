import { useState, useEffect } from 'react';
import {
  fetchSheetData,
  fetchParticipants,
  fetchScoringSp,
  fetchScoringBld,
  fetchClimbRecords,
  fetchData,
} from '../services/api';

export const useAllData = () => {
  const [data, setData] = useState({
    sheetData: [],
    data: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // const [participants, sheet, scoringSp, scoringBld, climbRecords, data] =
        const [sheet, data] = await Promise.all([
          fetchSheetData(),
          fetchData(),
        ]);

        setData({
          sheetData: sheet,
          data: data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    };

    fetchAll();
  }, []);

  return data;
};
