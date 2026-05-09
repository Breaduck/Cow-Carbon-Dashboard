import { Farm, GAS_INFO, GasType } from '../../types';
import { getSensorsByFarmId } from '../../data';
import { Card } from '../common';

interface GasGaugesProps {
  farm: Farm;
}

export function GasGauges({ farm }: GasGaugesProps) {
  const sensors = getSensorsByFarmId(farm.id);
  const activeSensors = sensors.filter(s => s.status === 'active');

  const currentValues: Record<GasType, number> = {
    CH4: 0,
    CO2: 0,
    N2O: 0,
    NH3: 0,
  };

  if (activeSensors.length > 0) {
    activeSensors.forEach(sensor => {
      currentValues.CH4 += sensor.lastReading.values.CH4;
      currentValues.CO2 += sensor.lastReading.values.CO2;
      currentValues.N2O += sensor.lastReading.values.N2O;
      currentValues.NH3 += sensor.lastReading.values.NH3;
    });

    currentValues.CH4 /= activeSensors.length;
    currentValues.CO2 /= activeSensors.length;
    currentValues.N2O /= activeSensors.length;
    currentValues.NH3 /= activeSensors.length;
  }

  // 경고/주의 상태 확인 및 인사이트 생성
  const insights: Array<{ gas: string; level: string; action: string; severity: 'warning' | 'caution' }> = [];

  (Object.keys(GAS_INFO) as GasType[]).forEach(gasType => {
    const value = currentValues[gasType];
    const maxValue = gasType === 'CO2' ? 800 : gasType === 'N2O' ? 1 : gasType === 'CH4' ? 100 : 50;
    const percentage = Math.min((value / maxValue) * 100, 100);

    if (percentage >= 80) {
      const gasName = GAS_INFO[gasType].nameKo;
      let action = '';

      if (gasType === 'CH4') {
        action = '즉시 환기 시스템 가동 및 창문 개방하세요';
      } else if (gasType === 'CO2') {
        action = '즉시 환기를 실시하고 가축 스트레스 확인하세요';
      } else if (gasType === 'N2O') {
        action = '분뇨 처리 및 환기 시스템을 즉시 점검하세요';
      } else if (gasType === 'NH3') {
        action = '암모니아 농도 위험 - 즉시 환기하고 분뇨를 제거하세요';
      }

      insights.push({ gas: gasName, level: '경고', action, severity: 'warning' });
    } else if (percentage >= 60) {
      const gasName = GAS_INFO[gasType].nameKo;
      let action = '';

      if (gasType === 'CH4') {
        action = '환기 시스템 가동 시간을 늘리세요';
      } else if (gasType === 'CO2') {
        action = '환기 시스템을 점검하고 가동 시간을 조정하세요';
      } else if (gasType === 'N2O') {
        action = '분뇨 처리 주기를 확인하고 단축하세요';
      } else if (gasType === 'NH3') {
        action = '분뇨 제거 주기를 단축하고 환기를 강화하세요';
      }

      insights.push({ gas: gasName, level: '주의', action, severity: 'caution' });
    }
  });

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">실시간 가스 농도</h3>
        <span className="text-xs text-gray-500">최근 1시간 평균</span>
      </div>
      {/* 인사이트 알림 */}
      {insights.length > 0 && (
        <div className="mb-4 space-y-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border-2 transition-all ${
                insight.severity === 'warning'
                  ? 'bg-red-50 border-red-500 shadow-lg shadow-red-200'
                  : 'bg-yellow-50 border-yellow-500 shadow-lg shadow-yellow-200'
              }`}
              style={{
                animation: insight.severity === 'warning' ? 'pulse-slow 3s ease-in-out infinite' : 'pulse-slow 4s ease-in-out infinite'
              }}
            >
              <div className="flex items-start gap-2">
                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${insight.severity === 'warning' ? 'text-red-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className={`text-sm font-bold mb-1 ${insight.severity === 'warning' ? 'text-red-900' : 'text-yellow-900'}`}>
                    {insight.gas} {insight.level}
                  </p>
                  <p className={`text-sm font-semibold ${insight.severity === 'warning' ? 'text-red-800' : 'text-yellow-800'}`}>
                    ⚠️ {insight.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(GAS_INFO) as GasType[]).map(gasType => {
          const info = GAS_INFO[gasType];
          const value = currentValues[gasType];
          const maxValue = gasType === 'CO2' ? 800 : gasType === 'N2O' ? 1 : gasType === 'CH4' ? 100 : 50;
          const percentage = Math.min((value / maxValue) * 100, 100);

          const status = percentage < 60 ? 'normal' : percentage < 80 ? 'caution' : 'warning';
          const borderColor = status === 'warning' ? 'border-red-500' : status === 'caution' ? 'border-yellow-500' : 'border-gray-200';
          const shouldBlink = status === 'warning' || status === 'caution';

          return (
            <div
              key={gasType}
              className={`p-4 rounded-xl bg-gray-50 border-2 ${borderColor} transition-all`}
              style={shouldBlink ? {
                animation: status === 'warning' ? 'pulse-slow 3s ease-in-out infinite' : 'pulse-slow 4s ease-in-out infinite',
                boxShadow: status === 'warning' ? '0 0 20px rgba(239, 68, 68, 0.3)' : '0 0 20px rgba(234, 179, 8, 0.3)'
              } : {}}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">{info.nameKo}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">
                    {value.toFixed(gasType === 'N2O' ? 2 : 1)}
                    <span className="text-xs font-normal text-gray-500 ml-1">{info.unit}</span>
                  </p>
                </div>
              </div>

              <div className="relative h-3 bg-gray-200 rounded-full overflow-visible">
                {/* 현재 수치 바 */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: info.color,
                  }}
                />

                {/* 경고선 (80% - 경고 시작점) */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-600"
                  style={{ left: '80%' }}
                  title="경고 기준선 (80%)"
                />
              </div>

              <div className="mt-2">
                <p className="text-xs font-medium" style={{
                  color: percentage < 60 ? '#16a34a' : percentage < 80 ? '#ca8a04' : '#dc2626'
                }}>
                  {percentage < 60 ? '✓ 정상' : percentage < 80 ? '⚠ 주의' : '🚨 경고'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
