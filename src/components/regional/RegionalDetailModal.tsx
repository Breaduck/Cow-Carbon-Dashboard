import { useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Farm, Alert, LIVESTOCK_INFO } from '../../types';

interface RegionalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: string | null;
  farms: Farm[];
  alerts: Alert[];
}

export function RegionalDetailModal({
  isOpen,
  onClose,
  region,
  farms,
  alerts,
}: RegionalDetailModalProps) {
  const regionalData = useMemo(() => {
    if (!region) return null;

    const regionalFarms = farms.filter(f => f.location.sido === region);
    const regionalAlerts = alerts.filter(a => {
      const farm = farms.find(f => f.id === a.farmId);
      return farm?.location.sido === region && !a.isResolved;
    });
    const criticalAlerts = regionalAlerts.filter(
      a => a.severity === 'critical' || a.severity === 'high'
    );

    const beefCount = regionalFarms.filter(f => f.livestock.type === 'beef_cattle').length;
    const pigCount = regionalFarms.filter(f => f.livestock.type === 'pig').length;
    const dairyCount = regionalFarms.filter(f => f.livestock.type === 'dairy_cattle').length;

    return {
      regionalFarms,
      regionalAlerts,
      criticalAlerts,
      beefCount,
      pigCount,
      dairyCount,
    };
  }, [region, farms, alerts]);

  if (!regionalData || !region) return null;

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const severityLabels = {
    critical: '긴급',
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={region} size="xl">
      <div className="space-y-6">
        {/* 지역 요약 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">농장 현황</h3>
          <div className="grid grid-cols-4 gap-4">
            {/* 전체 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">전체</div>
              <div className="text-2xl font-bold text-gray-900">
                {regionalData.regionalFarms.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">개 농장</div>
            </div>

            {/* 한우 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: LIVESTOCK_INFO.beef_cattle.color }}
                />
                <div className="text-sm text-gray-600">한우</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {regionalData.beefCount}
              </div>
              <div className="text-xs text-gray-500 mt-1">개 농장</div>
            </div>

            {/* 돼지 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: LIVESTOCK_INFO.pig.color }}
                />
                <div className="text-sm text-gray-600">돼지</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {regionalData.pigCount}
              </div>
              <div className="text-xs text-gray-500 mt-1">개 농장</div>
            </div>

            {/* 젖소 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: LIVESTOCK_INFO.dairy_cattle.color }}
                />
                <div className="text-sm text-gray-600">젖소</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {regionalData.dairyCount}
              </div>
              <div className="text-xs text-gray-500 mt-1">개 농장</div>
            </div>
          </div>
        </div>

        {/* 긴급 조치 필요 */}
        {regionalData.criticalAlerts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              긴급 조치 필요
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {regionalData.criticalAlerts.map((alert) => {
                const farm = farms.find(f => f.id === alert.farmId);
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${severityColors[alert.severity]}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{farm?.name}</div>
                        <div className="text-sm mt-1">{alert.message}</div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-white/50">
                        {severityLabels[alert.severity]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 미해결 알림 목록 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            미해결 알림 ({regionalData.regionalAlerts.length})
          </h3>
          {regionalData.regionalAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              미해결 알림이 없습니다
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {regionalData.regionalAlerts.map((alert) => {
                const farm = farms.find(f => f.id === alert.farmId);
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${severityColors[alert.severity]}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{farm?.name}</div>
                        <div className="text-sm mt-1">{alert.message}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(alert.timestamp).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-white/50">
                        {severityLabels[alert.severity]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
