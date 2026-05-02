import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, MarkerF, MarkerClustererF, InfoWindowF } from '@react-google-maps/api';
import { useStore } from '../store/useStore';
import { StatCard } from '../components/common';
import { LIVESTOCK_INFO, Farm } from '../types';
import { dashboardStats } from '../data';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 36.5,
  lng: 127.5,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export function MapPage() {
  const navigate = useNavigate();
  const { filteredFarms, selectFarm, filters } = useStore();
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const livestockStats = useMemo(() => {
    return Object.entries(LIVESTOCK_INFO).map(([key, info]) => ({
      type: key,
      ...info,
      count: dashboardStats.farmsByLivestock[key as keyof typeof dashboardStats.farmsByLivestock],
      headCount: dashboardStats.totalHeadCount[key as keyof typeof dashboardStats.totalHeadCount],
    }));
  }, []);

  const handleMarkerClick = useCallback((farm: Farm) => {
    setSelectedFarm(farm);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedFarm(null);
  }, []);

  const handleViewDetail = useCallback((farm: Farm) => {
    selectFarm(farm.id);
    navigate(`/dashboard/${farm.id}`);
  }, [navigate, selectFarm]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Google Maps 로드 실패</h3>
          <p className="text-gray-600">네트워크 연결을 확인하거나 API 키를 확인해주세요.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">지도 로딩 중...</h3>
        </div>
      </div>
    );
  }

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
              icon={<span className="text-2xl">{stat.icon}</span>}
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

      {/* 구글 지도 */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={7}
          options={mapOptions}
        >
          <MarkerClustererF
            averageCenter
            enableRetinaIcons
            gridSize={60}
          >
            {(clusterer) => (
              <>
                {filteredFarms.map(farm => {
                  const livestockInfo = LIVESTOCK_INFO[farm.livestock.type];

                  return (
                    <MarkerF
                      key={farm.id}
                      position={{
                        lat: farm.location.coordinates.lat,
                        lng: farm.location.coordinates.lng,
                      }}
                      clusterer={clusterer}
                      onClick={() => handleMarkerClick(farm)}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: livestockInfo.color,
                        fillOpacity: 0.8,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                        scale: 8,
                      }}
                    />
                  );
                })}
              </>
            )}
          </MarkerClustererF>

          {/* InfoWindow */}
          {selectedFarm && (
            <InfoWindowF
              position={{
                lat: selectedFarm.location.coordinates.lat,
                lng: selectedFarm.location.coordinates.lng,
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="p-3" style={{ minWidth: '200px' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: LIVESTOCK_INFO[selectedFarm.livestock.type].color }}
                  />
                  <span className="font-semibold text-gray-900">{selectedFarm.name}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <p>{LIVESTOCK_INFO[selectedFarm.livestock.type].nameKo} {selectedFarm.livestock.headCount}두</p>
                  <p>{selectedFarm.location.sido} · {selectedFarm.certification.grade}등급</p>
                </div>
                <button
                  onClick={() => handleViewDetail(selectedFarm)}
                  className="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  상세 보기
                </button>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>

        {/* API 키 안내 오버레이 */}
        {GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' && (
          <div className="absolute inset-0 bg-white/95 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-xl p-8 shadow-2xl max-w-lg mx-4 text-center pointer-events-auto">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Google Maps API 키 필요</h3>
              <p className="text-gray-600 mb-4">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/pages/MapPage.tsx</code>의<br />
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">GOOGLE_MAPS_API_KEY</code>를<br />
                실제 API 키로 교체해주세요.
              </p>
              <a
                href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                API 키 발급받기
              </a>
              <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left">
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
          </div>
        )}
      </div>
    </div>
  );
}
