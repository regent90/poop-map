import React, { useState } from 'react';
import { savePoopToMongoDB } from '../services/mongoDatabase';
import { checkMongoBackendConnection } from '../services/mongoBackendAPI';
import { Poop } from '../types';

export const MongoMigrationTool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [migrationResults, setMigrationResults] = useState<any[]>([]);

  const setupMongoDB = async () => {
    setIsLoading(true);
    setMigrationStatus('檢查 MongoDB 後端 API 連接...');

    try {
      // 直接測試後端 API 連接（不需要檢查前端環境變數）
      const isConnected = await checkMongoBackendConnection();
      
      if (!isConnected) {
        throw new Error('無法連接到 MongoDB 後端 API');
      }
      
      setMigrationStatus('✅ MongoDB 後端 API 連接成功！');
    } catch (error) {
      console.error('❌ MongoDB setup failed:', error);
      setMigrationStatus(`❌ MongoDB 設置失敗: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const migrateLocalStorageToMongoDB = async () => {
    setIsLoading(true);
    setMigrationStatus('開始遷移到 MongoDB...');
    setMigrationResults([]);

    try {
      // 測試後端 API 連接
      const isConnected = await checkMongoBackendConnection();
      
      if (!isConnected) {
        throw new Error('無法連接到 MongoDB 後端 API');
      }

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

      setMigrationStatus(`找到 ${allPoops.length} 筆便便記錄，開始遷移到 MongoDB...`);

      // 逐一遷移到 MongoDB
      const results = [];
      for (let i = 0; i < allPoops.length; i++) {
        const poop = allPoops[i];
        try {
          setMigrationStatus(`遷移中... (${i + 1}/${allPoops.length})`);
          
          const mongoId = await savePoopToMongoDB(poop);
          results.push({
            success: true,
            originalId: poop.id,
            mongoId,
            userEmail: poop.userEmail,
            timestamp: poop.timestamp
          });
          
          console.log(`✅ 成功遷移便便 ${poop.id} → ${mongoId}`);
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
      <h3 className="font-bold text-lg mb-4 text-green-800">🍃 MongoDB 遷移工具</h3>
      
      <div className="space-y-4">
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-green-700">
            這個工具會將數據遷移到 MongoDB Atlas（通過後端 API），並設置 MongoDB 作為主要數據庫。
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={setupMongoDB}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded font-medium ${
              isLoading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? '設置中...' : '設置 MongoDB'}
          </button>

          <button
            onClick={migrateLocalStorageToMongoDB}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded font-medium ${
              isLoading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? '遷移中...' : '遷移數據'}
          </button>
        </div>

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
                        <div>ID: {result.originalId} → {result.mongoId}</div>
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
            ⚠️ 請確保已在 Vercel 中配置 MONGODB_URI 和 MONGODB_DB_NAME 環境變數
          </p>
        </div>

        <div className="bg-blue-50 p-3 rounded">
          <p className="text-xs text-blue-700 font-medium mb-1">數據庫優先級:</p>
          <p className="text-xs text-blue-600">
            1. MongoDB Atlas (後端 API) - 主要<br/>
            2. Supabase (備選)<br/>
            3. Firebase (備選)<br/>
            4. localStorage (離線)
          </p>
        </div>
      </div>
    </div>
  );
};