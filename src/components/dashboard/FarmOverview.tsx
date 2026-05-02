import { Farm, LIVESTOCK_INFO } from '../../types';
import { Card } from '../common';

interface FarmOverviewProps {
  farm: Farm;
}

export function FarmOverview({ farm }: FarmOverviewProps) {
  const livestockInfo = LIVESTOCK_INFO[farm.livestock.type];

  return (
    <Card padding="lg" className="backdrop-blur-xl bg-white/80">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${livestockInfo.color}15` }}>
              {livestockInfo.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{farm.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{farm.owner} 대표</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">축종</p>
              <p className="text-sm font-semibold text-gray-900">{livestockInfo.nameKo}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">사육두수</p>
              <p className="text-sm font-semibold text-gray-900">{farm.livestock.headCount.toLocaleString()}두</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">농장규모</p>
              <p className="text-sm font-semibold text-gray-900">
                {farm.size === 'small' ? '소규모' : farm.size === 'medium' ? '중규모' : '대규모'}
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: farm.certification.grade === 'A' ? '#dcfce7' : farm.certification.grade === 'B' ? '#dbeafe' : '#fef3c7' }}>
              <p className="text-xs mb-1" style={{ color: farm.certification.grade === 'A' ? '#166534' : farm.certification.grade === 'B' ? '#1e40af' : '#854d0e' }}>인증등급</p>
              <p className="text-sm font-bold" style={{ color: farm.certification.grade === 'A' ? '#166534' : farm.certification.grade === 'B' ? '#1e40af' : '#854d0e' }}>
                {farm.certification.grade}등급
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {farm.location.address}
        </div>
      </div>
    </Card>
  );
}
