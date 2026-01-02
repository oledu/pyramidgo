'use client';
import { useState, useEffect } from 'react';
import { calculateScores } from '../utils/calculateScores';
import { calculateScoresNoLimitsGymDate } from '../utils/calculateScoresNoLimitsGymDate';
import { calculatePompom } from '../utils/calculatePompom';
import { calculatePompomTeam } from '../utils/calculatePompomTeam';
import TeamPompomBubbleChart from './TeamPompomBubbleChart';
import PompomListChart from './PompomListChart';
import BeastScoreListChart from './BeastScoreListChart';
import IndividualSpScoreStackBarChart from './IndividualSpScoreStackBarChart';
import IndividualBldScoreStackBarChart from './IndividualBldScoreStackBarChart';
import ClimbingDotChart from './ClimbingDotChart';
import FragmentListChart from './FragmentListChart';
import Castle from './Castle';
import Castle2 from './Castle2';
import Castle3 from './Castle3';
import Castle4 from './Castle4';
// import Lottie from 'lottie-react';
import dynamic from 'next/dynamic';
import climbingAnimation from '../animations/climbing.json';
import PeriodSelector from './PeriodSelector';

const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false, // 禁用服務器端渲染
});

const DataCharts = ({ data, loading, error, onPeriodChange }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPeriod, setCurrentPeriod] = useState('202512T');

  // console.log('data', data);

  const handlePeriodChange = (period) => {
    setCurrentPeriod(period);
    onPeriodChange(period);
  };

  useEffect(() => {
    if (currentPeriod < '202506T') {
      setActiveTab('overview');
    }
  }, [currentPeriod]);

  let { settings = [] } = data || {};


  let scores = calculateScores(data);
  // console.log('scores', scores);

  let scoresNoLimitsGymDate = calculateScoresNoLimitsGymDate(data);
  // console.log('scoresNoLimitsGymDate', scoresNoLimitsGymDate);

  let pompom = calculatePompom(scores);
  // console.log('pompom', pompom);

  let pompomTeam = calculatePompomTeam(pompom);
  // console.log('pompomTeam', pompomTeam);

  // let teamPompom = pompom.

  const tabs = [
    { id: 'overview', name: '總覽' },
    { id: 'castle', name: '岩城奪寶' },
    { id: 'rules', name: '遊戲規則' },
  ];

  const isFragment =
    settings?.find((s) => s.KEY === 'IS_FRAGMENT')?.VALUE === 'Y';

  const isOffseason =
    settings?.find((s) => s.KEY === 'IS_OFFSEASON')?.VALUE === 'Y';

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
                ${activeTab === tab.id
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

      <div className="flex justify-center px-4 pt-4">
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      <div className="mt-4 h-[calc(100vh-12rem)]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-96 h-96 p-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full">
              <div className="w-full h-full bg-black rounded-full">
                <Lottie
                  animationData={climbingAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="w-full space-y-8">
                <div className="flex justify-center w-full mb-10">
                  <div
                    style={{
                      minWidth: '350px',
                      width: '95%',
                      maxWidth: '1600px',
                      backgroundColor: 'rgba(137, 8, 8, 0.2)',
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
                          {currentPeriod >= '202510T' && (
                            <Castle4
                              data={data}
                              period={currentPeriod}
                              scoresNoLimitsGymDate={scoresNoLimitsGymDate}
                            />
                          )}
                          {currentPeriod >= '202508T' && currentPeriod < '202510T' && (
                            <Castle3
                              data={data}
                              period={currentPeriod}
                              scoresNoLimitsGymDate={scoresNoLimitsGymDate}
                            />
                          )}
                          {currentPeriod >= '202505T' && currentPeriod < '202508T' && (
                            <Castle2
                              data={data}
                              period={currentPeriod}
                              scoresNoLimitsGymDate={scoresNoLimitsGymDate}
                            />
                          )}
                          {currentPeriod === '202504T' && (
                            <Castle
                              data={data}
                              period={currentPeriod}
                              scoresNoLimitsGymDate={scoresNoLimitsGymDate}
                            />
                          )}
                        </div>
                        {isOffseason ? (
                          <></>
                        ) : (
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
                        )}
                        {isOffseason ? (<></>) : (<div
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
                        </div>)}

                        {isOffseason ? (<></>) : (
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
                            <BeastScoreListChart
                              data={scores}
                              settings={settings}
                            />
                          </div>
                        )}

                        <div
                          style={{
                            minHeight: '200px',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderRadius: '8px',
                          }}
                          className="p-2"
                        >
                          <h2 className="text-white text-center text-xl font-bold mb-4">
                            個人抱石{isOffseason ? '次數' : '積分'}
                          </h2>
                          <IndividualBldScoreStackBarChart data={scores} isOffseason={isOffseason} />
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
                            個人上攀{isOffseason ? '次數' : '積分'}
                          </h2>
                          <IndividualSpScoreStackBarChart data={scores} isOffseason={isOffseason} />
                        </div>
                        <div
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderRadius: '8px',
                          }}
                          className="p-2"
                        >
                          <h2 className="text-white text-center text-xl font-bold mb-4">
                            攀爬日記
                          </h2>
                          <ClimbingDotChart
                            data={scores}
                            period={currentPeriod}
                          />
                        </div>
                        {isFragment && !isOffseason ? (
                          <div
                            style={{
                              minHeight: '200px',
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              borderRadius: '8px',
                            }}
                            className="p-2"
                          >
                            <h2 className="text-white text-center text-xl font-bold mb-4">
                              徽章碎片
                            </h2>
                            <FragmentListChart data={data?.fragments} />
                          </div>
                        ) : (
                          <></>
                        )}
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

            {activeTab === 'castle' && (
              <div>
                {currentPeriod >= '202505T' && (
                  <Castle2
                    data={data}
                    period={currentPeriod}
                    scoresNoLimitsGymDate={scoresNoLimitsGymDate}
                  />
                )}
                {currentPeriod === '202504T' && (
                  <Castle
                    data={data}
                    period={currentPeriod}
                    scoresNoLimitsGymDate={scoresNoLimitsGymDate}
                  />
                )}
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="flex justify-center w-full">
                <div
                  style={{
                    minWidth: '350px',
                    width: '95%',
                    maxWidth: '800px',
                    backgroundColor: 'rgba(137, 8, 8, 0.2)',
                    borderRadius: '10px',
                  }}
                  className="p-8 md:p-12 text-center"
                >
                  <h2 className="text-white text-2xl font-bold mb-6">
                    遊戲規則
                  </h2>
                  <p className="text-gray-300 mb-8 text-lg">
                    點擊下方按鈕查看完整遊戲規則
                  </p>
                  <a
                    href="https://belaylink.my.canva.site/#welcome"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-red-700 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    查看遊戲規則 →
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DataCharts;
