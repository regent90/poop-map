import React, { useState, useEffect } from 'react';
import { UserProfile, Poop } from '../types';
import { OptimizedPoopMap } from './OptimizedPoopMap';
import { PoopCounter } from './PoopCounter';
import { UserPoopList } from './UserPoopList';
import { supabase } from '../supabase';

export const OptimizedApp: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedPoop, setSelectedPoop] = useState<Poop | null>(null);
  const [showUserList, setShowUserList] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ 1. 獲取當前使用者（只執行一次）
  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const storedUser = localStorage.getItem('poopMapUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('👤 Current user loaded:', userData.email);
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
      }
    };

    loadCurrentUser();
  }, []); // ✅ 空陣列 = 只執行一次

  // ✅ 2. 初始載入資料（只執行一次）
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🔄 Loading initial app data');
        
        // 同時查詢多個資料，減少 API 調用
        const queries = [
          // 公開便便數量
          supabase.from('poops').select('*', { count: 'exact', head: true }).eq('privacy', 'public'),
          // 總便便數量
          supabase.from('poops').select('*', { count: 'exact', head: true }),
        ];

        // 如果有用戶，添加用戶相關查詢
        if (user?.email) {
          queries.push(
            // 用戶便便數量
            supabase.from('poops').select('*', { count: 'exact', head: true }).eq('user_id', user.email)
          );
        }

        const results = await Promise.all(queries);
        
        console.log('📊 Initial data loaded:', {
          publicCount: results[0].count,
          totalCount: results[1].count,
          userCount: results[2]?.count || 0
        });
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      }
    };

    // 只有在用戶狀態確定後才載入資料
    if (user !== null) {
      loadInitialData();
    }
  }, [user?.email]); // ✅ 只依賴用戶 email

  // ✅ 3. 設定 Realtime 訂閱（只執行一次）
  useEffect(() => {
    console.log('🔄 Setting up global realtime subscriptions');

    // 全局便便變化訂閱
    const globalSubscription = supabase
      .channel('global_poops')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poops'
        },
        (payload) => {
          console.log('🌍 Global poop change:', payload.eventType, (payload.new as any)?.id || (payload.old as any)?.id);
          
          // 這裡可以觸發全局狀態更新
          // 例如：更新總數、通知其他組件等
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up global subscriptions');
      supabase.removeChannel(globalSubscription);
    };
  }, []); // ✅ 空陣列 = 只執行一次

  // ✅ 4. 手動重新整理功能（使用者觸發）
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshKey(prev => prev + 1);
    
    // 可以觸發子組件重新載入
    // 或者清除緩存等操作
  };

  const handlePoopClick = (poop: Poop) => {
    setSelectedPoop(poop);
    console.log('📍 Poop selected:', poop.id);
  };

  const handleUserPoopClick = (poop: Poop, index: number) => {
    setSelectedPoop(poop);
    console.log('📋 User poop selected:', poop.id, 'index:', index);
  };

  return (
    <div className="mobile-viewport-container">
      {/* Header */}
      <div className="mobile-header bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💩</span>
          <h1 className="text-xl font-bold">便便地圖</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 重新整理按鈕 */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="重新整理"
          >
            🔄
          </button>
          
          {/* 用戶列表切換 */}
          {user && (
            <button
              onClick={() => setShowUserList(!showUserList)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              title="我的便便列表"
            >
              📋
            </button>
          )}
          
          {/* 用戶頭像 */}
          {user && (
            <img
              src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
        </div>
      </div>

      {/* 主要內容 */}
      <div className="relative flex-1">
        {/* 地圖 */}
        <OptimizedPoopMap
          key={`map-${refreshKey}`}
          onPoopClick={handlePoopClick}
          userEmail={user?.email}
        />

        {/* 統計信息 */}
        <div className="absolute mobile-stats-container z-10">
          <PoopCounter 
            key={`counter-${refreshKey}`}
            userEmail={user?.email} 
          />
        </div>

        {/* 用戶便便列表 */}
        {showUserList && user && (
          <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-20 max-h-80 overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">我的便便記錄</h3>
              <button
                onClick={() => setShowUserList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <UserPoopList
              key={`userlist-${refreshKey}`}
              userId={user.email}
              onPoopClick={handleUserPoopClick}
            />
          </div>
        )}

        {/* 選中的便便詳情 */}
        {selectedPoop && (
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-20">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold">便便詳情</h3>
              <button
                onClick={() => setSelectedPoop(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>時間: {new Date(selectedPoop.timestamp).toLocaleString('zh-TW')}</div>
              {selectedPoop.placeName && <div>地點: {selectedPoop.placeName}</div>}
              {selectedPoop.rating && (
                <div>評分: {'⭐'.repeat(Math.floor(selectedPoop.rating))}</div>
              )}
              {selectedPoop.notes && <div>備註: {selectedPoop.notes}</div>}
              <div>隱私: {
                selectedPoop.privacy === 'private' ? '🔒 私人' :
                selectedPoop.privacy === 'friends' ? '👥 好友' : '🌍 公開'
              }</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};