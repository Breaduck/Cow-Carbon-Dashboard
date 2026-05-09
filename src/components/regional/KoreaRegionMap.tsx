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
        {/* 한국 윤곽선 (간단한 배경) */}
        <rect x="120" y="100" width="260" height="420" rx="20" fill="#f3f4f6" opacity="0.3" />

        {/* 권역별 원형 마커 */}
        {regionalStats.map((stat) => {
          const coords = REGION_SVG_COORDS[stat.region];
          if (!coords) return null;

          const shortName = getShortRegionName(stat.region);
          const radius = Math.max(20, Math.min(40, 15 + stat.total * 0.5));

          return (
            <g
              key={stat.region}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => onRegionClick(stat.region)}
            >
              {/* 원형 마커 */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={radius}
                fill="#4338ca"
                opacity="0.9"
                className="transition-all hover:fill-indigo-700"
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
