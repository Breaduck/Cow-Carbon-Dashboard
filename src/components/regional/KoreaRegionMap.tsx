interface KoreaRegionMapProps {
  regionalStats: Array<{
    region: string;
    total: number;
  }>;
  onRegionClick: (region: string) => void;
}

// 권역 좌표 (SVG 좌표계)
const REGION_SVG_COORDS: Record<string, { x: number; y: number }> = {
  '제주특별자치도': { x: 200, y: 480 },
  '전라남도': { x: 150, y: 380 },
  '전북특별자치도': { x: 150, y: 320 },
  '경상남도': { x: 300, y: 370 },
  '경상북도': { x: 300, y: 260 },
  '충청남도': { x: 150, y: 260 },
  '충청북도': { x: 220, y: 230 },
  '경기도': { x: 200, y: 160 },
  '강원특별자치도': { x: 300, y: 140 },
  '세종특별자치시': { x: 180, y: 250 },
  '울산광역시': { x: 340, y: 350 },
  '대구광역시': { x: 280, y: 300 },
};

// 지역명 축약
const getShortRegionName = (region: string) => {
  return region.replace(/특별시|광역시|특별자치시|특별자치도|도$/g, '');
};

export function KoreaRegionMap({ regionalStats, onRegionClick }: KoreaRegionMapProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 500 600"
        className="w-full h-full"
        style={{ maxHeight: '600px' }}
      >
        {/* 한국 지도 윤곽선 */}
        <path
          d="M 200 80 L 240 70 L 280 90 L 320 80 L 350 100 L 360 140 L 340 180 L 350 220 L 320 260 L 330 300 L 310 340 L 290 380 L 270 420 L 240 440 L 220 460 L 180 480 L 160 500 L 140 480 L 130 440 L 140 400 L 120 360 L 130 320 L 150 280 L 140 240 L 160 200 L 180 160 L 200 120 Z"
          fill="#ffffff"
          stroke="#d1d5db"
          strokeWidth="2"
          opacity="0.9"
        />
        {/* 제주도 */}
        <ellipse cx="200" cy="480" rx="30" ry="15" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.5" opacity="0.9" />

        {/* 권역별 원형 마커 */}
        {regionalStats.map((stat) => {
          const coords = REGION_SVG_COORDS[stat.region];
          if (!coords) return null;

          const shortName = getShortRegionName(stat.region);
          const radius = Math.max(20, Math.min(40, 15 + stat.total * 0.5));

          return (
            <g
              key={stat.region}
              className="cursor-pointer"
              onClick={() => onRegionClick(stat.region)}
            >
              {/* 원형 마커 */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={radius}
                fill="#4338ca"
                opacity="0.9"
                className="transition-opacity hover:opacity-100"
              />

              {/* 농장 수 */}
              <text
                x={coords.x}
                y={coords.y - 5}
                textAnchor="middle"
                className="fill-white font-bold text-sm pointer-events-none"
                style={{ fontSize: `${Math.max(10, radius / 2)}px` }}
              >
                {stat.total}
              </text>

              {/* 지역명 */}
              <text
                x={coords.x}
                y={coords.y + 10}
                textAnchor="middle"
                className="fill-white text-xs pointer-events-none"
                style={{ fontSize: `${Math.max(8, radius / 3)}px` }}
              >
                {shortName}
              </text>

              {/* 호버 효과용 툴팁 (CSS로 처리) */}
              <title>{`${stat.region}: ${stat.total}개 농장`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
