import React, { useState, useEffect } from 'react';
import { apiCallCounter, API_LIMITS } from '../config/apiLimits';

export const ApiUsageMonitor: React.FC = () => {
  const [stats, setStats] = useState(apiCallCounter.getStats());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 只在開發模式下顯示
    if (!API_LIMITS.DEVELOPMENT_MODE) return;

    const interval = setInterval(() => {
      setStats(apiCallCounter.getStats());
    }, 5000); // 每 5 秒更新

    return () => clearInterval(interval);
  }, []);

  if (!API_LIMITS.DEVELOPMENT_MODE) return null;

  return (
    <>
      {/* 切換按鈕 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-20 left-4 bg-yellow-600 text-white p-2 rounded-full shadow-lg hover:bg-yellow-700 z-50 text-xs"
        title="API 使用量監控"
      >
        📊
      </button>

      {/* 監控面板 */}
      {isVisible && (
        <div className="fixed top-32 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-yellow-800">📊 API 使用量</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {/* 當前統計 */}
            <div className="bg-yellow-50 p-3 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">本次會話</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Supabase:</span>
                  <span className="font-mono">{stats.supabase}</span>
                </div>
                <div className="flex justify-between">
                  <span>Firebase:</span>
                  <span className="font-mono">{stats.firebase}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>總計:</span>
                  <span className="font-mono">{stats.total}</span>
                </div>
              </div>
            </div>

            {/* 緩存狀態 */}
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">緩存設置</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>連接檢查: {API_LIMITS.CONNECTION_CHECK_CACHE / 1000 / 60}分鐘</div>
                <div>數據庫提供者: {API_LIMITS.DATABASE_PROVIDER_CACHE / 1000 / 60}分鐘</div>
                <div>公開便便: {API_LIMITS.PUBLIC_POOPS_CACHE / 1000 / 60}分鐘</div>
                <div>實時防抖: {API_LIMITS.REALTIME_DEBOUNCE / 1000}秒</div>
              </div>
            </div>

            {/* 限制設置 */}
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-semibold text-green-800 mb-2">查詢限制</h4>
              <div className="text-xs text-green-700 space-y-1">
                <div>公開便便: {API_LIMITS.PUBLIC_POOPS_LIMIT} 筆</div>
                <div>好友便便: {API_LIMITS.FRIENDS_POOPS_LIMIT} 筆</div>
                <div>最大重試: {API_LIMITS.MAX_RETRIES} 次</div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  apiCallCounter.reset();
                  setStats(apiCallCounter.getStats());
                }}
                className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                重置計數
              </button>
              <button
                onClick={() => console.log('API Stats:', apiCallCounter.getStats())}
                className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                輸出日誌
              </button>
            </div>

            {/* 警告 */}
            {stats.total > 1000 && (
              <div className="bg-red-50 p-2 rounded border border-red-200">
                <p className="text-red-800 text-xs font-semibold">
                  ⚠️ API 調用次數過高！
                </p>
                <p className="text-red-600 text-xs">
                  建議檢查是否有不必要的重複查詢
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};