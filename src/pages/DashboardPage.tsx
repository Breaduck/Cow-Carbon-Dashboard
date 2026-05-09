import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { FarmOverview } from '../components/dashboard/FarmOverview';
import { LCABreakdown } from '../components/dashboard/LCABreakdown';
import { FloorPlanView } from '../components/dashboard/FloorPlanView';
import { GasGauges } from '../components/dashboard/GasGauges';
import { EmissionChart } from '../components/charts/EmissionChart';
import { PerformanceCalendar } from '../components/alerts/PerformanceCalendar';

export function DashboardPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const { selectedFarm, selectFarm, farms } = useStore();

  useEffect(() => {
    if (farmId) {
      selectFarm(farmId);
    } else if (farms.length > 0) {
      selectFarm(farms[0].id);
    }
  }, [farmId, selectFarm, farms]);

  if (!selectedFarm) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">농장을 선택해주세요</h3>
          <p className="text-sm text-gray-500">좌측 지도에서 농장을 선택하거나<br />목록에서 농장을 선택하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <FarmOverview farm={selectedFarm} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FloorPlanView farm={selectedFarm} />
          <GasGauges farm={selectedFarm} />
        </div>

        <EmissionChart farm={selectedFarm} />

        <LCABreakdown farm={selectedFarm} />

        <PerformanceCalendar farm={selectedFarm} />
      </div>
    </div>
  );
}
