'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// 動態導入 Background3D 組件，並禁用 SSR
const Background3D = dynamic(() => import('../components/Background3D'), {
  ssr: false,
});

export default function CheckIn() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkinRecords, setCheckinRecords] = useState([]);
  const router = useRouter();

  // 更新時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 載入已存在的打卡記錄
  useEffect(() => {
    const stored = localStorage.getItem('checkinRecords');
    if (stored) {
      setCheckinRecords(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('請輸入姓名');
      return;
    }

    setIsSubmitting(true);
    
    // 模擬提交過程
    setTimeout(() => {
      const newRecord = {
        id: Date.now(),
        name: name.trim(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('zh-TW'),
        time: new Date().toLocaleTimeString('zh-TW')
      };

      const updatedRecords = [newRecord, ...checkinRecords].slice(0, 10); // 只保留最新10筆
      setCheckinRecords(updatedRecords);
      localStorage.setItem('checkinRecords', JSON.stringify(updatedRecords));
      
      setName('');
      setIsSubmitting(false);
      
      // 顯示成功訊息
      alert(`${newRecord.name} 打卡成功！\n時間：${newRecord.date} ${newRecord.time}`);
    }, 1000);
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Background3D />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* 返回首頁按鈕 */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          ← 返回首頁
        </button>

        {/* 標題 */}
        <div className="title text-center mb-8">
          <h1 className="text-4xl md:text-6xl mb-4">打卡系統</h1>
          <h2 className="text-xl md:text-2xl">PYRAMID GO CHECKIN</h2>
        </div>

        {/* 當前時間顯示 */}
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-purple-500/30 shadow-2xl">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-mono text-cyan-400 mb-2">
              {currentTime.toLocaleDateString('zh-TW')}
            </div>
            <div className="text-3xl md:text-4xl font-mono text-green-400">
              {currentTime.toLocaleTimeString('zh-TW')}
            </div>
          </div>
        </div>

        {/* 打卡表單 */}
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-purple-500/30 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-white text-lg font-semibold mb-3">
                請輸入姓名
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800/80 border border-purple-500/50 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300"
                placeholder="輸入您的姓名"
                disabled={isSubmitting}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-95'
              } text-white shadow-lg hover:shadow-xl`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  打卡中...
                </span>
              ) : (
                '打卡'
              )}
            </button>
          </form>
        </div>

        {/* 最近打卡記錄 */}
        {checkinRecords.length > 0 && (
          <div className="mt-8 w-full max-w-2xl">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">最近打卡記錄</h3>
            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {checkinRecords.map((record) => (
                  <div 
                    key={record.id}
                    className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
                  >
                    <span className="text-white font-medium">{record.name}</span>
                    <div className="text-right">
                      <div className="text-cyan-400 text-sm">{record.date}</div>
                      <div className="text-green-400 text-sm">{record.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}