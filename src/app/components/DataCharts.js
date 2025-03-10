'use client';
import { useState } from 'react';
import { calculateScores } from '../utils/calculateScores';
import { calculatePompom } from '../utils/calculatePompom';
import { calculatePompomTeam } from '../utils/calculatePompomTeam';
import TeamPompomBubbleChart from './TeamPompomBubbleChart';
import PompomListChart from './PompomListChart';
import BeastScoreListChart from './BeastScoreListChart';
import IndividualSpScoreStackBarChart from './IndividualSpScoreStackBarChart';
import IndividualBldScoreStackBarChart from './IndividualBldScoreStackBarChart';
import ClimbingDotChart from './ClimbingDotChart';

const DataCharts = ({ data, loading, error }) => {
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
    { id: 'teamPompom', name: '團隊彩球' },
    { id: 'pompom', name: '個人彩球' },
    { id: 'beast', name: '抱石猛獸' },
    { id: 'individualBld', name: '抱石' },
    { id: 'individualSp', name: '上攀' },
    { id: 'climbing', name: '攀爬日記' },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data available</div>;

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
                  width: '95%',
                  maxWidth: '1600px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                }}
                className="flex flex-col p-1 md:p-5"
              >
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
                      <TeamPompomBubbleChart
                        data={pompomTeam}
                        individualData={pompom}
                      />
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
                        抱石猛獸爭霸積分英雄榜
                      </h2>
                      <BeastScoreListChart data={scores} />
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
                        個人抱石積分
                      </h2>
                      <IndividualBldScoreStackBarChart data={scores} />
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
                        個人上攀積分
                      </h2>
                      <IndividualSpScoreStackBarChart data={scores} />
                    </div>
                    <div
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderRadius: '8px',
                      }}
                      className="p-2"
                    >
                      <h2 className="text-white text-center text-xl font-bold mb-4">
                        攀爬日記(3/2~3/15)
                      </h2>
                      <ClimbingDotChart data={scores} />
                    </div>
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
                        style={{
                          minWidth: '300px',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'individualSp' && (
          <div
            style={{
              minHeight: '300px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              position: 'relative',
            }}
          >
            <IndividualSpScoreStackBarChart data={scores} />{' '}
          </div>
        )}
        {activeTab === 'individualBld' && (
          <div
            style={{
              minHeight: '300px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              position: 'relative',
            }}
          >
            <IndividualBldScoreStackBarChart data={scores} />
          </div>
        )}
        {activeTab === 'beast' && (
          <div
            style={{
              minHeight: '300px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              position: 'relative',
            }}
          >
            <BeastScoreListChart data={scores} />
          </div>
        )}
        {activeTab === 'pompom' && (
          <div
            style={{
              minHeight: '300px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              position: 'relative',
            }}
          >
            <PompomListChart data={pompom} />
          </div>
        )}
        {activeTab === 'teamPompom' && (
          <div
            style={{
              minHeight: '300px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              position: 'relative',
            }}
          >
            <TeamPompomBubbleChart data={pompomTeam} individualData={pompom} />
          </div>
        )}
        {activeTab === 'climbing' && (
          <div
            style={{
              minHeight: '300px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              position: 'relative',
            }}
          >
            <ClimbingDotChart data={scores} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCharts;
