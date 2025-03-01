import { useState, useEffect } from 'react';
import { fetchData } from '../services/api';

export const useAllData = () => {
  const [data, setData] = useState({
    data: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const result = await fetchData();

        setData({
          data: result,
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
