import { Farm, LivestockType } from '../../types';
import { getSensorsByFarmId } from '../../data';
import { Card } from '../common';

interface FloorPlanViewProps {
  farm: Farm;
}

// 축종별 농장 레이아웃 정의 (한국 축사 표준설계 기준)
// 한우: 병렬형 우사 배치, 우사 1칸 4.8m×9.6m 기준
// 젖소: 착유실-대기장-우사 동선 고려
// 돼지: 종돈사→분만사→자돈사→육성사→비육사→분뇨처리장 순
const FARM_LAYOUTS: Record<LivestockType, {
  title: string;
  buildings: Array<{
    id: string;       // 센서 배치용 식별자
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    color: string;
    isSensorZone: boolean;  // 센서 설치 구역 여부
  }>;
}> = {
  beef_cattle: {
    title: '한우 농장',
    buildings: [
      // 우사 병렬 배치 (4.8m×9.6m 비율 반영, 간격 확보)
      { id: 'barn1', x: 40, y: 40, width: 140, height: 90, label: '우사 1동', color: '#fef3c7', isSensorZone: true },
      { id: 'barn2', x: 220, y: 40, width: 140, height: 90, label: '우사 2동', color: '#fef3c7', isSensorZone: true },
      // 부속시설
      { id: 'feed', x: 40, y: 160, width: 90, height: 55, label: '조사료창고', color: '#dbeafe', isSensorZone: false },
      { id: 'manure', x: 160, y: 160, width: 100, height: 55, label: '분뇨처리장', color: '#dcfce7', isSensorZone: true },
      { id: 'office', x: 290, y: 160, width: 70, height: 55, label: '관리실', color: '#e5e7eb', isSensorZone: false },
    ],
  },
  dairy_cattle: {
    title: '젖소 농장',
    buildings: [
      // 착유 동선: 대기장 → 착유실 → 우사
      { id: 'waiting', x: 40, y: 45, width: 60, height: 50, label: '대기장', color: '#e0e7ff', isSensorZone: false },
      { id: 'milking', x: 110, y: 45, width: 80, height: 50, label: '착유실', color: '#fce7f3', isSensorZone: true },
      { id: 'barn', x: 210, y: 30, width: 150, height: 80, label: '착유우사', color: '#fef3c7', isSensorZone: true },
      // 하단 시설
      { id: 'feed', x: 40, y: 130, width: 90, height: 60, label: '사료창고', color: '#dbeafe', isSensorZone: false },
      { id: 'manure', x: 160, y: 130, width: 120, height: 60, label: '분뇨처리장', color: '#dcfce7', isSensorZone: true },
      { id: 'office', x: 300, y: 130, width: 75, height: 60, label: '관리실', color: '#e5e7eb', isSensorZone: false },
    ],
  },
  pig: {
    title: '돼지 농장',
    buildings: [
      // 상단: 번식돈사 (바람 상류)
      { id: 'farrowing', x: 30, y: 30, width: 100, height: 55, label: '분만사', color: '#fce7f3', isSensorZone: true },
      { id: 'nursery', x: 150, y: 30, width: 90, height: 55, label: '자돈사', color: '#fef9c4', isSensorZone: true },
      { id: 'grower', x: 260, y: 30, width: 90, height: 55, label: '육성사', color: '#fed7aa', isSensorZone: true },
      // 하단: 비육돈사 (바람 하류)
      { id: 'finisher1', x: 30, y: 110, width: 150, height: 70, label: '비육사 1동', color: '#ffedd5', isSensorZone: true },
      { id: 'finisher2', x: 200, y: 110, width: 150, height: 70, label: '비육사 2동', color: '#ffedd5', isSensorZone: true },
      // 최하단: 부속시설
      { id: 'feed', x: 30, y: 205, width: 70, height: 40, label: '사료빈', color: '#dbeafe', isSensorZone: false },
      { id: 'shipping', x: 120, y: 205, width: 80, height: 40, label: '출하대', color: '#e5e7eb', isSensorZone: false },
      { id: 'manure', x: 220, y: 205, width: 130, height: 40, label: '분뇨처리장', color: '#dcfce7', isSensorZone: true },
    ],
  },
};

export function FloorPlanView({ farm }: FloorPlanViewProps) {
  const sensors = getSensorsByFarmId(farm.id);
  const layout = FARM_LAYOUTS[farm.livestock.type];

  // 내부/외부 센서 분류
  const indoorSensors = sensors.filter(s => !s.location.zone.includes('외부'));
  const outdoorSensors = sensors.filter(s => s.location.zone.includes('외부'));

  // 소 개체 위치 계산 (한우, 젖소 우사만)
  const getCattlePositions = (building: typeof layout.buildings[0]) => {
    if (!building.label.includes('우사')) return [];

    const positions: Array<{ x: number; y: number }> = [];
    const cattlePerZone = farm.size === 'large' ? 3 : 2;
    const rowHeight = building.height * 0.4;
    const zoneWidth = building.width / 3;
    const spacing = zoneWidth / (cattlePerZone + 1);

    // 위 줄 + 아래 줄
    [0.25, 0.75].forEach(rowRatio => {
      // 3개 구역
      for (let zone = 0; zone < 3; zone++) {
        // 구역당 소 배치
        for (let i = 0; i < cattlePerZone; i++) {
          positions.push({
            x: building.x + zone * zoneWidth + spacing * (i + 1),
            y: building.y + building.height * rowRatio
          });
        }
      }
    });

    return positions;
  };

  return (
    <Card title={`센서 배치도 - ${layout.title}`} padding="lg">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl overflow-hidden border border-gray-200">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
          {/* 외곽 표시 (농장 경계) */}
          <rect x="10" y="10" width="380" height="280" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8,4" rx="4"/>

          {/* 농장 도로 표시 */}
          <rect x="10" y="280" width="380" height="10" fill="#9ca3af" opacity="0.3"/>

          {/* 축종별 건물 배치 */}
          {layout.buildings.map((building, idx) => (
            <g key={idx}>
              {/* 건물 */}
              <rect
                x={building.x}
                y={building.y}
                width={building.width}
                height={building.height}
                fill={building.color}
                stroke="#9ca3af"
                strokeWidth="2"
                rx="4"
              />

              {/* 우사 내부 구역선 (한우/젖소) */}
              {building.label.includes('우사') && (farm.livestock.type === 'beef_cattle' || farm.livestock.type === 'dairy_cattle') && (
                <>
                  {/* 가운데 통로 (가로선 2개) */}
                  <line x1={building.x} y1={building.y + building.height * 0.45} x2={building.x + building.width} y2={building.y + building.height * 0.45} stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="3,2" />
                  <line x1={building.x} y1={building.y + building.height * 0.55} x2={building.x + building.width} y2={building.y + building.height * 0.55} stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="3,2" />

                  {/* 세로 구역선 2개 */}
                  <line x1={building.x + building.width / 3} y1={building.y} x2={building.x + building.width / 3} y2={building.y + building.height * 0.45} stroke="#d1d5db" strokeWidth="1" strokeDasharray="3,2" />
                  <line x1={building.x + building.width * 2 / 3} y1={building.y} x2={building.x + building.width * 2 / 3} y2={building.y + building.height * 0.45} stroke="#d1d5db" strokeWidth="1" strokeDasharray="3,2" />
                  <line x1={building.x + building.width / 3} y1={building.y + building.height * 0.55} x2={building.x + building.width / 3} y2={building.y + building.height} stroke="#d1d5db" strokeWidth="1" strokeDasharray="3,2" />
                  <line x1={building.x + building.width * 2 / 3} y1={building.y + building.height * 0.55} x2={building.x + building.width * 2 / 3} y2={building.y + building.height} stroke="#d1d5db" strokeWidth="1" strokeDasharray="3,2" />

                  {/* 소 개체 */}
                  {getCattlePositions(building).map((pos, i) => (
                    <g key={i}>
                      {/* 소 (갈색 세로 타원) */}
                      <ellipse cx={pos.x} cy={pos.y} rx="2.5" ry="4" fill="#8B4513" stroke="#654321" strokeWidth="0.5" />
                      {/* 캡슐 센서 (초록 점) */}
                      <circle cx={pos.x} cy={pos.y} r="0.8" fill="#10b981" />
                    </g>
                  ))}
                </>
              )}

              {/* 건물 라벨 */}
              <text
                x={building.x + building.width / 2}
                y={building.y + building.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="#374151"
                fontWeight="600"
              >
                {building.label}
              </text>
            </g>
          ))}

        </svg>

        {/* 내부 센서 위치 */}
        {indoorSensors.map((sensor) => {
          const x = sensor.location.x;
          const y = sensor.location.y;

          return (
            <div
              key={sensor.id}
              className="absolute group"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* 내부 센서 마커 (녹색) */}
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse ring-4 ring-white shadow-lg" />

              {/* 툴팁 */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  내부 센서 · {sensor.location.zone}
                </div>
              </div>
            </div>
          );
        })}

        {/* 외부 기준선 센서 위치 */}
        {outdoorSensors.map((sensor) => {
          const x = sensor.location.x;
          const y = sensor.location.y;

          return (
            <div
              key={sensor.id}
              className="absolute group"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* 외부 센서 마커 (파란색) */}
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse ring-4 ring-white shadow-lg" />

              {/* 툴팁 */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-blue-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  {sensor.location.zone}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">고정 센서 {indoorSensors.length}개</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">외부 기준선 {outdoorSensors.length}개</span>
          </div>
          {(farm.livestock.type === 'beef_cattle' || farm.livestock.type === 'dairy_cattle') && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-700" />
              <span className="text-gray-600">개체 캡슐 센서 {layout.buildings.filter(b => b.label.includes('우사')).length * (farm.size === 'large' ? 18 : 12)}개</span>
            </div>
          )}
        </div>
        <span className="text-gray-500">총 {sensors.length + (farm.livestock.type === 'beef_cattle' || farm.livestock.type === 'dairy_cattle' ? layout.buildings.filter(b => b.label.includes('우사')).length * (farm.size === 'large' ? 18 : 12) : 0)}개 센서</span>
      </div>
    </Card>
  );
}
