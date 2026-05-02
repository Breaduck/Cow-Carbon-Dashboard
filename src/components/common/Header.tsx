import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export function Header() {
  const location = useLocation();
  const { unreadAlertCount, toggleSidebar, alerts, markAlertAsRead } = useStore();
  const [showAlerts, setShowAlerts] = useState(false);

  const recentAlerts = alerts.filter(a => !a.isResolved).slice(0, 5);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="메뉴 토글"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">축산 저탄소 실측</h1>
            <p className="text-xs text-gray-500">축산물품질평가원 관리자</p>
          </div>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        <Link
          to="/"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === '/'
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          전국 현황
        </Link>
        <Link
          to="/dashboard"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname.startsWith('/dashboard')
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          농장 대시보드
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        {/* 알림 버튼 */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            aria-label="알림"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
              </span>
            )}
          </button>

          {/* 알림 드롭다운 */}
          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-medium text-gray-900">알림</span>
                <span className="text-xs text-gray-500">{unreadAlertCount}개 읽지 않음</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {recentAlerts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    새로운 알림이 없습니다
                  </div>
                ) : (
                  recentAlerts.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => markAlertAsRead(alert.id)}
                      className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${
                        !alert.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alert.timestamp).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link
                to="/dashboard"
                onClick={() => setShowAlerts(false)}
                className="block px-4 py-3 text-center text-sm text-primary-600 hover:bg-gray-50 border-t border-gray-100"
              >
                모든 알림 보기
              </Link>
            </div>
          )}
        </div>

        {/* 사용자 프로필 */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">관</span>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">관리자</span>
        </div>
      </div>
    </header>
  );
}
