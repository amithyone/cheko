export function QrCodeRenderer({ value }: { value: string }) {
  const size = 15;
  const pixels: { r: number; c: number; fill: boolean }[] = [];
  const hash = Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isTopLeftFinder = r < 4 && c < 4;
      const isTopRightFinder = r < 4 && c >= size - 4;
      const isBottomLeftFinder = r >= size - 4 && c < 4;

      let fill = false;
      if (isTopLeftFinder) {
        fill = r === 0 || r === 3 || c === 0 || c === 3 || (r === 1.5 && c === 1.5);
      } else if (isTopRightFinder) {
        fill =
          r === 0 || r === 3 || c === size - 4 || c === size - 1 || (r === 1.5 && c === size - 2.5);
      } else if (isBottomLeftFinder) {
        fill =
          r === size - 4 || r === size - 1 || c === 0 || c === 3 || (r === size - 2.5 && c === 1.5);
      } else {
        fill = (r * c + hash) % 3 === 0 || (r + c + hash) % 2 === 0;
      }
      pixels.push({ r, c, fill });
    }
  }

  return (
    <div className="flex flex-col items-center bg-white p-2.5 rounded-xl border border-slate-150 max-w-[100px] select-none">
      <svg className="w-14 h-14" viewBox="0 0 15 15">
        <g fill="#0f172a">
          {pixels.map((p, idx) =>
            p.fill ? (
              <rect key={idx} x={p.c} y={p.r} width="1" height="1" className="shape-rendering-crispedges" />
            ) : null
          )}
        </g>
      </svg>
      <span className="text-[7.5px] font-mono font-black mt-1 text-slate-400 uppercase tracking-widest text-center">
        SCAN
      </span>
    </div>
  );
}
