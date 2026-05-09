import { useMemo, useState } from 'react';
import { Farm } from '../../types';

interface PerformanceCalendarProps {
  farm: Farm;
}

// 일일 성과 타입
type DayPerformance = 'good' | 'mediocre' | 'poor' | 'none';

export function PerformanceCalendar({ farm }: PerformanceCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 현재 월의 달력 데이터 생성
  const calendarData = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;

    // 이번 달 첫날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 첫 주 시작 (일요일부터)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // 마지막 주 끝
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    // 주별 데이터 생성
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      currentWeek.push(new Date(current));

      if (current.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { year, month, weeks, today };
  }, [currentYear, currentMonth]);

  // 날짜별 성과 계산 (시뮬레이션)
  const getDayPerformance = (date: Date): DayPerformance => {
    const today = calendarData.today;

    // 미래 날짜는 표시 안 함
    if (date > today) return 'none';

    // 이번 달이 아니면 표시 안 함
    if (date.getMonth() !== calendarData.month) return 'none';

    // 시뮬레이션: 날짜 기반 성과 생성 (실제로는 farm의 일일 배출량 데이터 사용)
    const dayOfMonth = date.getDate();
    const hash = (farm.id.charCodeAt(0) + dayOfMonth) % 10;

    if (hash < 6) return 'good';      // 60% 확률
    if (hash < 9) return 'mediocre';  // 30% 확률
    return 'poor';                     // 10% 확률
  };

  // 날짜별 상세 정보
  const getDayDetail = (date: Date, performance: DayPerformance) => {
    if (performance === 'none') return null;

    if (performance === 'good') {
      return {
        title: '잘함',
        details: [
          '전일 대비 배출량 2.3% 감소',
          '목표치 대비 95% 달성',
          '환기 시스템 정상 가동'
        ],
        color: 'bg-green-50 border-green-500 text-green-800'
      };
    } else if (performance === 'mediocre') {
      return {
        title: '보통',
        details: [
          '전일 대비 배출량 3.1% 증가',
          '목표치 대비 88% 달성',
          '분뇨 처리 주기 확인 필요'
        ],
        color: 'bg-yellow-50 border-yellow-500 text-yellow-800'
      };
    } else {
      return {
        title: '부족',
        details: [
          '전일 대비 배출량 7.2% 증가',
          '목표치 대비 78% 달성',
          '환기 시스템 점검 권장'
        ],
        color: 'bg-red-50 border-red-500 text-red-800'
      };
    }
  };

  // 월별 통계
  const monthStats = useMemo(() => {
    let good = 0;
    let mediocre = 0;
    let poor = 0;

    calendarData.weeks.forEach(week => {
      week.forEach(date => {
        const perf = getDayPerformance(date);
        if (perf === 'good') good++;
        else if (perf === 'mediocre') mediocre++;
        else if (perf === 'poor') poor++;
      });
    });

    return { good, mediocre, poor, total: good + mediocre + poor };
  }, [calendarData]);

  // 월별 인사이트
  const monthlyInsight = useMemo(() => {
    const goodRatio = monthStats.total > 0 ? (monthStats.good / monthStats.total) * 100 : 0;
    const poorRatio = monthStats.total > 0 ? (monthStats.poor / monthStats.total) * 100 : 0;

    if (goodRatio >= 80) {
      return {
        icon: '🎉',
        message: '이번 달 정말 잘하셨어요! 이대로만 유지하면 1년 인증 유지 완벽합니다',
        color: 'text-green-700 bg-green-50 border-green-500'
      };
    } else if (goodRatio >= 60) {
      return {
        icon: '👍',
        message: '좋습니다! 조금만 더 신경쓰면 완벽한 한 달이 될 거예요',
        color: 'text-blue-700 bg-blue-50 border-blue-500'
      };
    } else if (poorRatio >= 30) {
      return {
        icon: '⚠️',
        message: '주의가 필요합니다. 부족한 날이 많아요. 개선 제안을 참고해주세요',
        color: 'text-red-700 bg-red-50 border-red-500'
      };
    } else {
      return {
        icon: '😊',
        message: '평범한 한 달이에요. 조금만 더 노력하면 더 좋아질 거예요',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-500'
      };
    }
  }, [monthStats]);

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-bold text-gray-900">월간 성과 캘린더</h4>
        <button
          onClick={goToToday}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          오늘
        </button>
      </div>

      {/* 월별 인사이트 */}
      <div className={`mb-4 p-4 rounded-lg border-2 ${monthlyInsight.color}`}>
        <div className="flex items-start gap-2">
          <span className="text-2xl">{monthlyInsight.icon}</span>
          <div className="flex-1">
            <p className="font-semibold mb-2">{monthlyInsight.message}</p>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                잘함: {monthStats.good}일
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                보통: {monthStats.mediocre}일
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                부족: {monthStats.poor}일
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 캘린더 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* 년도/월 네비게이션 */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center font-bold text-gray-900">
            {calendarData.year}년 {monthNames[calendarData.month]}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 */}
        <div className="space-y-3">
          {calendarData.weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-3">
              {week.map((date, dayIdx) => {
                const performance = getDayPerformance(date);
                const isToday = date.toDateString() === calendarData.today.toDateString();
                const isCurrentMonth = date.getMonth() === calendarData.month;

                let bgColor = 'bg-gray-200';
                if (performance === 'good') bgColor = 'bg-green-500';
                else if (performance === 'mediocre') bgColor = 'bg-yellow-500';
                else if (performance === 'poor') bgColor = 'bg-red-500';

                return (
                  <div key={dayIdx} className="flex flex-col items-center gap-1">
                    {/* 성과 원 (큰 원) */}
                    <button
                      onClick={() => performance !== 'none' ? setSelectedDate(date) : null}
                      className={`w-7 h-7 rounded-full ${bgColor} ${performance !== 'none' ? 'cursor-pointer hover:scale-110' : 'opacity-30'} transition-all flex items-center justify-center`}
                      disabled={performance === 'none'}
                    >
                      {isToday && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                    {/* 날짜 숫자 */}
                    <span className={`text-xs ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'} ${isToday ? 'font-bold' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>잘함 (전일대비 유지/감소)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span>보통 (5% 미만 증가)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span>부족 (5% 이상 증가)</span>
        </div>
      </div>

      {/* 날짜 상세 팝업 */}
      {selectedDate && (() => {
        const performance = getDayPerformance(selectedDate);
        const detail = getDayDetail(selectedDate, performance);
        if (!detail) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setSelectedDate(null)}>
            <div className={`bg-white rounded-lg p-4 shadow-xl max-w-sm mx-4 border-2 ${detail.color}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-sm">
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 - {detail.title}
                </h5>
                <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ul className="space-y-1.5 text-xs">
                {detail.details.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
