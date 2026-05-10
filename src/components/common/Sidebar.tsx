import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { dashboardStats } from '../../data';
import { LIVESTOCK_INFO } from '../../types';
import { useState, useRef, useEffect } from 'react';

export function Sidebar() {
  const location = useLocation();
  const { isSidebarOpen, filters, setFilter, resetFilters, toggleSidebar } = useStore();
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const sidebarRef = useRef<HTMLElement>(null);

  // 스와이프 감지 (버튼이나 링크가 아닌 경우에만)
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // 버튼이나 링크, input 등 인터랙티브 요소인 경우 스와이프 비활성화
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT' ||
        target.closest('button') || target.closest('a')) {
      return;
    }
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === 0) return; // touchStart가 없으면 무시
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === 0) return; // touchStart가 없으면 무시
    if (touchStart - touchEnd > 75) {
      // 왼쪽으로 75px 이상 스와이프
      toggleSidebar();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    if (!isSidebarOpen) {
      setTouchStart(0);
      setTouchEnd(0);
    }
  }, [isSidebarOpen]);

  if (!isSidebarOpen) {
    return null;
  }

  const livestockTypes = ['beef_cattle', 'pig', 'dairy_cattle'] as const;
  const grades = ['A', 'B', 'C'] as const;

  return (
    <>
      {/* 모바일 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-30 sm:hidden"
        onClick={() => toggleSidebar()}
      />

      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="fixed sm:sticky w-full sm:w-64 max-w-[240px] sm:max-w-none bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-64px)] top-16 left-0 z-40 sm:z-auto"
      >
      {/* 통계 요약 */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          전체 현황
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">인증 농장</span>
            <span className="text-xs sm:text-sm font-bold text-gray-900">{dashboardStats.totalFarms}개</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">활성 알림</span>
            <span className="text-xs sm:text-sm font-bold text-red-600">{dashboardStats.alertCount}건</span>
          </div>
        </div>
      </div>

      {/* 축종별 필터 */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            축종별 필터
          </h3>
          {filters.livestock.length > 0 && (
            <button
              onClick={() => setFilter('livestock', [])}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              초기화
            </button>
          )}
        </div>
        <div className="space-y-2">
          {livestockTypes.map(type => {
            const info = LIVESTOCK_INFO[type];
            const count = dashboardStats.farmsByLivestock[type];
            const isSelected = filters.livestock.includes(type);

            return (
              <button
                key={type}
                onClick={() => {
                  if (isSelected) {
                    setFilter('livestock', filters.livestock.filter(t => t !== type));
                  } else {
                    setFilter('livestock', [...filters.livestock, type]);
                  }
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                  <span>{info.nameKo}</span>
                </div>
                <span className="text-xs text-gray-500">{count}개</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 인증 등급 필터 */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            인증 등급
          </h3>
          {filters.grade.length > 0 && (
            <button
              onClick={() => setFilter('grade', [])}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              초기화
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {grades.map(grade => {
            const isSelected = filters.grade.includes(grade);
            const count = dashboardStats.farmsByGrade[grade];

            return (
              <button
                key={grade}
                onClick={() => {
                  if (isSelected) {
                    setFilter('grade', filters.grade.filter(g => g !== grade));
                  } else {
                    setFilter('grade', [...filters.grade, grade]);
                  }
                }}
                className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? grade === 'A' ? 'bg-green-100 text-green-700 border border-green-200' :
                      grade === 'B' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div>{grade}등급</div>
                <div className="text-xs opacity-70">{count}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="p-3 sm:p-4 flex-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          메뉴
        </h3>
        <nav className="space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
              location.pathname === '/'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            전국 지도
          </Link>
          <Link
            to="/regional-stats"
            className={`flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
              location.pathname === '/regional-stats'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            지역별 현황
          </Link>
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
              location.pathname.startsWith('/dashboard')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            농장 대시보드
          </Link>
        </nav>
      </div>

      {/* 하단 */}
      <div className="p-3 sm:p-4 border-t border-gray-100">
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          모든 필터 초기화
        </button>
      </div>
    </aside>
    </>
  );
}
