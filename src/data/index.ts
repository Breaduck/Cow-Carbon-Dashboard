import { generateFarms, generateSensors, generateAlerts, REDUCTION_GUIDES, calculateStats } from '../utils/dataGenerator';

// 339개 농장 데이터 생성
export const farms = generateFarms();

// 센서 데이터 생성
export const sensors = generateSensors(farms);

// 알림 데이터 생성
export const alerts = generateAlerts(farms);

// 절감 가이드
export const reductionGuides = REDUCTION_GUIDES;

// 통계 데이터
export const dashboardStats = calculateStats(farms, alerts);

// 농장 ID로 조회
export const getFarmById = (id: string) => farms.find(f => f.id === id);

// 농장의 센서 조회
export const getSensorsByFarmId = (farmId: string) => sensors.filter(s => s.farmId === farmId);

// 농장의 알림 조회
export const getAlertsByFarmId = (farmId: string) => alerts.filter(a => a.farmId === farmId);

// 시도별 농장 수
export const farmCountBySido = farms.reduce((acc, farm) => {
  acc[farm.location.sido] = (acc[farm.location.sido] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('Generated Data:', {
  totalFarms: farms.length,
  totalSensors: sensors.length,
  totalAlerts: alerts.length,
  stats: dashboardStats,
});
