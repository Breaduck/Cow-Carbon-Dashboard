// 축종 타입
export type LivestockType = 'beef_cattle' | 'dairy_cattle' | 'pig';

// 농장 규모
export type FarmSize = 'small' | 'medium' | 'large';

// 인증 등급
export type CertificationGrade = 'A' | 'B' | 'C';

// 가스 타입
export type GasType = 'CH4' | 'CO2' | 'N2O' | 'NH3';

// 시간 범위
export type TimeRange = 'day' | 'week' | 'month' | 'year';

// 알림 심각도
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// 알림 타입
export type AlertType = 'emission_exceeded' | 'sensor_error' | 'maintenance_required' | 'target_achieved';

// 좌표
export interface Coordinates {
  lat: number;
  lng: number;
}

// 위치 정보
export interface Location {
  coordinates: Coordinates;
  sido: string;
  sigungu: string;
  address: string;
}

// 축산 정보
export interface LivestockInfo {
  type: LivestockType;
  headCount: number;
}

// 인증 정보
export interface Certification {
  grade: CertificationGrade;
  certifiedDate: string;
  expiryDate: string;
}

// 센서
export interface Sensor {
  id: string;
  farmId: string;
  type: 'gas' | 'temperature' | 'humidity';
  location: {
    x: number; // 평면도 상 x 위치 (%)
    y: number; // 평면도 상 y 위치 (%)
    zone: string; // 구역 이름
  };
  status: 'active' | 'inactive' | 'error';
  lastReading: {
    timestamp: string;
    values: Record<GasType, number>;
  };
}

// 비교 주기
export type ComparisonPeriod = 'daily' | 'weekly' | 'monthly';

// LCA(전과정평가) 데이터
export interface LCAData {
  // 직접 배출 (센서 측정)
  directEmissions: {
    livestock: number;    // 가축 배출 (kg CO2eq/월)
    manure: number;       // 분뇨 배출 (kg CO2eq/월)
  };
  // 간접 배출 (투입재 기반 계산)
  indirectEmissions: {
    feed: number;         // 사료 (kg CO2eq/월)
    electricity: number;  // 전력 (kg CO2eq/월)
    fuel: number;         // 연료 (kg CO2eq/월)
    other: number;        // 기타 (kg CO2eq/월)
  };
  // 월간 투입량
  monthlyInputs: {
    feedAmount: number;       // 사료량 (kg)
    electricityUsage: number; // 전력 사용량 (kWh)
    dieselUsage: number;      // 경유 사용량 (L)
    lpgUsage: number;         // LPG 사용량 (kg)
  };
}

// LCA 과거 데이터
export interface LCAHistoricalData {
  yesterday: LCAData;
  lastWeek: LCAData;
  lastMonth: LCAData;
}

// 트렌드 방향
export type TrendDirection = 'up' | 'down' | 'stable';

// LCA 비교 결과
export interface LCAComparison {
  period: ComparisonPeriod;
  previousValue: number;
  currentValue: number;
  changeAmount: number;
  changePercentage: number;
  trend: TrendDirection;
}

// 배출량 비교 상세
export interface EmissionComparison {
  total: LCAComparison;
  directTotal: LCAComparison;
  indirectTotal: LCAComparison;
  breakdown: {
    livestock: LCAComparison;
    manure: LCAComparison;
    feed: LCAComparison;
    electricity: LCAComparison;
    fuel: LCAComparison;
    other: LCAComparison;
  };
}

// 개선 제안
export interface ImprovementSuggestion {
  category: 'feed' | 'electricity' | 'fuel' | 'manure' | 'livestock';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedReduction: number; // kg CO2eq
  actions: string[];
  relatedTechnology?: string; // 감축 기술명
}

// 인증 점수
export interface CertificationScore {
  emissionScore: number;       // 가산정 탄소배출량 점수 (70점 만점)
  nonQuantifiableScore: number; // 비계량 기술 점수 (30점 만점)
  totalScore: number;           // 총점 (100점 만점)
  targetEmission: number;       // 목표 배출량 (kg CO2eq/kg 도체중)
  currentEmission: number;      // 현재 배출량 (kg CO2eq/kg 도체중)
  reductionRate: number;        // 감축률 (%)
  certified: boolean;           // 인증 가능 여부 (75점 이상)
}

// 농장
export interface Farm {
  id: string;
  name: string;
  owner: string;
  location: Location;
  livestock: LivestockInfo;
  size: FarmSize;
  certification: Certification;
  sensors: string[]; // Sensor IDs
  createdAt: string;
  monthlyTarget: Record<GasType, number>; // kg CO2eq (직접 배출 목표)
  lcaData: LCAData; // 전과정평가 데이터
  lcaHistory: LCAHistoricalData; // 과거 데이터
  carcassWeight: number; // 도체중 (kg) - 목표 배출량 계산용
}

// 배출 데이터 포인트
export interface EmissionDataPoint {
  timestamp: string;
  farmId: string;
  gasType: GasType;
  value: number; // 원 단위 (ppm 또는 mg/m³)
  co2Equivalent: number; // kg CO2eq
}

// 집계된 배출 데이터
export interface AggregatedEmission {
  farmId: string;
  period: TimeRange;
  startDate: string;
  endDate: string;
  emissions: Record<GasType, {
    total: number;
    average: number;
    max: number;
    min: number;
    co2Equivalent: number;
  }>;
  totalCO2Equivalent: number;
}

// 알림
export interface Alert {
  id: string;
  farmId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  details: string;
  gasType?: GasType;
  currentValue?: number;
  threshold?: number;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
}

// 절감 가이드
export interface ReductionGuide {
  id: string;
  title: string;
  description: string;
  targetGas: GasType[];
  targetLivestock: LivestockType[];
  expectedReduction: number; // %
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'feed' | 'manure' | 'facility' | 'management';
  tips: string[];
}

// 대시보드 통계
export interface DashboardStats {
  totalFarms: number;
  farmsByLivestock: Record<LivestockType, number>;
  farmsByGrade: Record<CertificationGrade, number>;
  totalEmissions: Record<GasType, number>;
  averageEmissions: Record<GasType, number>;
  alertCount: number;
  achievementRate: number; // 목표 달성률 %
}

// 필터 옵션
export interface FilterOptions {
  livestock: LivestockType[];
  grade: CertificationGrade[];
  size: FarmSize[];
  sido: string[];
}

// 차트 데이터 포인트
export interface ChartDataPoint {
  timestamp: string;
  label: string;
  CH4: number;
  CO2: number;
  N2O: number;
  NH3: number;
  target?: number;
  average?: number;
}

// 가스 정보
export const GAS_INFO: Record<GasType, {
  name: string;
  nameKo: string;
  color: string;
  unit: string;
  gwp: number; // Global Warming Potential (CO2 기준)
}> = {
  CH4: {
    name: 'Methane',
    nameKo: '메탄',
    color: '#FF6B6B',
    unit: 'ppm',
    gwp: 28,
  },
  CO2: {
    name: 'Carbon Dioxide',
    nameKo: '이산화탄소',
    color: '#4ECDC4',
    unit: 'ppm',
    gwp: 1,
  },
  N2O: {
    name: 'Nitrous Oxide',
    nameKo: '아산화질소',
    color: '#FFE66D',
    unit: 'ppb',
    gwp: 265,
  },
  NH3: {
    name: 'Ammonia',
    nameKo: '암모니아',
    color: '#95E1D3',
    unit: 'ppm',
    gwp: 0, // 직접 온실가스 아님
  },
};

// 축종 정보
export const LIVESTOCK_INFO: Record<LivestockType, {
  name: string;
  nameKo: string;
  color: string;
  icon: string;
}> = {
  beef_cattle: {
    name: 'Beef Cattle',
    nameKo: '한우',
    color: '#8B4513',
    icon: '🐂',
  },
  dairy_cattle: {
    name: 'Dairy Cattle',
    nameKo: '젖소',
    color: '#1E40AF',
    icon: '🐄',
  },
  pig: {
    name: 'Pig',
    nameKo: '돼지',
    color: '#EC4899',
    icon: '🐷',
  },
};

// 시도 목록
export const SIDO_LIST = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시',
  '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
  '경기도', '강원도', '충청북도', '충청남도',
  '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도',
];
