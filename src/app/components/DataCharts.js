'use client';
import { useAllData } from '../hooks/useData';
import ClimbingTable from './ClimbingTable';
import GymBarChart from './GymBarChart';
import { calculateScores, calculatePompom } from '../utils/calculateScores';

const DataCharts = () => {
  const { data, error } = useAllData();

  console.log('data', data);

  let scores = calculateScores(data);
  console.log('scores', scores);

  let pompom = calculatePompom(scores);
  console.log('pompom', pompom);

  // let teamPompom = pompom.

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex justify-center w-full mt-10 mb-10">
      <div
        style={{
          minWidth: '350px',
          width: '90%',
          maxWidth: '1600px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
        }}
        className="flex flex-col p-5"
      >
        <div className="text-white text-center mb-4">
          <span className="title">資料日期：2025/02/17</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 [1400px]:grid-cols-3 gap-4">
          {[2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              style={{
                minHeight: '300px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '8px',
              }}
              // className="p-4"
            >
              圖表 {item}
            </div>
          ))}
          <div
            style={{
              minHeight: '300px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              position: 'relative',
            }}
          >
            <img
              src="/belay.link_qr.png"
              alt="belay link QR"
              className="absolute inset-0 w-full h-full object-contain p-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCharts;
