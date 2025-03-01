const LogoImg = () => {
  return (
    <div className="w-full flex justify-center mt-5">
      <img
        src="/logo.png" /* 請將圖片放在 public 資料夾中 */
        alt="PYRAMID GO"
        style={{
          width: '100%',
          maxWidth: '600px',
          minWidth: '300px',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default LogoImg;
