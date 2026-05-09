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
    Math.abs(changePercentage) < 2 ? 'stable' :
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

  // 사료 배출 증가 체크
  const feedIncrease = current.indirectEmissions.feed - previous.indirectEmissions.feed;
  if (feedIncrease > 0) {
    const increasePercent = ((feedIncrease / previous.indirectEmissions.feed) * 100).toFixed(1);
    suggestions.push({
      category: 'feed',
      severity: feedIncrease > previous.indirectEmissions.feed * 0.1 ? 'high' : 'medium',
      title: `사료 배출량 ${increasePercent}% 증가`,
      description: `${periodLabel} 대비 사료 관련 배출량이 ${feedIncrease.toLocaleString()}kg CO₂eq 증가했습니다. 사료량이 아닌 "질소저감 사료 급여" 적용 여부가 인증 기준입니다.`,
      expectedReduction: feedIncrease * 0.15,
      actions: [
        '질소저감 사료로 교체 (인증 평가 가산점 획득)',
        '아미노산 균형을 맞춘 사료로 과잉 단백질 급여 방지',
        '저메탄 첨가제(3-NOP, 해조류) 추가로 15~30% 감축',
        '사료 급여량 최적화로 불필요한 배출 방지',
      ],
      relatedTechnology: '질소저감 사료 급여',
    });
  }

  // 전력 사용 증가 체크
  const elecIncrease = current.indirectEmissions.electricity - previous.indirectEmissions.electricity;
  if (elecIncrease > 0) {
    const increasePercent = ((elecIncrease / previous.indirectEmissions.electricity) * 100).toFixed(1);
    suggestions.push({
      category: 'electricity',
      severity: elecIncrease > previous.indirectEmissions.electricity * 0.1 ? 'high' : 'medium',
      title: `전력 배출량 ${increasePercent}% 증가`,
      description: `${periodLabel} 대비 전력 관련 배출량이 ${elecIncrease.toLocaleString()}kg CO₂eq 증가했습니다.`,
      expectedReduction: elecIncrease * 0.3,
      actions: [
        '신재생에너지(태양광) 설치로 30% 감축 가능',
        '환기 시스템 가동 시간 최적화',
        'LED 조명 및 고효율 설비로 교체',
      ],
      relatedTechnology: '신재생에너지 사용',
    });
  }

  // 연료 사용 증가 체크
  const fuelIncrease = current.indirectEmissions.fuel - previous.indirectEmissions.fuel;
  if (fuelIncrease > 0) {
    const increasePercent = ((fuelIncrease / previous.indirectEmissions.fuel) * 100).toFixed(1);
    suggestions.push({
      category: 'fuel',
      severity: fuelIncrease > previous.indirectEmissions.fuel * 0.1 ? 'high' : 'low',
      title: `연료 배출량 ${increasePercent}% 증가`,
      description: `${periodLabel} 대비 연료 관련 배출량이 ${fuelIncrease.toLocaleString()}kg CO₂eq 증가했습니다.`,
      expectedReduction: fuelIncrease * 0.2,
      actions: [
        '난방 효율 개선 및 단열 강화',
        '연료 사용 장비 점검 및 최적화',
        '불필요한 공회전 방지',
      ],
    });
  }

  // 분뇨 배출 증가 체크
  const manureIncrease = current.directEmissions.manure - previous.directEmissions.manure;
  if (manureIncrease > 0) {
    const increasePercent = ((manureIncrease / previous.directEmissions.manure) * 100).toFixed(1);
    suggestions.push({
      category: 'manure',
      severity: manureIncrease > previous.directEmissions.manure * 0.1 ? 'high' : 'medium',
      title: `분뇨 배출량 ${increasePercent}% 증가`,
      description: `${periodLabel} 대비 분뇨 관련 배출량이 ${manureIncrease.toLocaleString()}kg CO₂eq 증가했습니다.`,
      expectedReduction: manureIncrease * 0.25,
      actions: [
        '피트 내 슬러리를 월 1회 이상 처리 (6점 획득)',
        '액비순환시스템 도입 검토 (6점 획득)',
        '호기성 처리(퇴비화) 시설 개선',
        '바이오가스 포집 시설 설치 (5점 획득, 30% 감축)',
      ],
      relatedTechnology: '분뇨의 바이오 에너지화',
    });
  }

  // 가축 배출 증가 체크
  const livestockIncrease = current.directEmissions.livestock - previous.directEmissions.livestock;
  if (livestockIncrease > 0) {
    const increasePercent = ((livestockIncrease / previous.directEmissions.livestock) * 100).toFixed(1);
    suggestions.push({
      category: 'livestock',
      severity: livestockIncrease > previous.directEmissions.livestock * 0.05 ? 'medium' : 'low',
      title: `가축 배출량 ${increasePercent}% 증가`,
      description: `${periodLabel} 대비 가축 직접 배출량이 ${livestockIncrease.toLocaleString()}kg CO₂eq 증가했습니다.`,
      expectedReduction: livestockIncrease * 0.15,
      actions: [
        '사육 두수 변화 확인 필요',
        'MSY 생산성 향상으로 배출량 감축 (최대 2.8% 감축)',
        '저메탄 사료 급여로 15~30% 감축 가능',
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
  const [period, setPeriod] = useState<ComparisonPeriod>('weekly');
  const [selectedSuggestion, setSelectedSuggestion] = useState<ImprovementSuggestion | null>(null);

  const { directEmissions, indirectEmissions, monthlyInputs } = farm.lcaData;

  const totalDirect = directEmissions.livestock + directEmissions.manure;
  const totalIndirect = indirectEmissions.feed + indirectEmissions.electricity +
                       indirectEmissions.fuel + indirectEmissions.other;
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

  // 이전 기간 총 배출량 계산
  const prevTotalDirect = previousData.directEmissions.livestock + previousData.directEmissions.manure;
  const prevTotalIndirect = previousData.indirectEmissions.feed + previousData.indirectEmissions.electricity +
                            previousData.indirectEmissions.fuel + previousData.indirectEmissions.other;
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
    { name: '가축 배출', value: directEmissions.livestock, prev: previousData.directEmissions.livestock, color: '#FF6B6B', type: 'direct' },
    { name: '분뇨 배출', value: directEmissions.manure, prev: previousData.directEmissions.manure, color: '#FA8072', type: 'direct' },
    { name: '전력', value: indirectEmissions.electricity, prev: previousData.indirectEmissions.electricity, color: '#95E1D3', type: 'indirect' },
    { name: '연료', value: indirectEmissions.fuel, prev: previousData.indirectEmissions.fuel, color: '#FFE66D', type: 'indirect' },
    { name: '기타', value: indirectEmissions.other, prev: previousData.indirectEmissions.other, color: '#C7CEEA', type: 'indirect' },
  ];

  const maxValue = Math.max(...categories.map(c => c.value));

  const periodLabels = {
    daily: '어제',
    weekly: '지난주',
    monthly: '전월',
  };

  // 트렌드 아이콘
  const TrendIcon = ({ trend, changePercentage }: { trend: TrendDirection; changePercentage: number }) => {
    if (trend === 'stable') {
      return <span className="text-gray-500">-</span>;
    }
    const isNegative = trend === 'down';
    return (
      <span className={isNegative ? 'text-green-600' : 'text-red-600'}>
        {isNegative ? '▼' : '▲'} {Math.abs(changePercentage).toFixed(1)}%
      </span>
    );
  };

  return (
    <Card padding="lg" className="backdrop-blur-xl bg-white/80">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">전과정평가 (LCA) 탄소발자국</h3>
            <p className="text-sm text-gray-500">Life Cycle Assessment - 월간 배출량 비교</p>
          </div>

          {/* 비교 주기 선택 */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as ComparisonPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
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
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-primary-700 mb-1">총 탄소배출량 (월간)</p>
            <p className="text-3xl font-bold text-primary-900">
              {totalEmissions.toLocaleString()}
              <span className="text-lg ml-2">kg CO₂eq</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-primary-600">{periodLabels[period]} 대비</span>
              <span className="text-sm font-semibold">
                <TrendIcon trend={totalComparison.trend} changePercentage={totalComparison.changePercentage} />
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="mb-3">
              <p className="text-xs text-primary-600">직접 배출</p>
              <p className="text-lg font-bold text-primary-800">{totalDirect.toLocaleString()}</p>
              <span className="text-xs">
                <TrendIcon trend={directComparison.trend} changePercentage={directComparison.changePercentage} />
              </span>
            </div>
            <div>
              <p className="text-xs text-primary-600">간접 배출</p>
              <p className="text-lg font-bold text-primary-800">{totalIndirect.toLocaleString()}</p>
              <span className="text-xs">
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
          <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            개선 제안 ({suggestions.length}개)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {suggestions.map((suggestion, idx) => {
              const categoryIcons = {
                feed: '🌾',
                electricity: '⚡',
                fuel: '🔥',
                manure: '♻️',
                livestock: '🐄',
              };

              const severityColors = {
                high: 'border-red-300 bg-gradient-to-br from-red-50 to-red-100',
                medium: 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100',
                low: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100',
              };

              const severityBadge = {
                high: { label: '긴급', color: 'bg-red-600' },
                medium: { label: '권장', color: 'bg-orange-600' },
                low: { label: '참고', color: 'bg-yellow-600' },
              };

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedSuggestion(suggestion)}
                  className={`p-4 rounded-xl border-2 ${severityColors[suggestion.severity]} hover:shadow-lg transition-all text-left group cursor-pointer relative overflow-hidden`}
                >
                  {/* 심각도 배지 */}
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded-full text-white font-semibold ${severityBadge[suggestion.severity].color}`}>
                      {severityBadge[suggestion.severity].label}
                    </span>
                  </div>

                  {/* 아이콘 */}
                  <div className="text-4xl mb-3">
                    {categoryIcons[suggestion.category]}
                  </div>

                  {/* 제목 */}
                  <h5 className="text-sm font-bold text-gray-900 mb-2 pr-12 line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {suggestion.title}
                  </h5>

                  {/* 감축 가능량 */}
                  <div className="flex items-center gap-2 mt-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm font-bold text-green-700">
                      {suggestion.expectedReduction.toFixed(0)}kg 감축
                    </span>
                  </div>

                  {/* 클릭 힌트 */}
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    자세히 보기
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 배출 구성 비율 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">배출원별 구성</h4>
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
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 월간 투입량 */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">월간 투입량</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-700 mb-1">사료</p>
            <p className="text-lg font-bold text-blue-900">
              {monthlyInputs.feedAmount.toLocaleString()}
              <span className="text-xs ml-1">kg</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              <TrendIcon
                trend={calculateComparison(monthlyInputs.feedAmount, previousData.monthlyInputs.feedAmount).trend}
                changePercentage={calculateComparison(monthlyInputs.feedAmount, previousData.monthlyInputs.feedAmount).changePercentage}
              />
            </p>
          </div>
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

      {/* 배출계수 정보 */}
      <div className="mt-6 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex gap-2">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">인증 기준 (돼지)</p>
            <p>• 목표 배출량: 2.13 kg CO₂eq/kg (도체중 기준, 평균 대비 18% 감축)</p>
            <p>• 가산정 배출량: 70점 만점 (63점 이상 필요)</p>
            <p>• 비계량 기술: 30점 만점</p>
            <p>• 인증 기준: 총점 75점 이상</p>
            <p className="mt-2 text-blue-700 font-medium">※ 사료량이 아닌 "질소저감 사료 급여" 적용이 인증 평가 기준</p>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedSuggestion.title}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedSuggestion.description}
              </p>
            </div>

            {/* 예상 감축량 */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <div>
                  <p className="text-sm text-green-700 font-medium">예상 감축량</p>
                  <p className="text-2xl font-bold text-green-900">
                    {selectedSuggestion.expectedReduction.toFixed(0)} kg CO₂eq
                  </p>
                </div>
              </div>
            </div>

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
