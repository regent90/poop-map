import React, { useState, useRef } from 'react';
import { Poop, TranslationStrings, PrivacyLevel } from '../types';

interface PoopDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (poopData: Partial<Poop>) => void;
  translations: TranslationStrings;
  initialData?: {
    lat: number;
    lng: number;
    address?: string;
    placeName?: string;
  };
}

export const PoopDetailsModal: React.FC<PoopDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  translations,
  initialData
}) => {
  const [customLocation, setCustomLocation] = useState('');
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [privacy, setPrivacy] = useState<PrivacyLevel>('private');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const poopData: Partial<Poop> = {
      customLocation: customLocation.trim() || undefined,
      rating,
      notes: notes.trim() || undefined,
      photo: photo || undefined,
      address: initialData?.address,
      placeName: initialData?.placeName,
      privacy,
    };
    onSave(poopData);
    // Reset form
    setCustomLocation('');
    setRating(3);
    setNotes('');
    setPhoto(null);
    setPrivacy('private');
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return translations.excellent;
    if (rating >= 3.5) return translations.good;
    if (rating >= 2.5) return translations.average;
    if (rating >= 1.5) return translations.poor;
    return translations.terrible;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            💩 {translations.poopDetails}
          </h2>

          {/* Location Info */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 {translations.location}
            </label>
            {initialData?.placeName && (
              <div className="bg-gray-50 p-3 rounded-lg mb-2">
                <p className="font-medium text-gray-900">{initialData.placeName}</p>
                {initialData.address && (
                  <p className="text-sm text-gray-600">{initialData.address}</p>
                )}
              </div>
            )}
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder={translations.customLocation}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⭐ {translations.rating}
            </label>
            <div className="flex items-center space-x-1 mb-2">
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`text-2xl ${
                    value <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  {value % 1 === 0 ? '⭐' : '✨'}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {rating}/5 - {getRatingText(rating)}
            </p>
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 {translations.uploadPhoto}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors flex items-center justify-center"
            >
              {isUploading ? (
                <span>{translations.takingPhoto}</span>
              ) : photo ? (
                <span>✅ Photo uploaded</span>
              ) : (
                <span>📷 {translations.uploadPhoto}</span>
              )}
            </button>
            {photo && (
              <div className="mt-2">
                <img
                  src={photo}
                  alt="Poop photo"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 {translations.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your experience?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Privacy Settings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔒 {translations.privacy}
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={privacy === 'private'}
                  onChange={(e) => setPrivacy(e.target.value as PrivacyLevel)}
                  className="mr-2"
                />
                <span className="text-sm">🔒 {translations.private}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privacy"
                  value="friends"
                  checked={privacy === 'friends'}
                  onChange={(e) => setPrivacy(e.target.value as PrivacyLevel)}
                  className="mr-2"
                />
                <span className="text-sm">👥 {translations.friendsOnly}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={privacy === 'public'}
                  onChange={(e) => setPrivacy(e.target.value as PrivacyLevel)}
                  className="mr-2"
                />
                <span className="text-sm">🌍 {translations.public}</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {privacy === 'private' && 'Only you can see this poop'}
              {privacy === 'friends' && 'Only your friends can see this poop (photos remain private)'}
              {privacy === 'public' && 'Everyone can see this poop (photos remain private)'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {translations.cancel}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              {translations.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};