import { create } from 'zustand';
import { Farm, Alert, LivestockType, CertificationGrade, FarmSize, TimeRange } from '../types';
import { farms as initialFarms, alerts as initialAlerts } from '../data';

interface FilterState {
  livestock: LivestockType[];
  grade: CertificationGrade[];
  size: FarmSize[];
  sido: string[];
  searchQuery: string;
}

interface AppState {
  // 농장 데이터
  farms: Farm[];
  selectedFarmId: string | null;
  selectedFarm: Farm | null;

  // 필터
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;

  // 필터링된 농장
  filteredFarms: Farm[];

  // 농장 선택
  selectFarm: (farmId: string | null) => void;

  // 알림
  alerts: Alert[];
  unreadAlertCount: number;
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;

  // 시간 범위
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;

  // 사이드바
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // 모달
  isGuideModalOpen: boolean;
  openGuideModal: () => void;
  closeGuideModal: () => void;
}

const defaultFilters: FilterState = {
  livestock: [],
  grade: [],
  size: [],
  sido: [],
  searchQuery: '',
};

export const useStore = create<AppState>((set, get) => ({
  // 농장 데이터
  farms: initialFarms,
  selectedFarmId: null,
  selectedFarm: null,

  // 필터
  filters: defaultFilters,

  setFilter: (key, value) => {
    set((state) => {
      const newFilters = { ...state.filters, [key]: value };
      const filteredFarms = filterFarms(state.farms, newFilters);
      return { filters: newFilters, filteredFarms };
    });
  },

  resetFilters: () => {
    set((state) => ({
      filters: defaultFilters,
      filteredFarms: state.farms,
    }));
  },

  // 필터링된 농장 (초기에는 빈 배열 - 필터 선택 시에만 표시)
  filteredFarms: [],

  // 농장 선택
  selectFarm: (farmId) => {
    const farm = farmId ? get().farms.find(f => f.id === farmId) || null : null;
    set({ selectedFarmId: farmId, selectedFarm: farm });
  },

  // 알림
  alerts: initialAlerts,
  unreadAlertCount: initialAlerts.filter(a => !a.isRead).length,

  markAlertAsRead: (alertId) => {
    set((state) => {
      const alerts = state.alerts.map(a =>
        a.id === alertId ? { ...a, isRead: true } : a
      );
      return {
        alerts,
        unreadAlertCount: alerts.filter(a => !a.isRead).length,
      };
    });
  },

  markAllAlertsAsRead: () => {
    set((state) => ({
      alerts: state.alerts.map(a => ({ ...a, isRead: true })),
      unreadAlertCount: 0,
    }));
  },

  // 시간 범위
  timeRange: 'day',
  setTimeRange: (range) => set({ timeRange: range }),

  // 사이드바
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // 모달
  isGuideModalOpen: false,
  openGuideModal: () => set({ isGuideModalOpen: true }),
  closeGuideModal: () => set({ isGuideModalOpen: false }),
}));

// 필터 헬퍼 함수
function filterFarms(farms: Farm[], filters: FilterState): Farm[] {
  return farms.filter(farm => {
    // 축종 필터 (비어있으면 모든 축종 허용)
    if (filters.livestock.length > 0 && !filters.livestock.includes(farm.livestock.type)) {
      return false;
    }

    // 등급 필터 (비어있으면 모든 등급 허용)
    if (filters.grade.length > 0 && !filters.grade.includes(farm.certification.grade)) {
      return false;
    }

    // 규모 필터
    if (filters.size.length > 0 && !filters.size.includes(farm.size)) {
      return false;
    }

    // 시도 필터
    if (filters.sido.length > 0 && !filters.sido.includes(farm.location.sido)) {
      return false;
    }

    // 검색어 필터
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        farm.name.toLowerCase().includes(query) ||
        farm.owner.toLowerCase().includes(query) ||
        farm.location.sido.includes(query)
      );
    }

    return true;
  });
}
