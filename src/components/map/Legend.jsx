const Legend = () => {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white p-4 shadow-lg">
      <h3 className="mb-3 font-semibold">Indeks Vegetasi (NDVI)</h3>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-500"></div>
          <span>0.0 - 0.3 &nbsp;Buruk</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-yellow-400"></div>
          <span>0.3 - 0.6 &nbsp;Sedang</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-500"></div>
          <span>0.6 - 1.0 &nbsp;Baik</span>
        </div>
      </div>
    </div>
  );
};

export default Legend;
