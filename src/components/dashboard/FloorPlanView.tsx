import { Farm } from '../../types';
import { getSensorsByFarmId } from '../../data';
import { Card } from '../common';

interface FloorPlanViewProps {
  farm: Farm;
}

export function FloorPlanView({ farm }: FloorPlanViewProps) {
  const sensors = getSensorsByFarmId(farm.id);

  // 내부/외부 센서 분류
  const indoorSensors = sensors.filter(s => !s.location.zone.includes('외부'));
  const outdoorSensors = sensors.filter(s => s.location.zone.includes('외부'));

  return (
    <Card title="센서 배치도 (내부 + 외부 기준선)" padding="lg">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl overflow-hidden border border-gray-200">
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

          {/* 외곽 표시 (농장 경계) */}
          <rect x="10" y="10" width="380" height="280" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" rx="4"/>
        </svg>

        {/* 내부 센서 위치 */}
        {indoorSensors.map((sensor, idx) => {
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
        {outdoorSensors.map((sensor, idx) => {
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
            <span className="text-gray-600">내부 {indoorSensors.length}개</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">외부 기준선 {outdoorSensors.length}개</span>
          </div>
        </div>
        <span className="text-gray-500">총 {sensors.length}개 센서</span>
      </div>
    </Card>
  );
}
