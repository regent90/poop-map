import React, { useState } from 'react';
import { CapacitorService } from '../services/capacitorService';

export const CapacitorTest: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [platform, setPlatform] = useState<string>('');
  const [isNative, setIsNative] = useState<boolean>(false);

  React.useEffect(() => {
    setPlatform(CapacitorService.getPlatform());
    setIsNative(CapacitorService.isNative());
  }, []);

  const testLocation = async () => {
    const pos = await CapacitorService.getCurrentPosition();
    setLocation(pos);
  };

  const testHaptics = async () => {
    await CapacitorService.hapticFeedback('medium');
  };

  const testShare = async () => {
    await CapacitorService.shareContent(
      '便便地圖',
      '快來試試這個有趣的便便記錄應用！',
      'https://poop-map.vercel.app'
    );
  };

  const testCamera = async () => {
    const image = await CapacitorService.takePicture();
    if (image) {
      console.log('Photo taken:', image.substring(0, 50) + '...');
    }
  };

  if (!isNative) {
    return (
      <div className=\"p-4 bg-blue-100 rounded-lg m-4\">
        <h3 className=\"font-bold text-lg mb-2\">Capacitor 測試面板</h3>
        <p className=\"text-sm text-gray-600 mb-4\">
          當前平台: {platform} (Web 環境)
        </p>
        <p className=\"text-sm text-yellow-600\">
          某些功能僅在原生應用中可用
        </p>
      </div>
    );
  }

  return (
    <div className=\"p-4 bg-green-100 rounded-lg m-4\">
      <h3 className=\"font-bold text-lg mb-2\">Capacitor 測試面板</h3>
      <p className=\"text-sm text-gray-600 mb-4\">
        當前平台: {platform} (原生應用)
      </p>
      
      <div className=\"space-y-2\">
        <button
          onClick={testLocation}
          className=\"w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600\"
        >
          測試定位服務
        </button>
        
        <button
          onClick={testHaptics}
          className=\"w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600\"
        >
          測試觸覺反饋
        </button>
        
        <button
          onClick={testShare}
          className=\"w-full p-2 bg-green-500 text-white rounded hover:bg-green-600\"
        >
          測試分享功能
        </button>
        
        <button
          onClick={testCamera}
          className=\"w-full p-2 bg-red-500 text-white rounded hover:bg-red-600\"
        >
          測試相機功能
        </button>
      </div>
      
      {location && (
        <div className=\"mt-4 p-2 bg-white rounded\">
          <p className=\"text-sm\">
            位置: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};