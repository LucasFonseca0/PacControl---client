export const ArcadeBackground = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <div className="arcade-container w-full h-auto bg-gray-900 text-white flex flex-col items-center justify-center relative">
      <div className="arcade-top bg-red-600 w-full h-10 text-center text-3xl font-bold flex items-center justify-center">
        <span>ARCADE MACHINE</span>
      </div>

      <div className="arcade-body bg-black flex flex-col items-center justify-center border-4 border-yellow-500 p-8 rounded-lg mt-4 relative max-w-[800px] w-full">
        <div className="arcade-screen w-full h-auto bg-black border-4 border-gray-700 p-1 aspect-w-1 aspect-h-1 flex items-center justify-center relative overflow-hidden">
          <div className="arcade-screen-effect absolute inset-0 z-10"></div>
          <div className="w-full h-full flex items-center justify-center z-20">
            {children}
          </div>
        </div>

        <div className="arcade-buttons mt-8 flex justify-around w-full">
          <div className="button red-button bg-red-500 rounded-full w-16 h-16 border-4 border-black"></div>
          <div className="button blue-button bg-blue-500 rounded-full w-16 h-16 border-4 border-black"></div>
          <div className="button green-button bg-green-500 rounded-full w-16 h-16 border-4 border-black"></div>
        </div>
      </div>

      <div className="arcade-base bg-yellow-500 w-full h-12 mt-8"></div>
    </div>
  );
};
