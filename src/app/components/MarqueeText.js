const MarqueeText = ({ data }) => {
  const { marquee = [] } = data || {};

  // 從 marquee 數組中獲取所有 TEXT 欄位並組合，加入分隔符
  const marqueeTexts = marquee.map((item, index) => {
    if (!item.TEXT) return null; // 跳過 TEXT 為空的項目
    return (
      <span key={item.TEXT}>
      <span className="mx-2">{item.TEXT}</span>
      <span className="text-yellow-300">{'▲'}</span>
    </span>
    );
  });

  // 如果沒有文字則不顯示整個元素
  if (marqueeTexts.length === 0) return null;

  return (
    <div className="w-full h-8 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 relative flex items-center">
      <div
        className="absolute whitespace-nowrap animate-marquee md:animate-marquee-desktop text-sm font-medium text-white"
        style={{ left: '100%' }}
      >
        <span className="text-yellow-300">{'▲'}</span>
        {marqueeTexts}
      </div>
    </div>
  );
};

export default MarqueeText;
