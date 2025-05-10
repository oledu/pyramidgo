'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Rules 組件 - 顯示遊戲規則
 * @param {Object} data - 數據物件
 * @param {string} period - 當前時期
 */
const Rules = ({ data, period }) => {
  if (period < '202504T') {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-gray-900 border border-red-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-red-500 mb-6 text-center">
          How to Play
        </h1>

        {/* 選角色 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              1
            </span>
            選你的角色
          </h2>

          <div className="flex justify-center mb-6">
            <img
              src="/beast.png"
              alt="beast"
              className="w-full h-auto rounded-lg"
            />
          </div>

          <p className="text-gray-300 mb-4">
            選擇符合實力的角色。每個角色對應三種路線等級：
          </p>

          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border border-red-600 rounded-lg text-center">
                <h3 className="text-xl font-bold text-red-400">V+1</h3>
                <p className="text-gray-300">夢想突破等級</p>
              </div>
              <div className="p-3 border border-yellow-600 rounded-lg text-center">
                <h3 className="text-xl font-bold text-yellow-400">V</h3>
                <p className="text-gray-300">挑戰等級</p>
              </div>
              <div className="p-3 border border-green-600 rounded-lg text-center">
                <h3 className="text-xl font-bold text-green-400">V-1</h3>
                <p className="text-gray-300">穩定爬</p>
              </div>
            </div>
          </div>

          <p className="text-gray-300 italic">*抱石/上攀角色分開選擇</p>
        </section>

        {/* 爬！ */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              2
            </span>
            爬！
          </h2>
          <p className="text-gray-300">
            單人收線or組隊掃線均可！紀錄當天爬的路線，上傳到Line群組，系統自動計算積分。
          </p>
        </section>

        {/* 抽獎！ */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              3
            </span>
            抽獎！
          </h2>
          <p className="text-gray-300">
            累積積分，抽紅點獎金，得攀岩好物！還能與其他玩家聯手攻打岩城，掉落更多獎勵---包括月票！
          </p>
        </section>

        {/* 副本任務 */}
        <section className="border-t border-red-800 pt-8 mt-8">
          <h2 className="text-2xl font-bold text-red-500 mb-6 text-center">
            副本任務：岩城奪寶
          </h2>

          {/* 選一個主攻岩館 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="text-red-500 mr-2">🎯</span>
              選一個主攻岩館
            </h3>
            <p className="text-gray-300 mb-3">
              有館方贊助的岩館是「岩城」，其他岩館則是「探索岩場」，可自由選擇任一個岩館作為你的主攻目標！
            </p>
            <p className="text-yellow-400">
              ⚡ 有館方贊助的岩館，掉寶包括月票！
            </p>
          </div>

          {/* 攻城 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center">
              <span className="text-red-500 mr-2">⚔️</span>
              攻城
            </h3>
            <p className="text-gray-300 mb-3">
              爬掉路線，即造成岩城損血！你在該館獲得的積分 ＝ 岩城扣血
            </p>
            <p className="text-yellow-400">
              ⚡ 在主攻岩館收線，每日攻擊加成 100滴血！
            </p>
          </div>

          {/* 掉寶分紅 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-3">掉寶分紅</h3>
            <p className="text-gray-300 mb-3">
              當你選的城被攻破（=岩城血條歸零），即依個人攻城貢獻比例掉寶！
            </p>
            <p className="text-yellow-400">
              ⚡
              當你所選的主攻岩館被打爆，可以分紅最多！其他冒險者一樣可協助攻城、獲得小獎勵。
            </p>
          </div>

          {/* 注釋 */}
          <div className="mt-8 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm italic">
              *我們預設開放所有場館供玩家自由選擇挑戰，因此PyramidGO上每座「探索岩場」，都是玩家親自選擇要去挑戰的目標！若貴館希望暫時不列入「探索岩場」，請聯絡我們。若希望贊助月票或獎品升級成「岩城」，也歡迎私訊我們
              IG @belay.link
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Rules;
