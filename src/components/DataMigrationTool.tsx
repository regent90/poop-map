import React, { useState } from 'react';
import { savePoopToSupabase } from '../services/supabaseDatabase';
import { Poop } from '../types';

export const DataMigrationTool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [migrationResults, setMigrationResults] = useState<any[]>([]);

  const migrateLocalStorageToSupabase = async () => {
    setIsLoading(true);
    setMigrationStatus('開始遷移...');
    setMigrationResults([]);

    try {
      // 獲取所有 localStorage 中的便便數據
      const allPoops: (Poop & { userEmail: string })[] = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('poops_')) {
          try {
            const userEmail = key.replace('poops_', '');
            const poops = JSON.parse(localStorage.getItem(key) || '[]');
            poops.forEach((poop: Poop) => {
              allPoops.push({
                ...poop,
                userEmail,
                userId: userEmail // 確保 userId 正確
              });
            });
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
          }
        }
      });

      setMigrationStatus(`找到 ${allPoops.length} 筆便便記錄，開始遷移...`);

      // 逐一遷移到 Supabase
      const results = [];
      for (let i = 0; i < allPoops.length; i++) {
        const poop = allPoops[i];
        try {
          setMigrationStatus(`遷移中... (${i + 1}/${allPoops.length})`);
          
          const supabaseId = await savePoopToSupabase(poop);
          results.push({
            success: true,
            originalId: poop.id,
            supabaseId,
            userEmail: poop.userEmail,
            timestamp: poop.timestamp
          });
          
          console.log(`✅ 成功遷移便便 ${poop.id} → ${supabaseId}`);
        } catch (error) {
          console.error(`❌ 遷移失敗 ${poop.id}:`, error);
          results.push({
            success: false,
            originalId: poop.id,
            error: error.message,
            userEmail: poop.userEmail,
            timestamp: poop.timestamp
          });
        }
      }

      setMigrationResults(results);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      setMigrationStatus(`遷移完成！成功: ${successCount} 筆，失敗: ${failCount} 筆`);
      
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus(`遷移失敗: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-lg">
      <h3 className="font-bold text-lg mb-4 text-blue-800">📦 數據遷移工具</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-blue-700">
            這個工具會將 localStorage 中的便便數據遷移到 Supabase 數據庫。
          </p>
        </div>

        <button
          onClick={migrateLocalStorageToSupabase}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded font-medium ${
            isLoading
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? '遷移中...' : '開始遷移到 Supabase'}
        </button>

        {migrationStatus && (
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm font-medium text-gray-800">狀態:</p>
            <p className="text-sm text-gray-600">{migrationStatus}</p>
          </div>
        )}

        {migrationResults.length > 0 && (
          <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
            <p className="text-sm font-medium text-gray-800 mb-2">遷移結果:</p>
            <div className="space-y-1">
              {migrationResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-xs p-2 rounded ${
                    result.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {result.success ? '✅' : '❌'} {result.userEmail}
                      </div>
                      <div>{formatTimestamp(result.timestamp)}</div>
                      {result.success ? (
                        <div>ID: {result.originalId} → {result.supabaseId}</div>
                      ) : (
                        <div>錯誤: {result.error}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-3 rounded">
          <p className="text-xs text-yellow-700">
            ⚠️ 遷移前請確保已在 Supabase 中執行建表腳本 (supabase-schema.sql)
          </p>
        </div>
      </div>
    </div>
  );
};