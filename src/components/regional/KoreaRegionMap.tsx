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

// 지역명 축약 (표준 약칭)
const getShortRegionName = (region: string) => {
  const shortNames: Record<string, string> = {
    '대구광역시': '대구',
    '울산광역시': '울산',
    '세종특별자치시': '세종',
    '강원특별자치도': '강원',
    '경기도': '경기',
    '충청북도': '충북',
    '충청남도': '충남',
    '경상북도': '경북',
    '경상남도': '경남',
    '전라남도': '전남',
    '전북특별자치도': '전북',
    '제주특별자치도': '제주',
  };
  return shortNames[region] || region;
};

export function KoreaRegionMap({ regionalStats, onRegionClick }: KoreaRegionMapProps) {
  return (
    <div className="w-full h-full flex items-center justify-center relative bg-white">
      {/* 한국 지도 배경 이미지 */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/korea-map.png)',
          opacity: 0.12,
          filter: 'grayscale(100%) brightness(1.1)'
        }}
      />

      {/* 권역 구분선 오버레이 */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/korea-map.png)',
          opacity: 0.08,
          filter: 'grayscale(100%) brightness(1.3)',
          mixBlendMode: 'multiply'
        }}
      />

      <svg
        viewBox="0 0 500 600"
        className="w-full h-full relative z-10"
        style={{ maxHeight: '600px' }}
      >

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
              {/* 원형 마커 외곽선 */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={radius + 2}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                className="pointer-events-none"
              />

              {/* 원형 마커 */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={radius}
                fill="#4338ca"
                className="transition-all hover:fill-indigo-600"
              />

              {/* 농장 수 */}
              <text
                x={coords.x}
                y={coords.y + 5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white font-bold pointer-events-none"
                style={{ fontSize: `${Math.max(14, radius / 1.5)}px` }}
              >
                {stat.total}
              </text>

              {/* 지역명 (마커 아래) */}
              <text
                x={coords.x}
                y={coords.y + radius + 18}
                textAnchor="middle"
                className="fill-gray-700 font-semibold pointer-events-none"
                style={{ fontSize: '11px' }}
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
