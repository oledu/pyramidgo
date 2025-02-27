'use client';
import { useState } from 'react';
import { useAllData } from '../hooks/useData';
import ClimbingTable from './ClimbingTable';
import { calculateScores } from '../utils/calculateScores';
import { calculatePompom } from '../utils/calculatePompom';
import { calculatePompomTeam } from '../utils/calculatePompomTeam';
import TeamPompomBubbleChart from './TeamPompomBubbleChart';
import PompomListChart from './PompomListChart';
import BeastScoreListChart from './BeastScoreListChart';
import IndividualSpScoreStackBarChart from './IndividualSpScoreStackBarChart';
import IndividualBldScoreStackBarChart from './IndividualBldScoreStackBarChart';

const DataCharts = () => {
  const { data, loading, error } = useAllData();
  const [activeTab, setActiveTab] = useState('overview');

  console.log('data', data);

  let scores = calculateScores(data);
  console.log('scores', scores);

  let pompom = calculatePompom(scores);
  console.log('pompom', pompom);

  let pompomTeam = calculatePompomTeam(pompom);
  console.log('pompomTeam', pompomTeam);

  // let teamPompom = pompom.

  const tabs = [
    { id: 'overview', name: '總覽' },
    { id: 'individualSp', name: '運攀' },
    { id: 'individualBld', name: '抱石' },
    { id: 'beast', name: '獸性' },
    { id: 'pompom', name: '個人龐龐' },
    { id: 'teamPompom', name: '團隊龐龐' },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full">
      <div className="border-b border-gray-200 bg-black/50">
        <nav className="-mb-px flex space-x-2 overflow-x-auto justify-start px-2 md:space-x-4 md:justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm
                md:py-4 md:px-3
                ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4 h-[calc(100vh-12rem)]">
        {activeTab === 'overview' && (
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
                      className="p-2"
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
                      className="p-2"
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
                      className="p-2"
                    >
                      <h2 className="text-white text-center text-xl font-bold mb-4">
                        野獸模式分數
                      </h2>
                      <BeastScoreListChart data={scores} />
                    </div>
                    <div
                      style={{
                        minHeight: '200px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderRadius: '8px',
                      }}
                      className="p-2"
                    >
                      <h2 className="text-white text-center text-xl font-bold mb-4">
                        個人運動攀登分數
                      </h2>
                      <IndividualSpScoreStackBarChart data={scores} />
                    </div>
                    <div
                      style={{
                        minHeight: '200px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderRadius: '8px',
                      }}
                      className="p-2"
                    >
                      <h2 className="text-white text-center text-xl font-bold mb-4">
                        個人抱石分數
                      </h2>
                      <IndividualBldScoreStackBarChart data={scores} />
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
        )}
        {activeTab === 'individualSp' && (
          <IndividualSpScoreStackBarChart data={scores} />
        )}
        {activeTab === 'individualBld' && (
          <IndividualBldScoreStackBarChart data={scores} />
        )}
        {activeTab === 'beast' && <BeastScoreListChart data={scores} />}
        {activeTab === 'pompom' && <PompomListChart data={pompom} />}
        {activeTab === 'teamPompom' && (
          <TeamPompomBubbleChart data={pompomTeam} />
        )}
      </div>
    </div>
  );
};

export default DataCharts;
