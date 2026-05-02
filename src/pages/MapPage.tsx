import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { StatCard } from '../components/common';
import { LIVESTOCK_INFO } from '../types';
import { dashboardStats } from '../data';

export function MapPage() {
  const navigate = useNavigate();
  const { filteredFarms, selectFarm, filters } = useStore();
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [clusterer, setClusterer] = useState<kakao.maps.MarkerClusterer | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [infoWindow, setInfoWindow] = useState<kakao.maps.CustomOverlay | null>(null);

  // 지도 초기화
  useEffect(() => {
    const container = document.getElementById('kakao-map');
    if (!container || map) return;

    // Kakao Map SDK가 로드되지 않은 경우 대비
    if (typeof kakao === 'undefined' || !kakao.maps) {
      console.warn('Kakao Map SDK not loaded. Using fallback map.');
      return;
    }

    const options = {
      center: new kakao.maps.LatLng(36.5, 127.5), // 대한민국 중심
      level: 13, // 전국이 보이는 레벨
    };

    const newMap = new kakao.maps.Map(container, options);
    setMap(newMap);

    // 클러스터러 생성
    const newClusterer = new kakao.maps.MarkerClusterer({
      map: newMap,
      averageCenter: true,
      minLevel: 10,
      disableClickZoom: true,
      styles: [
        {
          width: '50px',
          height: '50px',
          background: 'rgba(34, 197, 94, 0.8)',
          borderRadius: '50%',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 'bold',
          lineHeight: '50px',
        },
        {
          width: '60px',
          height: '60px',
          background: 'rgba(34, 197, 94, 0.9)',
          borderRadius: '50%',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 'bold',
          lineHeight: '60px',
        },
        {
          width: '70px',
          height: '70px',
          background: 'rgba(22, 163, 74, 1)',
          borderRadius: '50%',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 'bold',
          lineHeight: '70px',
        },
      ],
    });
    setClusterer(newClusterer);

    return () => {
      // Cleanup
    };
  }, []);

  // 마커 업데이트
  useEffect(() => {
    if (!map || !clusterer) return;

    // 기존 마커 제거
    clusterer.clear();

    if (infoWindow) {
      infoWindow.setMap(null);
    }

    // 새 마커 생성
    const markers: kakao.maps.Marker[] = [];

    filteredFarms.forEach(farm => {
      const position = new kakao.maps.LatLng(
        farm.location.coordinates.lat,
        farm.location.coordinates.lng
      );

      const livestockInfo = LIVESTOCK_INFO[farm.livestock.type];

      // 커스텀 마커 이미지
      const markerSize = new kakao.maps.Size(36, 36);
      const markerImage = new kakao.maps.MarkerImage(
        createMarkerSvg(livestockInfo.color),
        markerSize
      );

      const marker = new kakao.maps.Marker({
        position,
        image: markerImage,
      });

      // 마커 클릭 이벤트
      kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedMarkerId(farm.id);

        // 인포윈도우 내용
        const content = document.createElement('div');
        content.innerHTML = `
          <div style="
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 200px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: ${livestockInfo.color};
              "></span>
              <span style="font-size: 14px; font-weight: 600; color: #111;">${farm.name}</span>
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
              ${livestockInfo.nameKo} ${farm.livestock.headCount}두
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 12px;">
              ${farm.location.sido} · ${farm.certification.grade}등급
            </div>
            <button id="view-detail-${farm.id}" style="
              width: 100%;
              padding: 8px;
              background: #22c55e;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
            ">상세 보기</button>
          </div>
        `;

        // 기존 인포윈도우 닫기
        if (infoWindow) {
          infoWindow.setMap(null);
        }

        const newInfoWindow = new kakao.maps.CustomOverlay({
          position,
          content,
          xAnchor: 0.5,
          yAnchor: 1.3,
        });

        newInfoWindow.setMap(map);
        setInfoWindow(newInfoWindow);

        // 상세 보기 버튼 이벤트
        setTimeout(() => {
          const btn = document.getElementById(`view-detail-${farm.id}`);
          if (btn) {
            btn.onclick = () => {
              selectFarm(farm.id);
              navigate(`/dashboard/${farm.id}`);
            };
          }
        }, 0);
      });

      markers.push(marker);
    });

    // 클러스터러에 마커 추가
    clusterer.addMarkers(markers);
  }, [map, clusterer, filteredFarms, navigate, selectFarm]);

  // 마커 SVG 생성
  function createMarkerSvg(color: string): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="18" cy="18" r="6" fill="white"/>
      </svg>
    `;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // 축종별 통계
  const livestockStats = useMemo(() => {
    return Object.entries(LIVESTOCK_INFO).map(([key, info]) => ({
      type: key,
      ...info,
      count: dashboardStats.farmsByLivestock[key as keyof typeof dashboardStats.farmsByLivestock],
      headCount: dashboardStats.totalHeadCount[key as keyof typeof dashboardStats.totalHeadCount],
    }));
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* 상단 통계 카드 */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="전체 인증 농장"
            value={dashboardStats.totalFarms}
            unit="개"
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />
          {livestockStats.map(stat => (
            <StatCard
              key={stat.type}
              title={stat.nameKo}
              value={stat.count}
              unit="농장"
              color={
                stat.type === 'beef_cattle' ? 'yellow' :
                stat.type === 'dairy_cattle' ? 'blue' : 'red'
              }
              icon={
                <span className="text-2xl">{stat.icon}</span>
              }
            />
          ))}
        </div>
      </div>

      {/* 필터 상태 표시 */}
      {(filters.livestock.length > 0 || filters.grade.length > 0) && (
        <div className="px-4 py-2 bg-primary-50 border-b border-primary-100 flex items-center gap-2 text-sm">
          <span className="text-primary-700">필터 적용됨:</span>
          {filters.livestock.map(type => (
            <span
              key={type}
              className="px-2 py-1 bg-white rounded-full text-xs border"
              style={{ borderColor: LIVESTOCK_INFO[type].color, color: LIVESTOCK_INFO[type].color }}
            >
              {LIVESTOCK_INFO[type].nameKo}
            </span>
          ))}
          {filters.grade.map(grade => (
            <span
              key={grade}
              className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300"
            >
              {grade}등급
            </span>
          ))}
          <span className="text-primary-600 ml-auto">
            {filteredFarms.length}개 농장 표시 중
          </span>
        </div>
      )}

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        {/* Kakao Map이 로드되지 않은 경우 대체 UI */}
        <div
          id="kakao-map"
          className="w-full h-full"
          style={{ minHeight: '500px' }}
        />

        {/* Kakao Map SDK 미로드 시 대체 지도 */}
        {typeof kakao === 'undefined' && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex flex-col items-center justify-center">
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-lg mx-4 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">카카오 맵 API 연동 필요</h3>
              <p className="text-gray-600 mb-4">
                index.html의 Kakao Map SDK 스크립트에서<br />
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">YOUR_KAKAO_APP_KEY</code>를<br />
                실제 API 키로 교체해주세요.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-500 mb-2">전국 {dashboardStats.totalFarms}개 농장 데이터 준비 완료</p>
                <div className="flex flex-wrap gap-2">
                  {livestockStats.map(stat => (
                    <span
                      key={stat.type}
                      className="px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: stat.color }}
                    >
                      {stat.icon} {stat.nameKo} {stat.count}개
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 간이 농장 리스트 */}
            <div className="mt-6 max-w-2xl mx-4 w-full">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">농장 목록 (상위 10개)</h4>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  {filteredFarms.slice(0, 10).map(farm => (
                    <button
                      key={farm.id}
                      onClick={() => {
                        selectFarm(farm.id);
                        navigate(`/dashboard/${farm.id}`);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: LIVESTOCK_INFO[farm.livestock.type].color }}
                        />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{farm.name}</p>
                          <p className="text-xs text-gray-500">
                            {farm.location.sido} · {LIVESTOCK_INFO[farm.livestock.type].nameKo} {farm.livestock.headCount}두
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        farm.certification.grade === 'A' ? 'bg-green-100 text-green-700' :
                        farm.certification.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {farm.certification.grade}등급
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
