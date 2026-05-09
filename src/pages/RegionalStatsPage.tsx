import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { LIVESTOCK_INFO } from '../types';
import { KoreaRegionMap, RegionalDetailModal } from '../components/regional';
import { LivestockPieChart } from '../components/charts/LivestockPieChart';

// 지역 순서
const REGION_ORDER = [
  '울산광역시',
  '세종특별자치시',
  '강원특별자치도',
  '경기도',
  '충청북도',
  '충청남도',
  '경상북도',
  '경상남도',
  '전라남도',
  '전북특별자치도',
  '제주특별자치도',
];

export function RegionalStatsPage() {
  const { farms, alerts } = useStore();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // 지역별 통계 계산
  const regionalStats = useMemo(() => {
    return REGION_ORDER.map(region => {
      const regionFarms = farms.filter(f => f.location.sido === region);
      const beefCount = regionFarms.filter(f => f.livestock.type === 'beef_cattle').length;
      const pigCount = regionFarms.filter(f => f.livestock.type === 'pig').length;
      const dairyCount = regionFarms.filter(f => f.livestock.type === 'dairy_cattle').length;

      return {
        region,
        regionShort: region.replace(/특별시|광역시|특별자치시|특별자치도|도$/g, ''),
        total: regionFarms.length,
        beef: beefCount,
        pig: pigCount,
        dairy: dairyCount,
      };
    });
  }, [farms]);

  const totalStats = useMemo(() => {
    return regionalStats.reduce(
      (acc, stat) => ({
        total: acc.total + stat.total,
        beef: acc.beef + stat.beef,
        pig: acc.pig + stat.pig,
        dairy: acc.dairy + stat.dairy,
      }),
      { total: 0, beef: 0, pig: 0, dairy: 0 }
    );
  }, [regionalStats]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">지역별 인증농장 현황</h1>
          <p className="text-sm text-gray-600">
            전국 저탄소 축산물 인증 농장 {totalStats.total}개 (2023-2025년 누적)
          </p>
        </div>

        {/* 2단 레이아웃 (모바일: 1단, 데스크탑: 2단) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* 왼쪽: 한국 지도 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">권역별 분포</h2>
            <div className="h-[500px] md:h-[600px]">
              <KoreaRegionMap
                regionalStats={regionalStats}
                onRegionClick={setSelectedRegion}
              />
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              권역을 클릭하면 상세 정보를 확인할 수 있습니다
            </div>
          </div>

          {/* 오른쪽: 통계 패널 */}
          <div className="space-y-4 md:space-y-6">
            {/* 축종별 합계 카드 (2x2 그리드) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">전국 현황</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium text-primary-900">전체</span>
                  </div>
                  <p className="text-3xl font-bold text-primary-900">{totalStats.total}</p>
                  <p className="text-xs text-primary-700 mt-1">개 농장</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: LIVESTOCK_INFO.beef_cattle.color }} />
                    <span className="text-sm font-medium text-gray-700">{LIVESTOCK_INFO.beef_cattle.nameKo}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{totalStats.beef}</p>
                  <p className="text-xs text-gray-600 mt-1">개 농장</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: LIVESTOCK_INFO.pig.color }} />
                    <span className="text-sm font-medium text-gray-700">{LIVESTOCK_INFO.pig.nameKo}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{totalStats.pig}</p>
                  <p className="text-xs text-gray-600 mt-1">개 농장</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: LIVESTOCK_INFO.dairy_cattle.color }} />
                    <span className="text-sm font-medium text-gray-700">{LIVESTOCK_INFO.dairy_cattle.nameKo}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{totalStats.dairy}</p>
                  <p className="text-xs text-gray-600 mt-1">개 농장</p>
                </div>
              </div>
            </div>

            {/* 축종별 분포 차트 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">축종별 분포</h2>
              <LivestockPieChart
                beefCount={totalStats.beef}
                pigCount={totalStats.pig}
                dairyCount={totalStats.dairy}
              />
            </div>
          </div>
        </div>

        {/* 지역별 통계 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">지역별 상세 통계</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  지역
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  전체
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LIVESTOCK_INFO.beef_cattle.color }} />
                    한우
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LIVESTOCK_INFO.pig.color }} />
                    돼지
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LIVESTOCK_INFO.dairy_cattle.color }} />
                    젖소
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {regionalStats.map((stat, idx) => (
                <tr
                  key={stat.region}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-primary-50 transition-colors cursor-pointer`}
                  onClick={() => setSelectedRegion(stat.region)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{stat.regionShort}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-bold text-gray-900">{stat.total}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-600">{stat.beef > 0 ? stat.beef : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-600">{stat.pig > 0 ? stat.pig : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-600">{stat.dairy > 0 ? stat.dairy : '-'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-primary-50 border-t-2 border-primary-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-primary-900">합계</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-primary-900">{totalStats.total}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-primary-900">{totalStats.beef}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-primary-900">{totalStats.pig}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-primary-900">{totalStats.dairy}</div>
                </td>
              </tr>
            </tfoot>
            </table>
          </div>
        </div>

        {/* 참고사항 */}
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-primary-900">
              <p className="font-semibold mb-1">데이터 출처</p>
              <p>• 축산물품질평가원 저탄소 축산물 인증제 (2023-2025년 누적 데이터)</p>
              <p>• 실제 농장명은 개인정보 보호를 위해 가명 처리되었습니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* 지역 상세 모달 */}
      <RegionalDetailModal
        isOpen={selectedRegion !== null}
        onClose={() => setSelectedRegion(null)}
        region={selectedRegion}
        farms={farms}
        alerts={alerts}
      />
    </div>
  );
}
