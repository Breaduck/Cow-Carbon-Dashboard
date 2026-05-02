import { Farm } from '../../types';
import { getSensorsByFarmId } from '../../data';
import { Card } from '../common';

interface FloorPlanViewProps {
  farm: Farm;
}

export function FloorPlanView({ farm }: FloorPlanViewProps) {
  const sensors = getSensorsByFarmId(farm.id);

  return (
    <Card title="센서 배치도" padding="lg">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200">
        {/* 축사 구조 */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
          {/* 메인 건물 */}
          <rect x="50" y="50" width="300" height="200" fill="white" stroke="#d1d5db" strokeWidth="2" rx="8"/>

          {/* 구역 구분선 */}
          <line x1="200" y1="50" x2="200" y2="250" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4"/>
          <line x1="50" y1="150" x2="350" y2="150" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4"/>

          {/* 구역 라벨 */}
          <text x="125" y="100" textAnchor="middle" fontSize="12" fill="#6b7280" fontWeight="500">A동</text>
          <text x="275" y="100" textAnchor="middle" fontSize="12" fill="#6b7280" fontWeight="500">B동</text>
          <text x="125" y="200" textAnchor="middle" fontSize="12" fill="#6b7280" fontWeight="500">분뇨처리장</text>
          <text x="275" y="200" textAnchor="middle" fontSize="12" fill="#6b7280" fontWeight="500">사료창고</text>
        </svg>

        {/* 센서 위치 */}
        {sensors.map((sensor, idx) => {
          const x = sensor.location.x;
          const y = sensor.location.y;
          const isActive = sensor.status === 'active';

          return (
            <div
              key={sensor.id}
              className="absolute group"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* 센서 마커 */}
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} ring-4 ring-white shadow-lg`} />

              {/* 툴팁 */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  센서 {idx + 1} · {sensor.location.zone}
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
            <span className="text-gray-600">정상 {sensors.filter(s => s.status === 'active').length}개</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-gray-600">비활성 {sensors.filter(s => s.status !== 'active').length}개</span>
          </div>
        </div>
        <span className="text-gray-500">총 {sensors.length}개 센서</span>
      </div>
    </Card>
  );
}
