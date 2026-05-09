import { useState, useMemo } from 'react';
import { Farm, ComparisonPeriod, LCAData, LCAComparison, TrendDirection, ImprovementSuggestion } from '../../types';
import { Card, Modal } from '../common';

interface LCABreakdownProps {
  farm: Farm;
}

// 비교 계산 함수
function calculateComparison(current: number, previous: number): Omit<LCAComparison, 'period'> {
  const changeAmount = current - previous;
  const changePercentage = previous === 0 ? 0 : (changeAmount / previous) * 100;
  const trend: TrendDirection =
    Math.abs(changePercentage) < 0.5 ? 'stable' :
    changePercentage > 0 ? 'up' : 'down';

  return {
    previousValue: previous,
    currentValue: current,
    changeAmount,
    changePercentage,
    trend,
  };
}

// 개선 제안 생성 (규칙 기반)
function generateImprovementSuggestions(
  current: LCAData,
  previous: LCAData,
  period: ComparisonPeriod
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  const periodLabel = period === 'daily' ? '어제' : period === 'weekly' ? '지난주' : '전월';

  // 전력 사용 증가 체크
  const elecIncrease = current.indirectEmissions.electricity - previous.indirectEmissions.electricity;
  const elecUsageIncrease = current.monthlyInputs.electricityUsage - previous.monthlyInputs.electricityUsage;
  const elecUsagePercent = previous.monthlyInputs.electricityUsage === 0 ? 0 : (elecUsageIncrease / previous.monthlyInputs.electricityUsage) * 100;

  if (elecIncrease > 0) {
    const increasePercent = ((elecIncrease / previous.indirectEmissions.electricity) * 100).toFixed(1);
    const actionDeadline = period === 'daily' ? '오늘 안에' : period === 'weekly' ? '이번 주 안에' : '이번 달 안에';

    suggestions.push({
      category: 'electricity',
      severity: elecIncrease > previous.indirectEmissions.electricity * 0.1 ? 'high' : 'medium',
      title: `${periodLabel} 대비 전력 소모량 ${Math.abs(elecUsagePercent).toFixed(0)}% 증가 - ${actionDeadline} 조치 필요`,
      description: `전력 배출량 ${increasePercent}% 증가 (${elecIncrease.toLocaleString()}kg CO₂eq ↑)\n전력 사용량: ${elecUsageIncrease.toLocaleString()}kWh 증가`,
      expectedReduction: elecIncrease * 0.3,
      actions: [
        `${actionDeadline} 사용하지 않는 조명·환기팬 전원 차단`,
        `${actionDeadline} 환기 시스템 가동 시간 점검 및 조정`,
        '이번 달 내 LED 조명 교체 계획 수립 (30% 절감)',
        '태양광 설치 견적 문의 (월 전력비 50% 절감)',
      ],
      relatedTechnology: '신재생에너지 사용',
    });
  }

  // 연료 사용 증가 체크
  const fuelIncrease = current.indirectEmissions.fuel - previous.indirectEmissions.fuel;
  const dieselIncrease = current.monthlyInputs.dieselUsage - previous.monthlyInputs.dieselUsage;
  const lpgIncrease = current.monthlyInputs.lpgUsage - previous.monthlyInputs.lpgUsage;
  const totalFuelIncrease = dieselIncrease + lpgIncrease;
  const fuelUsagePercent = (previous.monthlyInputs.dieselUsage + previous.monthlyInputs.lpgUsage) === 0 ? 0 :
    (totalFuelIncrease / (previous.monthlyInputs.dieselUsage + previous.monthlyInputs.lpgUsage)) * 100;

  if (fuelIncrease > 0) {
    const increasePercent = ((fuelIncrease / previous.indirectEmissions.fuel) * 100).toFixed(1);
    const actionDeadline = period === 'daily' ? '오늘 안에' : period === 'weekly' ? '이번 주 안에' : '이번 달 안에';

    suggestions.push({
      category: 'fuel',
      severity: fuelIncrease > previous.indirectEmissions.fuel * 0.1 ? 'high' : 'low',
      title: `${periodLabel} 대비 연료 소모량 ${Math.abs(fuelUsagePercent).toFixed(0)}% 증가 - ${actionDeadline} 점검 필요`,
      description: `연료 배출량 ${increasePercent}% 증가 (${fuelIncrease.toLocaleString()}kg CO₂eq ↑)\n경유/LPG 사용량: ${Math.round(totalFuelIncrease).toLocaleString()}L/kg 증가`,
      expectedReduction: fuelIncrease * 0.2,
      actions: [
        `${actionDeadline} 난방기 설정온도 1-2도 낮추기`,
        `${actionDeadline} 장비 공회전 중단 (연료 10-15% 절감)`,
        '이번 주 내 축사 단열 상태 점검 및 보수',
        '이번 달 내 난방 장비 정기점검 실시',
      ],
    });
  }

  // 분뇨 배출 증가 체크
  const manureIncrease = current.directEmissions.manure - previous.directEmissions.manure;
  if (manureIncrease > 0) {
    const increasePercent = ((manureIncrease / previous.directEmissions.manure) * 100).toFixed(1);
    const actionDeadline = period === 'daily' ? '오늘 안에' : period === 'weekly' ? '이번 주 안에' : '이번 달 안에';
    const processingStatus = manureIncrease > previous.directEmissions.manure * 0.15 ? '피트 내 슬러리 미처리 확인' : '분뇨 처리 주기 점검 필요';

    suggestions.push({
      category: 'manure',
      severity: manureIncrease > previous.directEmissions.manure * 0.1 ? 'high' : 'medium',
      title: `${processingStatus} - ${actionDeadline} 슬러리 처리 실시`,
      description: `분뇨 배출량 ${increasePercent}% 증가 (${manureIncrease.toLocaleString()}kg CO₂eq ↑)\n원인: 슬러리 처리 지연 또는 미흡`,
      expectedReduction: manureIncrease * 0.25,
      actions: [
        `${actionDeadline} 피트 내 슬러리 즉시 처리 (월 1회 이상 필수)`,
        `${actionDeadline} 분뇨 처리 일지 작성 및 기록 (인증 6점)`,
        '이번 주 내 액비순환시스템 도입 검토 (인증 6점)',
        '이번 달 내 바이오가스 포집 시설 설치 상담 (30% 감축, 인증 5점)',
      ],
      relatedTechnology: '분뇨의 바이오 에너지화',
    });
  }

  // 가축 배출 증가 체크
  const livestockIncrease = current.directEmissions.livestock - previous.directEmissions.livestock;
  if (livestockIncrease > 0) {
    const increasePercent = ((livestockIncrease / previous.directEmissions.livestock) * 100).toFixed(1);
    const actionDeadline = period === 'daily' ? '오늘 안에' : period === 'weekly' ? '이번 주 안에' : '이번 달 안에';
    const headCountStatus = livestockIncrease > previous.directEmissions.livestock * 0.05 ? '사육 두수 증가 또는 장내발효 증가' : '장내발효 미세 증가';

    suggestions.push({
      category: 'livestock',
      severity: livestockIncrease > previous.directEmissions.livestock * 0.05 ? 'medium' : 'low',
      title: `${headCountStatus} - ${actionDeadline} 저메탄 첨가제 급여 검토`,
      description: `가축 배출량 ${increasePercent}% 증가 (${livestockIncrease.toLocaleString()}kg CO₂eq ↑)\n원인: 장내발효 메탄 배출 증가`,
      expectedReduction: livestockIncrease * 0.15,
      actions: [
        `${actionDeadline} 사육 두수 및 건강 상태 점검`,
        '이번 주 내 저메탄 첨가제(3-NOP, 해조류) 급여 시작 (15-30% 감축)',
        '이번 달 내 MSY 생산성 개선 계획 수립 (최대 2.8% 감축)',
        '수의사 상담으로 가축 건강 및 사료 효율 개선',
      ],
      relatedTechnology: 'MSY 생산성 향상',
    });
  }

  // 심각도 순으로 정렬
  return suggestions.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

export function LCABreakdown({ farm }: LCABreakdownProps) {
  const [period, setPeriod] = useState<ComparisonPeriod>('daily');
  const [selectedSuggestion, setSelectedSuggestion] = useState<ImprovementSuggestion | null>(null);

  // 기간별 배출량 계산 (월간 기준을 일/주/월로 나눔)
  const { directEmissions, indirectEmissions, monthlyInputs } = farm.lcaData;

  const periodMultiplier = period === 'daily' ? 1/30 : period === 'weekly' ? 7/30 : 1;

  const totalDirect = (directEmissions.livestock + directEmissions.manure) * periodMultiplier;
  const totalIndirect = (indirectEmissions.electricity + indirectEmissions.fuel + indirectEmissions.other) * periodMultiplier;
  const totalEmissions = totalDirect + totalIndirect;

  // 이전 기간 데이터 선택
  const previousData = useMemo(() => {
    switch (period) {
      case 'daily':
        return farm.lcaHistory.yesterday;
      case 'weekly':
        return farm.lcaHistory.lastWeek;
      case 'monthly':
        return farm.lcaHistory.lastMonth;
    }
  }, [period, farm.lcaHistory]);

  // 이전 기간 총 배출량 계산 (사료 제외)
  const prevTotalDirect = (previousData.directEmissions.livestock + previousData.directEmissions.manure) * periodMultiplier;
  const prevTotalIndirect = (previousData.indirectEmissions.electricity + previousData.indirectEmissions.fuel + previousData.indirectEmissions.other) * periodMultiplier;
  const prevTotalEmissions = prevTotalDirect + prevTotalIndirect;

  // 비교 계산
  const totalComparison = calculateComparison(totalEmissions, prevTotalEmissions);
  const directComparison = calculateComparison(totalDirect, prevTotalDirect);
  const indirectComparison = calculateComparison(totalIndirect, prevTotalIndirect);

  // 개선 제안 생성
  const suggestions = useMemo(() =>
    generateImprovementSuggestions(farm.lcaData, previousData, period),
    [farm.lcaData, previousData, period]
  );

  // 인증 목표 계산 (돼지 기준)
  const targetEmissionPerKg = 2.13; // kg CO2eq/kg 도체중
  const targetEmissionTotal = targetEmissionPerKg * farm.carcassWeight;
  const currentEmissionPerKg = totalEmissions / farm.carcassWeight;
  const targetAchievementRate = (targetEmissionTotal / totalEmissions) * 100;

  // 인증 점수 계산 (간단 버전)
  const reductionRate = ((2.60 - currentEmissionPerKg) / 2.60) * 100;
  const emissionScore = Math.min(70, Math.max(0, (reductionRate / 18) * 70)); // 18% 감축 시 70점

  const categories = [
    { name: '장내 발효', value: directEmissions.livestock * periodMultiplier, prev: previousData.directEmissions.livestock * periodMultiplier, color: '#FF6B6B', type: 'direct', tooltip: '가축 소화기관 메탄 발생' },
    { name: '분뇨 배출', value: directEmissions.manure * periodMultiplier, prev: previousData.directEmissions.manure * periodMultiplier, color: '#FA8072', type: 'direct' },
    { name: '전력', value: indirectEmissions.electricity * periodMultiplier, prev: previousData.indirectEmissions.electricity * periodMultiplier, color: '#95E1D3', type: 'indirect' },
    { name: '연료', value: indirectEmissions.fuel * periodMultiplier, prev: previousData.indirectEmissions.fuel * periodMultiplier, color: '#FFE66D', type: 'indirect' },
    { name: '기타 간접배출', value: indirectEmissions.other * periodMultiplier, prev: previousData.indirectEmissions.other * periodMultiplier, color: '#C7CEEA', type: 'indirect', tooltip: '비료, 약품, 수도 등' },
  ];

  const maxValue = Math.max(...categories.map(c => c.value));

  const periodLabels = {
    daily: '어제',
    weekly: '지난주',
    monthly: '전월',
  };

  const periodTitles = {
    daily: '일간',
    weekly: '주간',
    monthly: '월간',
  };

  // 트렌드 아이콘
  const TrendIcon = ({ trend, changePercentage }: { trend: TrendDirection; changePercentage: number }) => {
    const absPercent = Math.abs(changePercentage);

    // 0%일 때는 화살표 없이 표시
    if (absPercent === 0) {
      return <span className="text-green-600">0.0%</span>;
    }

    if (trend === 'stable') {
      return <span className="text-green-600">→ {absPercent.toFixed(1)}%</span>;
    }
    const isNegative = trend === 'down';
    return (
      <span className={isNegative ? 'text-green-600' : 'text-red-600'}>
        {isNegative ? '▼' : '▲'} {absPercent.toFixed(1)}%
      </span>
    );
  };

  return (
    <Card padding="lg" className="backdrop-blur-xl bg-white/80">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">탄소배출량 현황</h3>
            <p className="text-base text-gray-600">{periodTitles[period]} 배출량 추이</p>
          </div>

          {/* 비교 주기 선택 */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as ComparisonPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  period === p
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p === 'daily' ? '일간' : p === 'weekly' ? '주간' : '월간'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 총 배출량 비교 카드 */}
      <div className="mb-6 p-6 rounded-xl bg-gray-100 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-3">총 탄소배출량 ({periodTitles[period]})</p>
            <p className="text-5xl font-bold text-green-700">
              {totalEmissions.toFixed(0).toLocaleString()}
              <span className="text-2xl ml-2">kg CO₂eq</span>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">{periodLabels[period]} 대비</span>
              <span className="text-base font-semibold">
                <TrendIcon trend={totalComparison.trend} changePercentage={totalComparison.changePercentage} />
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">직접 배출</p>
              <p className="text-2xl font-bold text-gray-800">{totalDirect.toFixed(0).toLocaleString()}</p>
              <span className="text-sm">
                <TrendIcon trend={directComparison.trend} changePercentage={directComparison.changePercentage} />
              </span>
            </div>
            <div>
              <p className="text-sm text-primary-600 mb-1">간접 배출</p>
              <p className="text-2xl font-bold text-primary-800">{totalIndirect.toFixed(0).toLocaleString()}</p>
              <span className="text-sm">
                <TrendIcon trend={indirectComparison.trend} changePercentage={indirectComparison.changePercentage} />
              </span>
            </div>
          </div>
        </div>

        {/* 목표 달성도 */}
        {farm.livestock.type === 'pig' && (
          <div className="pt-3 border-t border-primary-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-primary-700">인증 목표 달성도</span>
              <span className="text-sm font-bold text-primary-900">
                {targetAchievementRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-primary-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-primary-500 to-primary-600"
                style={{ width: `${Math.min(100, targetAchievementRate)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-primary-600">
              <span>목표: {currentEmissionPerKg.toFixed(2)} / {targetEmissionPerKg} kg CO₂eq/kg</span>
              <span className={emissionScore >= 63 ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                배출량 점수: {emissionScore.toFixed(1)}/70점
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 개선 제안 (배출 증가 시에만 표시) */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            개선 제안 ({suggestions.length}개)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {suggestions.map((suggestion, idx) => {
              const severityStyles = {
                high: {
                  bg: 'bg-white',
                  border: 'border-red-200',
                  badge: 'bg-red-50 text-red-700',
                  text: 'text-gray-900',
                },
                medium: {
                  bg: 'bg-white',
                  border: 'border-orange-200',
                  badge: 'bg-orange-50 text-orange-700',
                  text: 'text-gray-900',
                },
                low: {
                  bg: 'bg-white',
                  border: 'border-gray-200',
                  badge: 'bg-gray-100 text-gray-700',
                  text: 'text-gray-900',
                },
              };

              const severityBadge = {
                high: '긴급',
                medium: '권장',
                low: '참고',
              };

              const style = severityStyles[suggestion.severity];

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedSuggestion(suggestion)}
                  className={`p-6 rounded-2xl border-2 ${style.border} ${style.bg} hover:shadow-lg hover:scale-[1.02] transition-all text-left cursor-pointer relative`}
                >
                  {/* 심각도 배지 */}
                  <div className="mb-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${style.badge}`}>
                      {severityBadge[suggestion.severity]}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h5 className={`text-lg font-bold mb-3 leading-tight ${style.text}`}>
                    {suggestion.title.split(' - ').map((part, i) => (
                      <span key={i}>
                        {i > 0 && (
                          <span className="block mt-2 text-xl font-extrabold text-red-600">
                            {part}
                          </span>
                        )}
                        {i === 0 && part}
                      </span>
                    ))}
                  </h5>

                  {/* 감축 가능량 */}
                  {suggestion.expectedReduction > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-semibold text-green-600">
                        ↓ 최대 {suggestion.expectedReduction.toLocaleString()}kg 감축 가능
                      </p>
                    </div>
                  )}

                  {/* 클릭 힌트 */}
                  <div className="mt-4 text-xs text-gray-400">
                    자세히 보기 →
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 배출 구성 비율 */}
      <div className="mb-6">
        <h4 className="text-base font-semibold text-gray-700 mb-4">배출원별 구성</h4>
        <div className="space-y-3">
          {categories.map(category => {
            const percentage = (category.value / totalEmissions * 100).toFixed(1);
            const barWidth = (category.value / maxValue * 100).toFixed(1);
            const comparison = calculateComparison(category.value, category.prev);

            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    {(category as any).tooltip && (
                      <span className="text-xs text-gray-500">({(category as any).tooltip})</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {category.type === 'direct' ? '직접' : '간접'}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {category.value.toLocaleString()} kg
                    </span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                    <span className="text-xs w-16 text-right">
                      <TrendIcon trend={comparison.trend} changePercentage={comparison.changePercentage} />
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 relative">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: category.color,
                    }}
                  />
                  {/* 적정 배출량 기준선 (전체의 80%) */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-400 cursor-help"
                    style={{ left: '80%' }}
                    title="적정 배출량 기준선 (80%)"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 월간 투입량 */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-base font-semibold text-gray-700 mb-4">월간 투입량</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-green-50 border border-green-100">
            <p className="text-xs text-green-700 mb-1">전력</p>
            <p className="text-lg font-bold text-green-900">
              {monthlyInputs.electricityUsage.toLocaleString()}
              <span className="text-xs ml-1">kWh</span>
            </p>
            <p className="text-xs text-green-600 mt-1">
              <TrendIcon
                trend={calculateComparison(monthlyInputs.electricityUsage, previousData.monthlyInputs.electricityUsage).trend}
                changePercentage={calculateComparison(monthlyInputs.electricityUsage, previousData.monthlyInputs.electricityUsage).changePercentage}
              />
            </p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
            <p className="text-xs text-yellow-700 mb-1">경유</p>
            <p className="text-lg font-bold text-yellow-900">
              {monthlyInputs.dieselUsage.toLocaleString()}
              <span className="text-xs ml-1">L</span>
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              <TrendIcon
                trend={calculateComparison(monthlyInputs.dieselUsage, previousData.monthlyInputs.dieselUsage).trend}
                changePercentage={calculateComparison(monthlyInputs.dieselUsage, previousData.monthlyInputs.dieselUsage).changePercentage}
              />
            </p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
            <p className="text-xs text-purple-700 mb-1">LPG</p>
            <p className="text-lg font-bold text-purple-900">
              {monthlyInputs.lpgUsage.toLocaleString()}
              <span className="text-xs ml-1">kg</span>
            </p>
            <p className="text-xs text-purple-600 mt-1">
              <TrendIcon
                trend={calculateComparison(monthlyInputs.lpgUsage, previousData.monthlyInputs.lpgUsage).trend}
                changePercentage={calculateComparison(monthlyInputs.lpgUsage, previousData.monthlyInputs.lpgUsage).changePercentage}
              />
            </p>
          </div>
        </div>
      </div>


      {/* 개선 제안 상세 모달 */}
      {selectedSuggestion && (
        <Modal
          isOpen={!!selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          title="개선 제안 상세"
          size="lg"
        >
          <div className="space-y-4">
            {/* 제목 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {selectedSuggestion.title}
              </h3>
              <div className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedSuggestion.description}
              </div>
            </div>

            {/* 예상 감축량 */}
            {selectedSuggestion.expectedReduction > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-700 font-medium">즉시 조치 시 최대 감축 가능량</p>
                    <p className="text-2xl font-bold text-green-900">
                      {Math.round(selectedSuggestion.expectedReduction).toLocaleString()} kg CO₂eq
                    </p>
                    <p className="text-xs text-green-600 mt-1">아래 실행 방법을 따르면 이 정도 감축 효과를 기대할 수 있습니다</p>
                  </div>
                </div>
              </div>
            )}

            {/* 실행 방법 */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-3">실행 방법</h4>
              <ul className="space-y-2">
                {selectedSuggestion.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 pt-0.5">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 관련 감축 기술 */}
            {selectedSuggestion.relatedTechnology && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">인증 관련 기술</p>
                    <p className="text-sm text-blue-700">
                      저탄소 축산물 인증 평가 항목: <span className="font-semibold">{selectedSuggestion.relatedTechnology}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 닫기 버튼 */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
