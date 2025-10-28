import React from 'react';
import { Poop, TranslationStrings } from '../types';

interface PoopDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  poop: Poop | null;
  translations: TranslationStrings;
  poopNumber: number;
}

export const PoopDetailView: React.FC<PoopDetailViewProps> = ({
  isOpen,
  onClose,
  poop,
  translations,
  poopNumber
}) => {
  if (!isOpen || !poop) return null;

  const date = new Date(poop.timestamp);
  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return translations.excellent;
    if (rating >= 3.5) return translations.good;
    if (rating >= 2.5) return translations.average;
    if (rating >= 1.5) return translations.poor;
    return translations.terrible;
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              💩 #{poopNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Date & Time */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                📅 {translations.language === 'zh-TW' ? '時間' : translations.language === 'zh-CN' ? '时间' : translations.language === 'ja' ? '時間' : translations.language === 'ko' ? '시간' : translations.language === 'es' ? 'Tiempo' : translations.language === 'fr' ? 'Temps' : translations.language === 'de' ? 'Zeit' : 'Time'}
              </h3>
              <p className="text-gray-700">
                {date.toLocaleDateString(undefined, { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-gray-600 text-sm">
                {date.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              📍 {translations.location}
            </h3>
            
            {/* Google Place Name */}
            {poop.placeName && (
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="font-medium text-blue-900">{poop.placeName}</p>
                <p className="text-sm text-blue-700">
                  {translations.language === 'zh-TW' ? 'Google 地標' : 
                   translations.language === 'zh-CN' ? 'Google 地标' :
                   translations.language === 'ja' ? 'Googleランドマーク' :
                   translations.language === 'ko' ? 'Google 랜드마크' :
                   translations.language === 'es' ? 'Lugar de Google' :
                   translations.language === 'fr' ? 'Lieu Google' :
                   translations.language === 'de' ? 'Google-Ort' :
                   'Google Place'}
                </p>
              </div>
            )}

            {/* Address */}
            {poop.address && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-gray-700 text-sm">{poop.address}</p>
              </div>
            )}

            {/* Custom Location */}
            {poop.customLocation && (
              <div className="bg-green-50 rounded-lg p-3 mb-3">
                <p className="font-medium text-green-900">{poop.customLocation}</p>
                <p className="text-sm text-green-700">{translations.customLocation}</p>
              </div>
            )}

            {/* Coordinates */}
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-mono">
                {formatCoordinates(poop.lat, poop.lng)}
              </p>
              <button
                onClick={() => {
                  const url = `https://www.google.com/maps?q=${poop.lat},${poop.lng}`;
                  window.open(url, '_blank');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                🗺️ {translations.language === 'zh-TW' ? '在 Google Maps 中查看' : 
                     translations.language === 'zh-CN' ? '在 Google Maps 中查看' :
                     translations.language === 'ja' ? 'Google Mapsで見る' :
                     translations.language === 'ko' ? 'Google Maps에서 보기' :
                     translations.language === 'es' ? 'Ver en Google Maps' :
                     translations.language === 'fr' ? 'Voir dans Google Maps' :
                     translations.language === 'de' ? 'In Google Maps anzeigen' :
                     'View in Google Maps'}
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              ⭐ {translations.rating}
            </h3>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-2xl">
                  {'⭐'.repeat(Math.floor(poop.rating))}
                  {poop.rating % 1 !== 0 && '✨'}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {poop.rating}/5
                </span>
              </div>
              <p className="text-yellow-800 font-medium">
                {getRatingText(poop.rating)}
              </p>
            </div>
          </div>

          {/* Photo */}
          {poop.photo && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                📷 {translations.language === 'zh-TW' ? '照片' : 
                     translations.language === 'zh-CN' ? '照片' :
                     translations.language === 'ja' ? '写真' :
                     translations.language === 'ko' ? '사진' :
                     translations.language === 'es' ? 'Foto' :
                     translations.language === 'fr' ? 'Photo' :
                     translations.language === 'de' ? 'Foto' :
                     'Photo'}
              </h3>
              <div className="rounded-lg overflow-hidden">
                <img
                  src={poop.photo}
                  alt="Poop photo"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {poop.notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                📝 {translations.notes}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 italic">"{poop.notes}"</p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {translations.language === 'zh-TW' ? '關閉' : 
               translations.language === 'zh-CN' ? '关闭' :
               translations.language === 'ja' ? '閉じる' :
               translations.language === 'ko' ? '닫기' :
               translations.language === 'es' ? 'Cerrar' :
               translations.language === 'fr' ? 'Fermer' :
               translations.language === 'de' ? 'Schließen' :
               'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};