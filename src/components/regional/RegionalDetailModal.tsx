import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Farm, Alert, LIVESTOCK_INFO } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '../../store/useStore';

interface RegionalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: string | null;
  farms: Farm[];
  alerts: Alert[];
}

// 농가 상태 분류 함수
function classifyFarmStatus(farm: Farm, alerts: Alert[]): 'critical' | 'warning' | 'good' {
  const farmAlerts = alerts.filter(a => a.farmId === farm.id && !a.isResolved);
  const hasCritical = farmAlerts.some(a => a.severity === 'critical');
  const hasHigh = farmAlerts.some(a => a.severity === 'high');

  if (hasCritical || farmAlerts.length >= 3) return 'critical';
  if (hasHigh || farmAlerts.length >= 1) return 'warning';
  return 'good';
}

// 주요 문제 분석
function analyzeMainIssues(regionalFarms: Farm[], alerts: Alert[]): Array<{category: string; count: number; farms: string[]}> {
  const issueMap: Record<string, {count: number; farms: Set<string>}> = {
    '배출량 초과': { count: 0, farms: new Set() },
    '센서 오류': { count: 0, farms: new Set() },
    '분뇨 처리': { count: 0, farms: new Set() },
    '전력 과다': { count: 0, farms: new Set() },
  };

  alerts.forEach(alert => {
    if (alert.isResolved) return;
    const farm = regionalFarms.find(f => f.id === alert.farmId);
    if (!farm) return;

    if (alert.type === 'emission_exceeded') {
      issueMap['배출량 초과'].count++;
      issueMap['배출량 초과'].farms.add(farm.name);
    } else if (alert.type === 'sensor_error') {
      issueMap['센서 오류'].count++;
      issueMap['센서 오류'].farms.add(farm.name);
    } else if (alert.message.includes('분뇨')) {
      issueMap['분뇨 처리'].count++;
      issueMap['분뇨 처리'].farms.add(farm.name);
    } else if (alert.message.includes('전력')) {
      issueMap['전력 과다'].count++;
      issueMap['전력 과다'].farms.add(farm.name);
    }
  });

  return Object.entries(issueMap)
    .filter(([_, data]) => data.count > 0)
    .map(([category, data]) => ({
      category,
      count: data.count,
      farms: Array.from(data.farms),
    }))
    .sort((a, b) => b.count - a.count);
}

export function RegionalDetailModal({
  isOpen,
  onClose,
  region,
  farms,
  alerts,
}: RegionalDetailModalProps) {
  const navigate = useNavigate();
  const { selectFarm } = useStore();
  const [selectedIssue, setSelectedIssue] = useState<{category: string; farms: string[]} | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'critical' | 'warning' | 'good' | null>(null);
  const regionalData = useMemo(() => {
    if (!region) return null;

    const regionalFarms = farms.filter(f => f.location.sido === region);
    const regionalAlerts = alerts.filter(a => {
      const farm = farms.find(f => f.id === a.farmId);
      return farm?.location.sido === region && !a.isResolved;
    });

    // 농가 상태별 분류
    const criticalFarms = regionalFarms.filter(f => classifyFarmStatus(f, alerts) === 'critical');
    const warningFarms = regionalFarms.filter(f => classifyFarmStatus(f, alerts) === 'warning');
    const goodFarms = regionalFarms.filter(f => classifyFarmStatus(f, alerts) === 'good');

    // 축종별 분류
    const beefFarms = regionalFarms.filter(f => f.livestock.type === 'beef_cattle');
    const pigFarms = regionalFarms.filter(f => f.livestock.type === 'pig');
    const dairyFarms = regionalFarms.filter(f => f.livestock.type === 'dairy_cattle');

    // 평균 배출량 계산
    const avgEmissions = regionalFarms.reduce((sum, farm) => {
      const total = farm.lcaData.directEmissions.livestock +
                    farm.lcaData.directEmissions.manure +
                    farm.lcaData.indirectEmissions.electricity +
                    farm.lcaData.indirectEmissions.fuel +
                    farm.lcaData.indirectEmissions.other;
      return sum + total;
    }, 0) / regionalFarms.length;

    // 전국 평균 계산
    const nationalAvg = farms.reduce((sum, farm) => {
      const total = farm.lcaData.directEmissions.livestock +
                    farm.lcaData.directEmissions.manure +
                    farm.lcaData.indirectEmissions.electricity +
                    farm.lcaData.indirectEmissions.fuel +
                    farm.lcaData.indirectEmissions.other;
      return sum + total;
    }, 0) / farms.length;

    // 주요 문제 분석
    const mainIssues = analyzeMainIssues(regionalFarms, regionalAlerts);

    return {
      regionalFarms,
      regionalAlerts,
      criticalFarms,
      warningFarms,
      goodFarms,
      beefFarms,
      pigFarms,
      dairyFarms,
      avgEmissions,
      nationalAvg,
      mainIssues,
    };
  }, [region, farms, alerts]);

  if (!regionalData || !region) return null;

  // 상태별 파이 차트 데이터
  const statusData = [
    { name: '위기', value: regionalData.criticalFarms.length, color: '#ef4444' },
    { name: '경고', value: regionalData.warningFarms.length, color: '#f59e0b' },
    { name: '양호', value: regionalData.goodFarms.length, color: '#10b981' },
  ].filter(item => item.value > 0);

  // 축종별 파이 차트 데이터
  const livestockData = [
    { name: '한우', value: regionalData.beefFarms.length, color: LIVESTOCK_INFO.beef_cattle.color },
    { name: '돼지', value: regionalData.pigFarms.length, color: LIVESTOCK_INFO.pig.color },
    { name: '젖소', value: regionalData.dairyFarms.length, color: LIVESTOCK_INFO.dairy_cattle.color },
  ].filter(item => item.value > 0);

  const performanceVsNational = ((regionalData.nationalAvg - regionalData.avgEmissions) / regionalData.nationalAvg * 100);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${region} 종합 인사이트`} size="xl">
      <div className="space-y-6">
        {/* 전체 요약 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => setSelectedStatus(selectedStatus === 'critical' ? null : 'critical')}
            className="bg-red-50 rounded-lg p-4 border-2 border-red-200 hover:bg-red-100 transition-colors cursor-pointer text-left"
          >
            <div className="text-sm text-red-700 mb-1">위기 농가</div>
            <div className="text-3xl font-bold text-red-900">{regionalData.criticalFarms.length}</div>
            <div className="text-xs text-red-600 mt-1">
              즉시 조치 필요 {selectedStatus === 'critical' ? '▲' : '▼'}
            </div>
          </button>
          <button
            onClick={() => setSelectedStatus(selectedStatus === 'warning' ? null : 'warning')}
            className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200 hover:bg-yellow-100 transition-colors cursor-pointer text-left"
          >
            <div className="text-sm text-yellow-700 mb-1">경고 농가</div>
            <div className="text-3xl font-bold text-yellow-900">{regionalData.warningFarms.length}</div>
            <div className="text-xs text-yellow-600 mt-1">
              모니터링 필요 {selectedStatus === 'warning' ? '▲' : '▼'}
            </div>
          </button>
          <button
            onClick={() => setSelectedStatus(selectedStatus === 'good' ? null : 'good')}
            className="bg-green-50 rounded-lg p-4 border-2 border-green-200 hover:bg-green-100 transition-colors cursor-pointer text-left"
          >
            <div className="text-sm text-green-700 mb-1">양호 농가</div>
            <div className="text-3xl font-bold text-green-900">{regionalData.goodFarms.length}</div>
            <div className="text-xs text-green-600 mt-1">
              정상 운영 {selectedStatus === 'good' ? '▲' : '▼'}
            </div>
          </button>
        </div>

        {/* 농가 리스트 */}
        {selectedStatus && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              {selectedStatus === 'critical' && '위기 농가 목록'}
              {selectedStatus === 'warning' && '경고 농가 목록'}
              {selectedStatus === 'good' && '양호 농가 목록'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {(selectedStatus === 'critical' ? regionalData.criticalFarms :
                selectedStatus === 'warning' ? regionalData.warningFarms :
                regionalData.goodFarms).map((farm) => (
                <button
                  key={farm.id}
                  onClick={() => {
                    selectFarm(farm.id);
                    navigate(`/dashboard/${farm.id}`);
                    onClose();
                  }}
                  className={`p-3 rounded-lg border-2 hover:shadow-md transition-all text-left ${
                    selectedStatus === 'critical'
                      ? 'bg-white border-red-300 hover:border-red-400 hover:bg-red-50'
                      : selectedStatus === 'warning'
                      ? 'bg-white border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50'
                      : 'bg-white border-green-300 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{farm.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {LIVESTOCK_INFO[farm.livestock.type].nameKo} · {farm.certification.grade}등급
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {farm.livestock.headCount}두 사육
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* 농가 상태 분포 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">농가 상태 분포</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 축종별 분포 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">축종별 분포</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={livestockData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  dataKey="value"
                >
                  {livestockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 배출량 비교 */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-5 border border-primary-200">
          <h3 className="text-base font-semibold text-primary-900 mb-3">지역 vs 전국 평균 배출량</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-primary-700 mb-1">지역 평균</div>
              <div className="text-2xl font-bold text-primary-900">
                {regionalData.avgEmissions.toFixed(0).toLocaleString()}
                <span className="text-sm ml-1">kg CO₂eq/월</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-700 mb-1">전국 평균 대비</div>
              <div className={`text-2xl font-bold ${performanceVsNational > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {performanceVsNational > 0 ? '▼' : '▲'} {Math.abs(performanceVsNational).toFixed(1)}%
                <span className="text-sm ml-1">{performanceVsNational > 0 ? '우수' : '미흡'}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-primary-200">
            <div className="text-xs text-primary-700">전국 평균: {regionalData.nationalAvg.toFixed(0).toLocaleString()} kg CO₂eq/월</div>
          </div>
        </div>

        {/* 주요 문제 분석 */}
        {regionalData.mainIssues.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              주요 문제 분석
            </h3>
            <div className="space-y-3">
              {regionalData.mainIssues.map((issue, idx) => (
                <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-orange-900">{issue.category}</div>
                    <div className="text-sm font-bold text-orange-700">{issue.count}건</div>
                  </div>
                  <div className="text-sm text-orange-800">
                    <button
                      onClick={() => setSelectedIssue(selectedIssue?.category === issue.category ? null : issue)}
                      className="hover:underline cursor-pointer font-medium"
                    >
                      영향 농가: {issue.farms.slice(0, 3).join(', ')}
                      {issue.farms.length > 3 && ` 외 ${issue.farms.length - 3}개`}
                      <span className="ml-1">{selectedIssue?.category === issue.category ? '▲' : '▼'}</span>
                    </button>
                  </div>

                  {/* 농가 목록 확장 */}
                  {selectedIssue?.category === issue.category && (
                    <div className="mt-3 pt-3 border-t border-orange-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {issue.farms.map((farmName) => {
                          const farm = regionalData.regionalFarms.find(f => f.name === farmName);
                          if (!farm) return null;

                          return (
                            <button
                              key={farm.id}
                              onClick={() => {
                                selectFarm(farm.id);
                                navigate(`/dashboard/${farm.id}`);
                                onClose();
                              }}
                              className="px-3 py-2 bg-white border border-orange-300 rounded-lg hover:bg-orange-100 hover:border-orange-400 transition-colors text-left text-sm"
                            >
                              <div className="font-medium text-orange-900">{farmName}</div>
                              <div className="text-xs text-orange-700 mt-0.5">
                                {LIVESTOCK_INFO[farm.livestock.type].nameKo} · {farm.certification.grade}등급
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 개선 권장사항 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-2">지역 개선 권장사항</p>
              <ul className="text-sm text-blue-800 space-y-1">
                {regionalData.criticalFarms.length > 0 && (
                  <li>• 위기 농가 {regionalData.criticalFarms.length}곳 긴급 점검 필요</li>
                )}
                {performanceVsNational < 0 && (
                  <li>• 전국 평균 대비 배출량 {Math.abs(performanceVsNational).toFixed(1)}% 높음 - 감축 방안 모색 필요</li>
                )}
                {regionalData.mainIssues[0] && (
                  <li>• {regionalData.mainIssues[0].category} 문제가 가장 많음 - 집중 개선 필요</li>
                )}
                {regionalData.regionalAlerts.length > regionalData.regionalFarms.length * 0.5 && (
                  <li>• 농가당 평균 {(regionalData.regionalAlerts.length / regionalData.regionalFarms.length).toFixed(1)}건의 알림 - 지역 단위 대책 마련 권장</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
