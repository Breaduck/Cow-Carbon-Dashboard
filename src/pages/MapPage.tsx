import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useStore } from '../store/useStore';
import { StatCard } from '../components/common';
import { LIVESTOCK_INFO, Farm, LivestockType } from '../types';
import { dashboardStats } from '../data';

const STORAGE_KEY = 'google_maps_api_key';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 36.5,
  lng: 127.5,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy',
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
  const { farms, filteredFarms, selectFarm, filters, setFilter } = useStore();
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  // 환경 변수 우선, 없으면 localStorage 확인
  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState(() => envApiKey || localStorage.getItem(STORAGE_KEY) || '');
  const [inputKey, setInputKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey && !envApiKey);
  const [mapCenter] = useState(defaultCenter);
  const [mapZoom] = useState(7);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(true);

  // 검색어 필터링 추가
  const displayFarms = useMemo(() => {
    let result = filteredFarms;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = farms.filter(farm =>
        farm.name.toLowerCase().includes(query) ||
        farm.owner.toLowerCase().includes(query) ||
        farm.location.sido.includes(query)
      );
    }

    return result;
  }, [filteredFarms, farms, searchQuery]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || 'dummy-key-to-prevent-error',
  });

  const handleSaveApiKey = useCallback(() => {
    if (inputKey.trim()) {
      localStorage.setItem(STORAGE_KEY, inputKey.trim());
      setApiKey(inputKey.trim());
      setShowApiKeyInput(false);
      window.location.reload();
    }
  }, [inputKey]);

  const handleChangeApiKey = useCallback(() => {
    setShowApiKeyInput(true);
  }, []);

  const livestockStats = useMemo(() => {
    // 한우, 돼지, 젖소 순서로 정렬
    const order: Array<keyof typeof LIVESTOCK_INFO> = ['beef_cattle', 'pig', 'dairy_cattle'];
    return order.map((key) => ({
      type: key,
      ...LIVESTOCK_INFO[key],
      count: dashboardStats.farmsByLivestock[key],
      headCount: dashboardStats.totalHeadCount[key],
    }));
  }, []);

  const handleLivestockClick = useCallback((livestockType: string) => {
    // 현재 필터에 해당 축종이 있으면 제거, 없으면 추가
    const currentLivestock = [...filters.livestock];
    const index = currentLivestock.indexOf(livestockType as LivestockType);

    if (index > -1) {
      currentLivestock.splice(index, 1);
    } else {
      currentLivestock.push(livestockType as LivestockType);
    }

    setFilter('livestock', currentLivestock);
  }, [filters.livestock, setFilter]);

  // 디버깅: 농장 데이터 확인
  console.log('MapPage Debug:', {
    totalFarms: displayFarms.length,
    firstFarm: displayFarms[0],
    sampleCoordinates: displayFarms.slice(0, 3).map(f => ({
      name: f.name,
      lat: f.location.coordinates.lat,
      lng: f.location.coordinates.lng,
    })),
  });

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

  // API 키가 없으면 입력 화면 표시
  if (showApiKeyInput) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl p-8 shadow-2xl max-w-lg mx-4 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Google Maps API 키 입력</h3>
          <p className="text-gray-600 mb-4">
            지도를 사용하려면 Google Maps API 키가 필요합니다.
          </p>

          <div className="mb-4">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="API 키를 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
          </div>

          <button
            onClick={handleSaveApiKey}
            disabled={!inputKey.trim()}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors mb-3"
          >
            저장하고 시작하기
          </button>

          <a
            href="https://developers.google.com/maps/documentation/javascript/get-api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-primary-600 hover:text-primary-700 text-sm underline"
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
    );
  }

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
      {/* 검색바 */}
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="농장명, 농장주명, 지역 검색..."
              className="w-full px-3 py-1.5 pl-8 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-xs"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 transition-colors flex items-center gap-1"
          >
            {showStats ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                숨기기
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                보기
              </>
            )}
          </button>
        </div>
      </div>

      {/* 상단 통계 카드 */}
      {showStats && (
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
              onClick={() => {
                // 토글: 모든 축종이 선택되어 있으면 초기화, 아니면 전체 선택
                if (filters.livestock.length === 3) {
                  setFilter('livestock', []);
                } else {
                  setFilter('livestock', ['beef_cattle', 'pig', 'dairy_cattle']);
                }
                setFilter('grade', []);
                setFilter('sido', []);
                setSearchQuery('');
              }}
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
                onClick={() => handleLivestockClick(stat.type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 필터 상태 표시 */}
      {(filters.livestock.length > 0 || filters.grade.length > 0 || filters.sido.length > 0 || searchQuery) && (
        <div className="px-4 py-2 bg-primary-50 border-b border-primary-100 flex items-center gap-2 text-sm flex-wrap">
          <span className="text-primary-700">필터 적용됨:</span>
          {searchQuery && (
            <span className="px-2 py-1 bg-white rounded-full text-xs border border-primary-500 text-primary-700 font-semibold flex items-center gap-1">
              검색: {searchQuery}
              <button onClick={() => setSearchQuery('')} className="hover:text-primary-900">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.sido.map(sido => (
            <span
              key={sido}
              className="px-2 py-1 bg-white rounded-full text-xs border border-primary-500 text-primary-700 font-semibold"
            >
              {sido.replace(/특별시|광역시|특별자치시|특별자치도|도$/g, '')}
            </span>
          ))}
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
            {displayFarms.length}개 농장 표시 중
          </span>
        </div>
      )}

      {/* 구글 지도 */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={mapOptions}
          onLoad={() => console.log('Google Map loaded!')}
        >
          {displayFarms.map(farm => {
            const livestockInfo = LIVESTOCK_INFO[farm.livestock.type];

            return (
              <MarkerF
                key={farm.id}
                position={{
                  lat: farm.location.coordinates.lat,
                  lng: farm.location.coordinates.lng,
                }}
                onClick={() => handleMarkerClick(farm)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: livestockInfo.color,
                  fillOpacity: 0.8,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 8,
                }}
                onLoad={() => console.log('Marker loaded:', farm.name)}
              />
            );
          })}

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

        {/* API 키 변경 버튼 */}
        <button
          onClick={handleChangeApiKey}
          className="absolute bottom-4 right-4 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-sm text-gray-700 transition-colors"
        >
          API 키 변경
        </button>
      </div>
    </div>
  );
}
