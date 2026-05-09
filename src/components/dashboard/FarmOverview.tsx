import { useState } from 'react';
import { Farm, LIVESTOCK_INFO } from '../../types';
import { Card, Modal } from '../common';

interface FarmOverviewProps {
  farm: Farm;
}

export function FarmOverview({ farm }: FarmOverviewProps) {
  const livestockInfo = LIVESTOCK_INFO[farm.livestock.type];
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = () => {
    setIsSending(true);
    // 실제로는 여기서 API 호출
    setTimeout(() => {
      alert(`${farm.owner} 대표님께 알림톡을 발송했습니다.`);
      setIsSending(false);
      setShowNotificationModal(false);
      setNotificationMessage('');
    }, 1000);
  };

  return (
    <>
      <Card padding="lg" className="backdrop-blur-xl bg-white/80">
        <div className="flex items-start justify-between">
          <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${livestockInfo.color}15` }}>
              {livestockInfo.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{farm.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{farm.owner} 대표</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">축종</p>
              <p className="text-sm font-semibold text-gray-900">{livestockInfo.nameKo}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">사육두수</p>
              <p className="text-sm font-semibold text-gray-900">{farm.livestock.headCount.toLocaleString()}두</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">농장규모</p>
              <p className="text-sm font-semibold text-gray-900">
                {farm.size === 'small' ? '소규모' : farm.size === 'medium' ? '중규모' : '대규모'}
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: farm.certification.grade === 'A' ? '#dcfce7' : farm.certification.grade === 'B' ? '#dbeafe' : '#fef3c7' }}>
              <p className="text-xs mb-1" style={{ color: farm.certification.grade === 'A' ? '#166534' : farm.certification.grade === 'B' ? '#1e40af' : '#854d0e' }}>인증등급</p>
              <p className="text-sm font-bold" style={{ color: farm.certification.grade === 'A' ? '#166534' : farm.certification.grade === 'B' ? '#1e40af' : '#854d0e' }}>
                {farm.certification.grade}등급
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {farm.location.address}
          </div>
          <button
            onClick={() => setShowNotificationModal(true)}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            알림톡
          </button>
        </div>
      </div>
    </Card>

    <Modal
      isOpen={showNotificationModal}
      onClose={() => setShowNotificationModal(false)}
      title={`${farm.owner} 대표님께 알림톡 보내기`}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            메시지 내용
          </label>
          <textarea
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            placeholder="농장주에게 전달할 메시지를 입력하세요..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">자동 추가 정보</p>
              <p className="text-xs">발신: 축산물품질평가원</p>
              <p className="text-xs">농장: {farm.name}</p>
              <p className="text-xs">인증등급: {farm.certification.grade}등급</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowNotificationModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSendNotification}
            disabled={!notificationMessage.trim() || isSending}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isSending ? '발송 중...' : '알림톡 발송'}
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
}
