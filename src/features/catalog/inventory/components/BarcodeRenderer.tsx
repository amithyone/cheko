export function BarcodeRenderer({ value }: { value: string }) {
  const CleanVal = value.replace(/[^a-zA-Z0-9-]/g, "");
  const bars: { width: number; isBlack: boolean }[] = [];
  let isBlack = true;
  for (let i = 0; i < 30; i++) {
    const seed = (CleanVal.charCodeAt(i % CleanVal.length) || 7) + i;
    const width = (seed % 3) + 1;
    bars.push({ width, isBlack });
    isBlack = !isBlack;
  }
  return (
    <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-slate-150 select-text max-w-[130px]">
      <svg className="w-full h-8" viewBox="0 0 100 40" preserveAspectRatio="none">
        <g fill="#0f172a">
          {(() => {
            let currentX = 2;
            return bars.map((bar, idx) => {
              const x = currentX;
              currentX += bar.width * 2.8;
              if (currentX > 98) return null;
              return bar.isBlack ? (
                <rect key={idx} x={x} y="0" width={bar.width * 1.8} height="40" />
              ) : null;
            });
          })()}
        </g>
      </svg>
      <span className="text-[8px] font-mono font-bold mt-1 text-slate-500 tracking-wider text-center">
        {value}
      </span>
    </div>
  );
}
