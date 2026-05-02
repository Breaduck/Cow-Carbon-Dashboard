import { useState } from 'react';
import { getAlertsByFarmId, reductionGuides } from '../../data';
import { Card, Modal, Button } from '../common';
import { GAS_INFO } from '../../types';

interface AlertListProps {
  farmId: string;
}

export function AlertList({ farmId }: AlertListProps) {
  const alerts = getAlertsByFarmId(farmId).filter(a => !a.isResolved);
  const [showGuideModal, setShowGuideModal] = useState(false);

  return (
    <>
      <Card title="알림 및 권장사항" padding="none">
        <div className="divide-y divide-gray-100">
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">현재 알림이 없습니다</p>
            </div>
          ) : (
            alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.details}</p>
                      </div>
                      {alert.gasType && (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium text-white flex-shrink-0"
                          style={{ backgroundColor: GAS_INFO[alert.gasType].color }}
                        >
                          {GAS_INFO[alert.gasType].nameKo}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alert.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => setShowGuideModal(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            배출량 절감 가이드 보기
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        title="배출량 절감 가이드"
        size="lg"
      >
        <div className="space-y-4">
          {reductionGuides.map(guide => (
            <div key={guide.id} className="p-4 rounded-xl bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-base font-semibold text-gray-900">{guide.title}</h4>
                <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                  -{guide.expectedReduction}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{guide.description}</p>
              <ul className="space-y-1">
                {guide.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
