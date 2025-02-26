'use client';
import { useAllData } from '../hooks/useData';
import ClimbingTable from './ClimbingTable';
import GymBarChart from './GymBarChart';
import { calculateScores } from '../utils/calculateScores';
import { calculatePompom } from '../utils/calculatePompom';
import { calculatePompomTeam } from '../utils/calculatePompomTeam';
import TeamPompomBubbleChart from './TeamPompomBubbleChart';
import PompomListChart from './PompomListChart';
import BeastScoreListChart from './BeastScoreListChart';

const DataCharts = () => {
  const { data, loading, error } = useAllData();

  console.log('data', data);

  let scores = calculateScores(data);
  console.log('scores', scores);

  let pompom = calculatePompom(scores);
  console.log('pompom', pompom);

  let pompomTeam = calculatePompomTeam(pompom);
  console.log('pompomTeam', pompomTeam);

  // let teamPompom = pompom.

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full space-y-8">
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
          <div className="grid grid-cols-1 3xl:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '8px',
                }}
                className="p-4"
              >
                <h2 className="text-white text-center text-xl font-bold mb-4">
                  團隊彩球
                </h2>
                <TeamPompomBubbleChart data={pompomTeam} />
              </div>
              <div
                style={{
                  height: '200px',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '8px',
                }}
              >
                圖表 2
              </div>
            </div>

            <div className="space-y-4">
              <div
                style={{
                  minHeight: '200px',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '8px',
                }}
                className="p-4"
              >
                <h2 className="text-white text-center text-xl font-bold mb-4">
                  個人彩球
                </h2>
                <PompomListChart data={pompom} />
              </div>
              <div
                style={{
                  minHeight: '200px',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '8px',
                }}
                className="p-4"
              >
                <h2 className="text-white text-center text-xl font-bold mb-4">
                  野獸模式分數
                </h2>
                <BeastScoreListChart data={scores} />
              </div>
              <div
                style={{
                  height: '100px',
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
      </div>
    </div>
  );
};

export default DataCharts;
