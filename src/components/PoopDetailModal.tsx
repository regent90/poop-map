import React from 'react';
import { Poop, UserProfile, TranslationStrings } from '../types';
import { PoopInteractions } from './PoopInteractions';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface PoopDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  poop: Poop | null;
  currentUser: UserProfile | null;
  translations: TranslationStrings;
}

export const PoopDetailModal: React.FC<PoopDetailModalProps> = ({
  isOpen,
  onClose,
  poop,
  currentUser,
  translations: t
}) => {
  // 獲取便便作者的顯示名稱
  const poopAuthorDisplayName = useQuery(api.users.getUserDisplayName, 
    poop ? { email: poop.userId } : "skip"
  );

  if (!isOpen || !poop) return null;

  const date = new Date(poop.timestamp);
  const rating = poop.rating ? '⭐'.repeat(Math.floor(poop.rating)) + (poop.rating % 1 !== 0 ? '✨' : '') : '';
  const location = poop.customLocation || poop.placeName || '';
  const isOwnPoop = currentUser && poop.userId === currentUser.email;
  
  // 隱私設定顯示
  const privacyIcon = poop.privacy === 'private' ? '🔒' : poop.privacy === 'friends' ? '👥' : '🌍';
  const privacyText = poop.privacy === 'private' ? t.private : poop.privacy === 'friends' ? t.friendsOnly : t.public;

  // 判斷是否可以顯示互動功能
  const canShowInteractions = currentUser && (
    poop.privacy === 'public' || 
    isOwnPoop || 
    poop.privacy === 'friends' // 這裡應該檢查是否為好友，但為了簡化先允許
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-amber-800">💩 Poop Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* User info (if not own poop) */}
          {!isOwnPoop && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                👤 {poopAuthorDisplayName || poop.userId}
              </p>
            </div>
          )}

          {/* Basic info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-gray-700">
              <span className="mr-2">📅</span>
              <span>{date.toLocaleString()}</span>
            </div>

            {location && (
              <div className="flex items-center text-gray-700">
                <span className="mr-2">📍</span>
                <span>{location}</span>
              </div>
            )}

            {rating && (
              <div className="flex items-center text-gray-700">
                <span className="mr-2">⭐</span>
                <span>{rating} ({poop.rating}/5)</span>
              </div>
            )}

            <div className="flex items-center text-gray-700">
              <span className="mr-2">{privacyIcon}</span>
              <span>{privacyText}</span>
            </div>

            <div className="flex items-center text-gray-500 text-sm">
              <span className="mr-2">🗺️</span>
              <span>{poop.lat.toFixed(6)}, {poop.lng.toFixed(6)}</span>
            </div>
          </div>

          {/* Photo */}
          {poop.photo && isOwnPoop && (
            <div className="mb-4">
              <img 
                src={poop.photo} 
                alt="Poop photo" 
                className="w-full max-w-sm mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {poop.photo && !isOwnPoop && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">📷 Photo (private)</p>
            </div>
          )}

          {/* Notes */}
          {poop.notes && isOwnPoop && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{poop.notes}"</p>
            </div>
          )}

          {/* Interactions */}
          {canShowInteractions && currentUser && (
            <PoopInteractions
              poop={poop}
              currentUser={currentUser}
              translations={t}
              isVisible={true}
            />
          )}

          {/* No interactions message */}
          {!canShowInteractions && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">
                {!currentUser ? 'Login to interact with this poop' : 'This poop is private'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};