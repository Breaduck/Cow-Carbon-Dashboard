import {
  Farm,
  Sensor,
  Alert,
  ReductionGuide,
  LivestockType,
  FarmSize,
  CertificationGrade,
  GasType,
  AlertType,
  AlertSeverity,
  TimeRange,
  ChartDataPoint,
  LCAData,
  LCAHistoricalData,
} from '../types';

// 시드 기반 난수 생성기
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// 지역별 좌표 범위 (한국 영토 내로 조정, 바다 제외)
const REGION_BOUNDS: Record<string, { lat: [number, number]; lng: [number, number] }> = {
  '경기도': { lat: [37.00, 37.90], lng: [126.70, 127.50] },
  '충청남도': { lat: [36.20, 36.80], lng: [126.40, 127.20] },
  '전라남도': { lat: [34.40, 35.30], lng: [126.30, 127.50] },
  '경상남도': { lat: [34.90, 35.60], lng: [128.00, 128.90] },
  '전북특별자치도': { lat: [35.50, 36.10], lng: [126.70, 127.50] },
  '경상북도': { lat: [35.90, 37.00], lng: [128.40, 129.20] },
  '충청북도': { lat: [36.50, 37.10], lng: [127.40, 128.00] },
  '세종특별자치시': { lat: [36.48, 36.60], lng: [127.23, 127.32] },
  '강원특별자치도': { lat: [37.30, 38.40], lng: [127.70, 128.50] },
  '울산광역시': { lat: [35.50, 35.65], lng: [129.20, 129.35] },
  '제주특별자치도': { lat: [33.25, 33.50], lng: [126.20, 126.85] },
};

// 시도별 시군구 목록
const SIGUNGU_BY_SIDO: Record<string, string[]> = {
  '경기도': ['수원시', '성남시', '고양시', '용인시', '안양시', '부천시', '평택시', '안산시', '화성시', '의정부시', '시흥시', '파주시', '김포시', '광주시', '이천시', '양주시', '포천시', '여주시', '연천군', '가평군'],
  '충청남도': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
  '전라남도': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
  '경상남도': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
  '전북특별자치도': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
  '경상북도': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
  '충청북도': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
  '세종특별자치시': ['세종시'],
  '강원특별자치도': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
  '울산광역시': ['중구', '남구', '동구', '북구', '울주군'],
  '제주특별자치도': ['제주시', '서귀포시'],
};

// 농장 이름 생성용 데이터
const FARM_NAME_PREFIXES = [
  '청정', '푸른', '행복', '자연', '친환경', '해맑은', '건강한', '깨끗한',
  '초록', '맑은', '든든', '정성', '우리', '한울', '새벽', '해바라기',
  '명품', '금빛', '은빛', '들녘', '산들', '바람', '햇살', '이슬',
];

const FARM_NAME_SUFFIXES = [
  '농장', '목장', '농원', '팜', '축산', '농가', '마을', '들',
];

const OWNER_LAST_NAMES = [
  '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
  '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍',
];

const OWNER_FIRST_NAMES = [
  '영수', '철수', '민수', '정호', '성민', '준혁', '현우', '지훈',
  '영희', '정희', '미영', '수진', '지연', '민정', '혜진', '유진',
];

// 600개 농장 생성 (2023~2025년 누적 데이터)
export function generateFarms(): Farm[] {
  const farms: Farm[] = [];
  const random = new SeededRandom(42);

  // 2023~2025년 시도별, 축종별 인증 농장 현황 (누적)
  const farmDistribution: Array<{ sido: string; livestock: LivestockType; count: number }> = [
    { sido: '경기도', livestock: 'beef_cattle', count: 12 },
    { sido: '경기도', livestock: 'pig', count: 21 },
    { sido: '경기도', livestock: 'dairy_cattle', count: 174 },
    { sido: '충청남도', livestock: 'beef_cattle', count: 2 },
    { sido: '충청남도', livestock: 'pig', count: 71 },
    { sido: '충청남도', livestock: 'dairy_cattle', count: 5 },
    { sido: '전라남도', livestock: 'beef_cattle', count: 37 },
    { sido: '전라남도', livestock: 'pig', count: 113 },
    { sido: '전라남도', livestock: 'dairy_cattle', count: 7 },
    { sido: '경상남도', livestock: 'pig', count: 69 },
    { sido: '전북특별자치도', livestock: 'beef_cattle', count: 21 },
    { sido: '전북특별자치도', livestock: 'pig', count: 21 },
    { sido: '전북특별자치도', livestock: 'dairy_cattle', count: 2 },
    { sido: '경상북도', livestock: 'pig', count: 12 },
    { sido: '경상북도', livestock: 'dairy_cattle', count: 2 },
    { sido: '충청북도', livestock: 'beef_cattle', count: 2 },
    { sido: '충청북도', livestock: 'pig', count: 2 },
    { sido: '충청북도', livestock: 'dairy_cattle', count: 2 },
    { sido: '세종특별자치시', livestock: 'pig', count: 5 },
    { sido: '강원특별자치도', livestock: 'pig', count: 2 },
    { sido: '울산광역시', livestock: 'pig', count: 2 },
    { sido: '제주특별자치도', livestock: 'pig', count: 12 },
    { sido: '제주특별자치도', livestock: 'dairy_cattle', count: 4 },
  ];

  let farmIdCounter = 1;

  for (const { sido, livestock, count } of farmDistribution) {
    const bounds = REGION_BOUNDS[sido];

    for (let j = 0; j < count; j++) {
      const i = farmIdCounter - 1;

    // 규모별 사육두수 범위
    const sizeWeights = livestock === 'pig' ? [0.3, 0.4, 0.3] : [0.4, 0.4, 0.2];
    const sizeRoll = random.next();
    const size: FarmSize = sizeRoll < sizeWeights[0] ? 'small' :
                          sizeRoll < sizeWeights[0] + sizeWeights[1] ? 'medium' : 'large';

    const headCountRanges: Record<LivestockType, Record<FarmSize, [number, number]>> = {
      beef_cattle: { small: [30, 80], medium: [80, 200], large: [200, 500] },
      dairy_cattle: { small: [20, 50], medium: [50, 150], large: [150, 400] },
      pig: { small: [100, 500], medium: [500, 2000], large: [2000, 5000] },
    };

    const [minHead, maxHead] = headCountRanges[livestock][size];
    const headCount = random.nextInt(minHead, maxHead);

    // 센서 개수 (규모별 최적화)
    // 소 우사: 모서리 4개 + 중앙 1개 = 5개가 기본
    // 외부 기준선: 동서남북 4개 고정
    const sensorCounts: Record<LivestockType, Record<FarmSize, number>> = {
      beef_cattle: {
        small: 16,   // 우사1(5) + 우사2(5) + 분뇨(2) + 외부(4)
        medium: 16,  // 우사1(5) + 우사2(5) + 분뇨(2) + 외부(4)
        large: 16,   // 우사1(5) + 우사2(5) + 분뇨(2) + 외부(4)
      },
      dairy_cattle: {
        small: 13,   // 착유실(2) + 착유우사(5) + 분뇨(2) + 외부(4)
        medium: 13,  // 착유실(2) + 착유우사(5) + 분뇨(2) + 외부(4)
        large: 13,   // 착유실(2) + 착유우사(5) + 분뇨(2) + 외부(4)
      },
      pig: {
        small: 21,   // 분만(2) + 자돈(2) + 육성(2) + 비육1(3) + 비육2(3) + 분뇨(3) + 외부(4)
        medium: 21,  // 분만(2) + 자돈(2) + 육성(2) + 비육1(3) + 비육2(3) + 분뇨(3) + 외부(4)
        large: 21,   // 분만(2) + 자돈(2) + 육성(2) + 비육1(3) + 비육2(3) + 분뇨(3) + 외부(4)
      },
    };
    const sensorCount = sensorCounts[livestock][size];
    const sensorIds = Array.from({ length: sensorCount }, (_, j) => `sensor-${i + 1}-${j + 1}`);

    // 인증 등급 (무작위, A가 가장 많음)
    const gradeRoll = random.next();
    const grade: CertificationGrade = gradeRoll < 0.5 ? 'A' : gradeRoll < 0.85 ? 'B' : 'C';

    // 월간 목표 배출량 (두수 및 축종에 따라)
    const baseTargets: Record<LivestockType, Record<GasType, number>> = {
      beef_cattle: { CH4: 120, CO2: 50, N2O: 0.8, NH3: 15 },
      dairy_cattle: { CH4: 150, CO2: 60, N2O: 1.0, NH3: 20 },
      pig: { CH4: 20, CO2: 15, N2O: 0.3, NH3: 8 },
    };

      const sigunguList = SIGUNGU_BY_SIDO[sido];
      const sigungu = random.pick(sigunguList);

      // LCA 데이터 생성
      const lcaData = generateLCAData(livestock, headCount, size, random);
      const lcaHistory = generateHistoricalLCAData(lcaData, random);

      // 도체중 계산 (축종별 평균 도체중)
      const avgCarcassWeightPerHead: Record<LivestockType, number> = {
        beef_cattle: 350,  // 한우 평균 도체중 350kg
        dairy_cattle: 300,  // 젖소 평균 도체중 300kg
        pig: 85,            // 돼지 평균 도체중 85kg
      };
      const carcassWeight = Math.round(avgCarcassWeightPerHead[livestock] * headCount);

      const farm: Farm = {
        id: `farm-${farmIdCounter}`,
        name: `${random.pick(FARM_NAME_PREFIXES)}${random.pick(FARM_NAME_SUFFIXES)}`,
        owner: `${random.pick(OWNER_LAST_NAMES)}${random.pick(OWNER_FIRST_NAMES)}`,
        location: {
          coordinates: {
            lat: bounds.lat[0] + random.next() * (bounds.lat[1] - bounds.lat[0]),
            lng: bounds.lng[0] + random.next() * (bounds.lng[1] - bounds.lng[0]),
          },
          sido,
          sigungu,
          address: `${sido} ${sigungu} ${random.pick(['읍', '면', '동'])} ${random.nextInt(1, 999)}`,
        },
        livestock: {
          type: livestock,
          headCount,
        },
        size,
        certification: {
          grade,
          certifiedDate: `202${random.nextInt(2, 4)}-${String(random.nextInt(1, 12)).padStart(2, '0')}-${String(random.nextInt(1, 28)).padStart(2, '0')}`,
          expiryDate: `202${random.nextInt(5, 7)}-${String(random.nextInt(1, 12)).padStart(2, '0')}-${String(random.nextInt(1, 28)).padStart(2, '0')}`,
        },
        sensors: sensorIds,
        createdAt: `202${random.nextInt(1, 3)}-${String(random.nextInt(1, 12)).padStart(2, '0')}-${String(random.nextInt(1, 28)).padStart(2, '0')}`,
        monthlyTarget: {
          CH4: Math.round(baseTargets[livestock].CH4 * headCount * (grade === 'A' ? 0.8 : grade === 'B' ? 0.9 : 1.0)),
          CO2: Math.round(baseTargets[livestock].CO2 * headCount * (grade === 'A' ? 0.8 : grade === 'B' ? 0.9 : 1.0)),
          N2O: Math.round(baseTargets[livestock].N2O * headCount * 100 * (grade === 'A' ? 0.8 : grade === 'B' ? 0.9 : 1.0)) / 100,
          NH3: Math.round(baseTargets[livestock].NH3 * headCount * (grade === 'A' ? 0.8 : grade === 'B' ? 0.9 : 1.0)),
        },
        lcaData,
        lcaHistory,
        carcassWeight,
      };

      farms.push(farm);
      farmIdCounter++;
    }
  }

  return farms;
}

// 센서 생성
export function generateSensors(farms: Farm[]): Sensor[] {
  const sensors: Sensor[] = [];
  const random = new SeededRandom(123);

  for (const farm of farms) {
    // 농장 크기와 축종에 따른 센서 배치 (실제 건물 내부 + 외부 기준선)
    const sensorPositions = calculateEmissionMeasurementPositions(farm.livestock.type, farm.size);

    // 센서 개수 검증
    if (sensorPositions.length !== farm.sensors.length) {
      console.error(`센서 개수 불일치: ${farm.id}, 예상=${farm.sensors.length}, 실제=${sensorPositions.length}, 축종=${farm.livestock.type}, 규모=${farm.size}`);
    }

    for (let i = 0; i < Math.min(farm.sensors.length, sensorPositions.length); i++) {
      const sensorId = farm.sensors[i];
      const { x, y, zone, isOutdoor } = sensorPositions[i];

      // 모든 센서 활성 상태 (실시간 모니터링 시스템)
      const status = 'active';

      // 외부 기준선 센서는 대기 배경 농도 (낮음)
      const baseValues = isOutdoor ? {
        CH4: 1.9 + random.next() * 0.2,      // 대기 중 메탄: ~2 ppm
        CO2: 410 + random.next() * 30,       // 대기 중 CO2: 410-440 ppm
        N2O: 0.33 + random.next() * 0.02,    // 대기 중 N2O: ~0.33 ppm
        NH3: 0.01 + random.next() * 0.05,    // 대기 중 암모니아: 거의 없음
      } : {
        CH4: 25 + random.next() * 35,        // 축사 내부: 25-60 ppm
        CO2: 800 + random.next() * 600,      // 축사 내부: 800-1400 ppm
        N2O: 0.5 + random.next() * 0.4,      // 축사 내부: 0.5-0.9 ppm
        NH3: 10 + random.next() * 25,        // 축사 내부: 10-35 ppm
      };

      const sensor: Sensor = {
        id: sensorId,
        farmId: farm.id,
        type: 'gas',
        location: {
          x,
          y,
          zone,
        },
        status,
        lastReading: {
          timestamp: new Date().toISOString(),
          values: baseValues,
        },
      };

      sensors.push(sensor);
    }
  }

  return sensors;
}

// LCA(전과정평가) 데이터 생성
function generateLCAData(
  livestock: LivestockType,
  headCount: number,
  size: FarmSize,
  random: SeededRandom
): LCAData {
  // 축종별 배출계수 (kg CO2eq/두/월)
  const emissionFactors = {
    beef_cattle: {
      livestock: 85,    // 가축 직접 배출 (장내발효 CH4)
      manure: 25,       // 분뇨 배출
      feedPerHead: 300, // 사료 kg/두/월
      feedEmission: 0.8, // 사료 배출계수 kg CO2eq/kg
    },
    dairy_cattle: {
      livestock: 110,
      manure: 35,
      feedPerHead: 450,
      feedEmission: 0.9,
    },
    pig: {
      livestock: 15,
      manure: 8,
      feedPerHead: 90,
      feedEmission: 0.7,
    },
  };

  const factor = emissionFactors[livestock];

  // 직접 배출 계산
  const directLivestock = Math.round(factor.livestock * headCount * (0.9 + random.next() * 0.2));
  const directManure = Math.round(factor.manure * headCount * (0.9 + random.next() * 0.2));

  // 투입량 계산
  const feedAmount = Math.round(factor.feedPerHead * headCount);

  // 규모별 전력/연료 사용량
  const sizeMultiplier = size === 'small' ? 1 : size === 'medium' ? 2.5 : 5;
  const electricityUsage = Math.round((500 + headCount * 2) * sizeMultiplier);
  const dieselUsage = Math.round((30 + headCount * 0.3) * sizeMultiplier);
  const lpgUsage = Math.round((20 + headCount * 0.2) * sizeMultiplier);

  // 간접 배출 계산
  // 사료: 사료량 × 배출계수
  const feedEmission = Math.round(feedAmount * factor.feedEmission);

  // 전력: kWh × 0.4563 kg CO2eq/kWh (한국 전력 배출계수)
  const electricityEmission = Math.round(electricityUsage * 0.4563);

  // 경유: L × 2.68 kg CO2eq/L
  // LPG: kg × 3.0 kg CO2eq/kg
  const fuelEmission = Math.round(dieselUsage * 2.68 + lpgUsage * 3.0);

  // 기타 (비료, 약품 등): 전체의 약 5%
  const otherEmission = Math.round((feedEmission + electricityEmission + fuelEmission) * 0.05);

  return {
    directEmissions: {
      livestock: directLivestock,
      manure: directManure,
    },
    indirectEmissions: {
      feed: feedEmission,
      electricity: electricityEmission,
      fuel: fuelEmission,
      other: otherEmission,
    },
    monthlyInputs: {
      feedAmount,
      electricityUsage,
      dieselUsage,
      lpgUsage,
    },
  };
}

// 과거 LCA 데이터 생성 (변동 포함)
function generateHistoricalLCAData(
  currentData: LCAData,
  random: SeededRandom
): LCAHistoricalData {
  // 변동 범위 생성 함수
  const applyVariation = (value: number, variationRange: number) => {
    // -variationRange ~ +variationRange 범위에서 변동
    const change = (random.next() - 0.5) * 2 * variationRange;
    return Math.max(0, Math.round(value * (1 + change)));
  };

  // 어제 데이터 (±5% 변동)
  const yesterday: LCAData = {
    directEmissions: {
      livestock: applyVariation(currentData.directEmissions.livestock, 0.05),
      manure: applyVariation(currentData.directEmissions.manure, 0.05),
    },
    indirectEmissions: {
      feed: applyVariation(currentData.indirectEmissions.feed, 0.05),
      electricity: applyVariation(currentData.indirectEmissions.electricity, 0.05),
      fuel: applyVariation(currentData.indirectEmissions.fuel, 0.05),
      other: applyVariation(currentData.indirectEmissions.other, 0.05),
    },
    monthlyInputs: {
      feedAmount: applyVariation(currentData.monthlyInputs.feedAmount, 0.05),
      electricityUsage: applyVariation(currentData.monthlyInputs.electricityUsage, 0.05),
      dieselUsage: applyVariation(currentData.monthlyInputs.dieselUsage, 0.05),
      lpgUsage: applyVariation(currentData.monthlyInputs.lpgUsage, 0.05),
    },
  };

  // 지난주 데이터 (±10% 변동)
  const lastWeek: LCAData = {
    directEmissions: {
      livestock: applyVariation(currentData.directEmissions.livestock, 0.10),
      manure: applyVariation(currentData.directEmissions.manure, 0.10),
    },
    indirectEmissions: {
      feed: applyVariation(currentData.indirectEmissions.feed, 0.10),
      electricity: applyVariation(currentData.indirectEmissions.electricity, 0.10),
      fuel: applyVariation(currentData.indirectEmissions.fuel, 0.10),
      other: applyVariation(currentData.indirectEmissions.other, 0.10),
    },
    monthlyInputs: {
      feedAmount: applyVariation(currentData.monthlyInputs.feedAmount, 0.10),
      electricityUsage: applyVariation(currentData.monthlyInputs.electricityUsage, 0.10),
      dieselUsage: applyVariation(currentData.monthlyInputs.dieselUsage, 0.10),
      lpgUsage: applyVariation(currentData.monthlyInputs.lpgUsage, 0.10),
    },
  };

  // 전월 데이터 (±15% 변동)
  const lastMonth: LCAData = {
    directEmissions: {
      livestock: applyVariation(currentData.directEmissions.livestock, 0.15),
      manure: applyVariation(currentData.directEmissions.manure, 0.15),
    },
    indirectEmissions: {
      feed: applyVariation(currentData.indirectEmissions.feed, 0.15),
      electricity: applyVariation(currentData.indirectEmissions.electricity, 0.15),
      fuel: applyVariation(currentData.indirectEmissions.fuel, 0.15),
      other: applyVariation(currentData.indirectEmissions.other, 0.15),
    },
    monthlyInputs: {
      feedAmount: applyVariation(currentData.monthlyInputs.feedAmount, 0.15),
      electricityUsage: applyVariation(currentData.monthlyInputs.electricityUsage, 0.15),
      dieselUsage: applyVariation(currentData.monthlyInputs.dieselUsage, 0.15),
      lpgUsage: applyVariation(currentData.monthlyInputs.lpgUsage, 0.15),
    },
  };

  return {
    yesterday,
    lastWeek,
    lastMonth,
  };
}

// 배출량 측정을 위한 센서 배치 계산 (실제 건물 내부 + 외부 기준선)
// 한국 축사 표준설계 기반으로 실제 건물 좌표 내부에 센서 배치
// 메탄(CH4): 가축 상부, 암모니아(NH3): 가축 높이 근처
function calculateEmissionMeasurementPositions(
  livestock: LivestockType,
  _size: FarmSize
): Array<{ x: number; y: number; zone: string; isOutdoor: boolean }> {
  const positions: Array<{ x: number; y: number; zone: string; isOutdoor: boolean }> = [];

  // 축종별 건물 좌표 (FloorPlanView.tsx와 동일)
  const buildingCoords = {
    beef_cattle: {
      barn1: { x: 40, width: 140, y: 40, height: 90, label: '우사 1동' },
      barn2: { x: 220, width: 140, y: 40, height: 90, label: '우사 2동' },
      manure: { x: 160, width: 100, y: 160, height: 55, label: '분뇨처리장' },
    },
    dairy_cattle: {
      milking: { x: 110, width: 80, y: 45, height: 50, label: '착유실' },
      barn: { x: 210, width: 150, y: 30, height: 80, label: '착유우사' },
      manure: { x: 160, width: 120, y: 130, height: 60, label: '분뇨처리장' },
    },
    pig: {
      farrowing: { x: 30, width: 100, y: 30, height: 55, label: '분만사' },
      nursery: { x: 150, width: 90, y: 30, height: 55, label: '자돈사' },
      grower: { x: 260, width: 90, y: 30, height: 55, label: '육성사' },
      finisher1: { x: 30, width: 150, y: 110, height: 70, label: '비육사 1동' },
      finisher2: { x: 200, width: 150, y: 110, height: 70, label: '비육사 2동' },
      manure: { x: 220, width: 130, y: 205, height: 40, label: '분뇨처리장' },
    },
  };

  // 건물 내부에 센서 배치하는 헬퍼 함수
  const addSensorsToBuilding = (
    building: { x: number; width: number; y: number; height: number; label: string },
    count: number
  ) => {
    const centerX = building.x + building.width / 2;
    const centerY = building.y + building.height / 2;
    // SVG viewBox 기준 좌표를 % 좌표로 변환 (viewBox: 400x300)
    const toPercentX = (x: number) => (x / 400) * 100;
    const toPercentY = (y: number) => (y / 300) * 100;

    if (count === 1) {
      positions.push({ x: toPercentX(centerX), y: toPercentY(centerY), zone: building.label, isOutdoor: false });
    } else if (count === 2) {
      // 좌우 배치
      positions.push(
        { x: toPercentX(building.x + building.width * 0.33), y: toPercentY(centerY), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.67), y: toPercentY(centerY), zone: building.label, isOutdoor: false }
      );
    } else if (count === 3) {
      // 좌중우 배치
      positions.push(
        { x: toPercentX(building.x + building.width * 0.25), y: toPercentY(centerY), zone: building.label, isOutdoor: false },
        { x: toPercentX(centerX), y: toPercentY(centerY), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.75), y: toPercentY(centerY), zone: building.label, isOutdoor: false }
      );
    } else if (count === 5) {
      // 모서리 4개 + 중앙 1개 (우사 최적 배치)
      positions.push(
        // 4 모서리
        { x: toPercentX(building.x + building.width * 0.15), y: toPercentY(building.y + building.height * 0.2), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.85), y: toPercentY(building.y + building.height * 0.2), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.15), y: toPercentY(building.y + building.height * 0.8), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.85), y: toPercentY(building.y + building.height * 0.8), zone: building.label, isOutdoor: false },
        // 중앙
        { x: toPercentX(centerX), y: toPercentY(centerY), zone: building.label, isOutdoor: false }
      );
    } else if (count === 4) {
      // 사각 배치 (4 모서리)
      positions.push(
        { x: toPercentX(building.x + building.width * 0.2), y: toPercentY(building.y + building.height * 0.25), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.8), y: toPercentY(building.y + building.height * 0.25), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.2), y: toPercentY(building.y + building.height * 0.75), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.8), y: toPercentY(building.y + building.height * 0.75), zone: building.label, isOutdoor: false }
      );
    } else if (count === 6) {
      // 2×3 배치
      positions.push(
        { x: toPercentX(building.x + building.width * 0.25), y: toPercentY(building.y + building.height * 0.33), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.5), y: toPercentY(building.y + building.height * 0.33), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.75), y: toPercentY(building.y + building.height * 0.33), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.25), y: toPercentY(building.y + building.height * 0.67), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.5), y: toPercentY(building.y + building.height * 0.67), zone: building.label, isOutdoor: false },
        { x: toPercentX(building.x + building.width * 0.75), y: toPercentY(building.y + building.height * 0.67), zone: building.label, isOutdoor: false }
      );
    }
  };

  // 축종별 센서 배치
  // 소 우사: 모서리 4개 + 중앙 1개 = 5개 (모든 규모 동일)
  if (livestock === 'beef_cattle') {
    const coords = buildingCoords.beef_cattle;
    // 우사 1동, 2동: 각각 모서리 4개 + 중앙 1개 = 5개
    addSensorsToBuilding(coords.barn1, 5);
    addSensorsToBuilding(coords.barn2, 5);
    // 분뇨처리장: 2개
    addSensorsToBuilding(coords.manure, 2);
  } else if (livestock === 'dairy_cattle') {
    const coords = buildingCoords.dairy_cattle;
    // 착유실: 2개
    addSensorsToBuilding(coords.milking, 2);
    // 착유우사: 모서리 4개 + 중앙 1개 = 5개
    addSensorsToBuilding(coords.barn, 5);
    // 분뇨처리장: 2개
    addSensorsToBuilding(coords.manure, 2);
  } else if (livestock === 'pig') {
    const coords = buildingCoords.pig;
    // 분만사, 자돈사, 육성사: 각 2개
    addSensorsToBuilding(coords.farrowing, 2);
    addSensorsToBuilding(coords.nursery, 2);
    addSensorsToBuilding(coords.grower, 2);
    // 비육사 1동, 2동: 각 3개 (모서리 2개 + 중앙 1개)
    addSensorsToBuilding(coords.finisher1, 3);
    addSensorsToBuilding(coords.finisher2, 3);
    // 분뇨처리장: 3개
    addSensorsToBuilding(coords.manure, 3);
  }

  // 외부 기준선 센서 배치 (모든 축종/규모 동일 - 동서남북 4개 고정)
  // 대기 배경 농도 측정용 (실제 배출량 = 내부 농도 - 외부 배경 농도)
  // 풍향이 바뀌므로 4방향 측정 필수
  const outdoorPositions = [
    { x: 3, y: 50, zone: '외부 기준선 (서)', isOutdoor: true },
    { x: 97, y: 50, zone: '외부 기준선 (동)', isOutdoor: true },
    { x: 50, y: 3, zone: '외부 기준선 (북)', isOutdoor: true },
    { x: 50, y: 97, zone: '외부 기준선 (남)', isOutdoor: true },
  ];

  positions.push(...outdoorPositions);

  return positions;
}

// 실시간 배출 데이터 생성 (시뮬레이션)
export function generateEmissionData(
  farm: Farm,
  timeRange: TimeRange,
  endDate: Date = new Date()
): ChartDataPoint[] {
  const random = new SeededRandom(parseInt(farm.id.split('-')[1]) + endDate.getTime() % 1000);
  const data: ChartDataPoint[] = [];

  const intervals: Record<TimeRange, { count: number; step: number; format: (d: Date) => string }> = {
    day: {
      count: 24,
      step: 60 * 60 * 1000, // 1시간
      format: (d) => `${d.getHours()}시`,
    },
    week: {
      count: 7,
      step: 24 * 60 * 60 * 1000, // 1일
      format: (d) => ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
    },
    month: {
      count: 30,
      step: 24 * 60 * 60 * 1000, // 1일
      format: (d) => `${d.getMonth() + 1}/${d.getDate()}`,
    },
    year: {
      count: 12,
      step: 30 * 24 * 60 * 60 * 1000, // 약 1개월
      format: (d) => `${d.getMonth() + 1}월`,
    },
  };

  const config = intervals[timeRange];
  const { headCount, type } = farm.livestock;

  // 축종별 기본 배출량 (두당)
  const baseEmissions: Record<LivestockType, Record<GasType, number>> = {
    beef_cattle: { CH4: 3.5, CO2: 1.5, N2O: 0.025, NH3: 0.4 },
    dairy_cattle: { CH4: 4.5, CO2: 2.0, N2O: 0.03, NH3: 0.6 },
    pig: { CH4: 0.6, CO2: 0.4, N2O: 0.01, NH3: 0.25 },
  };

  // 목표 및 평균 계산
  const dailyTarget = {
    CH4: farm.monthlyTarget.CH4 / 30,
    CO2: farm.monthlyTarget.CO2 / 30,
    N2O: farm.monthlyTarget.N2O / 30,
    NH3: farm.monthlyTarget.NH3 / 30,
  };

  for (let i = config.count - 1; i >= 0; i--) {
    const timestamp = new Date(endDate.getTime() - i * config.step);

    // 시간대별 변동 (낮에 더 많음)
    const hourFactor = timeRange === 'day'
      ? 0.7 + 0.6 * Math.sin((timestamp.getHours() - 6) * Math.PI / 12)
      : 1;

    // 랜덤 변동
    const variation = () => 0.8 + random.next() * 0.4;

    const multiplier = timeRange === 'day' ? 1 :
                      timeRange === 'week' ? 24 :
                      timeRange === 'month' ? 24 :
                      30 * 24;

    const point: ChartDataPoint = {
      timestamp: timestamp.toISOString(),
      label: config.format(timestamp),
      CH4: Math.round(baseEmissions[type].CH4 * headCount * hourFactor * variation() * multiplier * 10) / 10,
      CO2: Math.round(baseEmissions[type].CO2 * headCount * hourFactor * variation() * multiplier * 10) / 10,
      N2O: Math.round(baseEmissions[type].N2O * headCount * hourFactor * variation() * multiplier * 1000) / 1000,
      NH3: Math.round(baseEmissions[type].NH3 * headCount * hourFactor * variation() * multiplier * 10) / 10,
      target: timeRange === 'day' ? dailyTarget.CH4 :
              timeRange === 'week' ? dailyTarget.CH4 :
              timeRange === 'month' ? dailyTarget.CH4 :
              farm.monthlyTarget.CH4,
      average: Math.round(baseEmissions[type].CH4 * headCount * multiplier * 0.95 * 10) / 10,
    };

    data.push(point);
  }

  return data;
}

// 알림 생성
export function generateAlerts(farms: Farm[]): Alert[] {
  const alerts: Alert[] = [];
  const random = new SeededRandom(456);

  const alertTypes: AlertType[] = ['emission_exceeded', 'sensor_error', 'maintenance_required', 'target_achieved'];
  const severities: Record<AlertType, AlertSeverity[]> = {
    emission_exceeded: ['medium', 'high', 'critical'],
    sensor_error: ['medium', 'high'],
    maintenance_required: ['low', 'medium'],
    target_achieved: ['low'],
  };

  const messages: Record<AlertType, string[]> = {
    emission_exceeded: [
      '메탄 배출량이 목표치를 초과했습니다',
      '암모니아 농도가 기준치를 넘었습니다',
      '이산화탄소 배출량이 급증했습니다',
    ],
    sensor_error: [
      '센서 연결이 끊어졌습니다',
      '센서 데이터 이상이 감지되었습니다',
    ],
    maintenance_required: [
      '정기 점검이 필요합니다',
      '센서 교체 시기가 되었습니다',
    ],
    target_achieved: [
      '이번 달 감축 목표를 달성했습니다',
    ],
  };

  // 일부 농장에 대해 알림 생성
  const alertFarms = random.shuffle(farms).slice(0, 50);

  for (const farm of alertFarms) {
    const alertType = random.pick(alertTypes);
    const severity = random.pick(severities[alertType]);
    const message = random.pick(messages[alertType]);

    const alert: Alert = {
      id: `alert-${farm.id}-${Date.now()}-${random.nextInt(1, 1000)}`,
      farmId: farm.id,
      type: alertType,
      severity,
      message,
      details: `${farm.name}에서 ${message}`,
      gasType: alertType === 'emission_exceeded' ? random.pick(['CH4', 'CO2', 'N2O', 'NH3'] as GasType[]) : undefined,
      currentValue: alertType === 'emission_exceeded' ? 100 + random.next() * 50 : undefined,
      threshold: alertType === 'emission_exceeded' ? 100 : undefined,
      timestamp: new Date(Date.now() - random.nextInt(0, 7 * 24 * 60 * 60 * 1000)).toISOString(),
      isRead: random.next() > 0.7,
      isResolved: random.next() > 0.8,
    };

    alerts.push(alert);
  }

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// 절감 가이드 데이터
export const REDUCTION_GUIDES: ReductionGuide[] = [
  {
    id: 'guide-1',
    title: '조기 출하 프로그램',
    description: '사육 기간을 단축하여 전체 메탄 배출량을 줄입니다.',
    targetGas: ['CH4'],
    targetLivestock: ['beef_cattle'],
    expectedReduction: 10,
    difficulty: 'medium',
    category: 'management',
    tips: [
      '출하 시기를 2-3개월 앞당기면 마리당 메탄 배출량 10% 감소',
      '고급육 생산과 병행하여 수익성 유지',
      '사료 효율 개선과 함께 시행 권장',
    ],
  },
  {
    id: 'guide-2',
    title: '저메탄 사료 급여',
    description: '장내 발효를 억제하는 첨가제가 포함된 사료를 급여합니다.',
    targetGas: ['CH4'],
    targetLivestock: ['beef_cattle', 'dairy_cattle'],
    expectedReduction: 15,
    difficulty: 'easy',
    category: 'feed',
    tips: [
      '3-NOP 첨가제 사용 시 메탄 최대 30% 감소',
      '해조류 첨가 사료도 효과적',
      '사료비 증가분은 저탄소 인증 프리미엄으로 상쇄',
    ],
  },
  {
    id: 'guide-3',
    title: '분뇨 호기성 처리',
    description: '분뇨를 호기성 조건에서 처리하여 메탄 발생을 억제합니다.',
    targetGas: ['CH4', 'N2O'],
    targetLivestock: ['beef_cattle', 'dairy_cattle', 'pig'],
    expectedReduction: 20,
    difficulty: 'hard',
    category: 'manure',
    tips: [
      '교반 시스템 설치로 호기성 환경 유지',
      '퇴비화 과정에서 온도 관리 중요',
      '초기 시설 투자 필요하나 장기적 비용 절감',
    ],
  },
  {
    id: 'guide-4',
    title: '바이오가스 포집 시설',
    description: '분뇨에서 발생하는 메탄을 포집하여 에너지로 활용합니다.',
    targetGas: ['CH4', 'CO2'],
    targetLivestock: ['pig', 'dairy_cattle'],
    expectedReduction: 30,
    difficulty: 'hard',
    category: 'facility',
    tips: [
      '정부 보조금 활용 가능',
      '전력 자가 사용 또는 판매 수익 창출',
      '대규모 농장에 적합',
    ],
  },
  {
    id: 'guide-5',
    title: '환기 시스템 최적화',
    description: '축사 내 환기를 개선하여 가스 농도를 낮춥니다.',
    targetGas: ['NH3', 'CO2'],
    targetLivestock: ['beef_cattle', 'dairy_cattle', 'pig'],
    expectedReduction: 10,
    difficulty: 'medium',
    category: 'facility',
    tips: [
      '자동 환기 시스템으로 적정 농도 유지',
      '에너지 효율적인 팬 사용',
      '계절별 환기량 조절',
    ],
  },
  {
    id: 'guide-6',
    title: '질소 균형 사료 설계',
    description: '사료 내 단백질 함량을 최적화하여 질소 배출을 줄입니다.',
    targetGas: ['N2O', 'NH3'],
    targetLivestock: ['beef_cattle', 'dairy_cattle', 'pig'],
    expectedReduction: 12,
    difficulty: 'medium',
    category: 'feed',
    tips: [
      '아미노산 균형을 맞춘 사료 사용',
      '과잉 단백질 급여 지양',
      '성장 단계별 사료 조절',
    ],
  },
];

// 통계 계산
export function calculateStats(farms: Farm[], alerts: Alert[]) {
  const stats = {
    totalFarms: farms.length,
    farmsByLivestock: {
      beef_cattle: 0,
      dairy_cattle: 0,
      pig: 0,
    } as Record<LivestockType, number>,
    farmsByGrade: {
      A: 0,
      B: 0,
      C: 0,
    } as Record<CertificationGrade, number>,
    totalHeadCount: {
      beef_cattle: 0,
      dairy_cattle: 0,
      pig: 0,
    } as Record<LivestockType, number>,
    alertCount: alerts.filter(a => !a.isResolved).length,
    unreadAlertCount: alerts.filter(a => !a.isRead).length,
  };

  for (const farm of farms) {
    stats.farmsByLivestock[farm.livestock.type]++;
    stats.farmsByGrade[farm.certification.grade]++;
    stats.totalHeadCount[farm.livestock.type] += farm.livestock.headCount;
  }

  return stats;
}
