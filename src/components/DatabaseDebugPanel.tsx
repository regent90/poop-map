import React, { useState, useEffect } from 'react';
import { clearDatabaseProviderCache } from '../services/unifiedDatabase';

export const DatabaseDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    try {
      // 檢查環境變數
      const envInfo = {
        hasSupabaseConfig: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
        hasFirebaseConfig: !!(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID),
        isOnline: navigator.onLine
      };

      // 測試 MongoDB 後端 API
      let mongoStatus = 'unknown';
      try {
        const response = await fetch('/api/test');
        const result = await response.json();
        mongoStatus = result.success ? 'available' : 'failed';
      } catch (error) {
        mongoStatus = 'error';
      }

      // 測試 MongoDB 連接
      let mongoConnectionTest = 'unknown';
      try {
        const { checkMongoBackendConnection } = await import('../services/mongoBackendAPI');
        mongoConnectionTest = await checkMongoBackendConnection() ? 'connected' : 'failed';
      } catch (error) {
        mongoConnectionTest = 'error';
      }

      setDebugInfo({
        ...envInfo,
        mongoStatus,
        mongoConnectionTest,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Debug check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forceMongoDB = async () => {
    setIsLoading(true);
    try {
      // 清除緩存
      clearDatabaseProviderCache();
      
      // 強制重新載入頁面來重新選擇數據庫
      window.location.reload();
    } catch (error) {
      console.error('Force MongoDB failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-lg">
      <h3 className="font-bold text-lg mb-4 text-blue-800">🔍 數據庫調試面板</h3>
      
      <div className="space-y-3">
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium text-gray-800 mb-2">環境配置:</h4>
          <div className="text-sm space-y-1">
            <div>Supabase: {debugInfo.hasSupabaseConfig ? '✅ 已配置' : '❌ 未配置'}</div>
            <div>Firebase: {debugInfo.hasFirebaseConfig ? '✅ 已配置' : '❌ 未配置'}</div>
            <div>網絡狀態: {debugInfo.isOnline ? '🟢 在線' : '🔴 離線'}</div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded">
          <h4 className="font-medium text-gray-800 mb-2">MongoDB 狀態:</h4>
          <div className="text-sm space-y-1">
            <div>後端 API: {
              debugInfo.mongoStatus === 'available' ? '✅ 可用' :
              debugInfo.mongoStatus === 'failed' ? '❌ 失敗' :
              debugInfo.mongoStatus === 'error' ? '🔴 錯誤' : '⏳ 檢查中...'
            }</div>
            <div>連接測試: {
              debugInfo.mongoConnectionTest === 'connected' ? '✅ 已連接' :
              debugInfo.mongoConnectionTest === 'failed' ? '❌ 連接失敗' :
              debugInfo.mongoConnectionTest === 'error' ? '🔴 測試錯誤' : '⏳ 測試中...'
            }</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={checkDatabaseStatus}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded font-medium ${
              isLoading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? '檢查中...' : '重新檢查'}
          </button>

          <button
            onClick={forceMongoDB}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded font-medium ${
              isLoading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? '處理中...' : '強制使用 MongoDB'}
          </button>
        </div>

        {debugInfo.timestamp && (
          <div className="text-xs text-gray-500">
            最後更新: {new Date(debugInfo.timestamp).toLocaleString('zh-TW')}
          </div>
        )}
      </div>
    </div>
  );
};