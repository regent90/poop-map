import React, { useState, useEffect } from 'react';
import { getCurrentDatabaseProvider } from '../services/unifiedDatabase';
import { DataMigrationTool } from './DataMigrationTool';
import { MongoMigrationTool } from './MongoMigrationTool';

export const DatabaseDebugger: React.FC = () => {
  const [currentProvider, setCurrentProvider] = useState<string>('loading...');
  const [localStorageData, setLocalStorageData] = useState<any[]>([]);
  const [showMigrationTool, setShowMigrationTool] = useState(false);
  const [showMongoTool, setShowMongoTool] = useState(false);

  useEffect(() => {
    // 檢查當前數據庫提供者
    getCurrentDatabaseProvider().then(provider => {
      setCurrentProvider(provider);
    });

    // 檢查 localStorage 中的便便數據
    const checkLocalStorage = () => {
      const allPoops: any[] = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('poops_')) {
          try {
            const userEmail = key.replace('poops_', '');
            const poops = JSON.parse(localStorage.getItem(key) || '[]');
            poops.forEach((poop: any) => {
              allPoops.push({
                ...poop,
                userEmail,
                source: 'localStorage'
              });
            });
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
          }
        }
      });
      
      setLocalStorageData(allPoops);
    };

    checkLocalStorage();
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  return (
    <div className="fixed top-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">🔍 數據庫調試器</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setShowMongoTool(!showMongoTool)}
            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
          >
            MongoDB
          </button>
          <button
            onClick={() => setShowMigrationTool(!showMigrationTool)}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Supabase
          </button>
        </div>
      </div>

      {showMongoTool && (
        <div className="mb-4">
          <MongoMigrationTool />
        </div>
      )}

      {showMigrationTool && (
        <div className="mb-4">
          <DataMigrationTool />
        </div>
      )}
      
      <div className="space-y-3">
        {/* 當前數據庫提供者 */}
        <div className="bg-blue-50 p-3 rounded">
          <h4 className="font-semibold text-blue-800">當前數據庫</h4>
          <p className="text-sm text-blue-600">
            {currentProvider === 'supabase' && '🟢 Supabase (主要)'}
            {currentProvider === 'firebase' && '🔥 Firebase (備選)'}
            {currentProvider === 'localStorage' && '💾 localStorage (離線)'}
          </p>
        </div>

        {/* localStorage 數據 */}
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-semibold text-gray-800">本地存儲數據</h4>
          <p className="text-sm text-gray-600 mb-2">
            找到 {localStorageData.length} 筆便便記錄
          </p>
          
          {localStorageData.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {localStorageData.map((poop, index) => (
                <div key={index} className="bg-white p-2 rounded border text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">#{index + 1}</div>
                      <div className="text-gray-600">用戶: {poop.userEmail}</div>
                      <div className="text-gray-600">時間: {formatTimestamp(poop.timestamp)}</div>
                      <div className="text-gray-600">位置: {poop.lat?.toFixed(4)}, {poop.lng?.toFixed(4)}</div>
                      <div className="text-gray-600">隱私: {poop.privacy}</div>
                      {poop.placeName && <div className="text-gray-600">地點: {poop.placeName}</div>}
                    </div>
                    <div className="text-lg">
                      {poop.privacy === 'private' && '🔒'}
                      {poop.privacy === 'friends' && '👥'}
                      {poop.privacy === 'public' && '🌍'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">沒有找到本地數據</p>
          )}
        </div>

        {/* 數據庫位置指南 */}
        <div className="bg-yellow-50 p-3 rounded">
          <h4 className="font-semibold text-yellow-800">查看數據位置</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            {currentProvider === 'mongodb' && (
              <>
                <p>• MongoDB Atlas: poops 集合</p>
                <p>• 備份: 瀏覽器 localStorage</p>
              </>
            )}
            {currentProvider === 'supabase' && (
              <>
                <p>• Supabase: Table Editor → poops 表</p>
                <p>• 備份: 瀏覽器 localStorage</p>
              </>
            )}
            {currentProvider === 'firebase' && (
              <>
                <p>• Firebase: Firestore → poops 集合</p>
                <p>• 備份: 瀏覽器 localStorage</p>
              </>
            )}
            {currentProvider === 'localStorage' && (
              <p>• 僅存儲在瀏覽器 localStorage</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};