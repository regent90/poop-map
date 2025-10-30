import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface PoopCounterProps {
  userEmail?: string;
}

export const PoopCounter: React.FC<PoopCounterProps> = ({ userEmail }) => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [publicCount, setPublicCount] = useState<number>(0);

  // ✅ 只執行一次 - 初始載入計數
  useEffect(() => {
    const loadInitialCounts = async () => {
      try {
        // 同時查詢多個計數，減少 API 調用
        const [totalResult, publicResult, userResult] = await Promise.all([
          // 總便便數
          supabase.from('poops').select('*', { count: 'exact', head: true }),
          // 公開便便數
          supabase.from('poops').select('*', { count: 'exact', head: true }).eq('privacy', 'public'),
          // 用戶便便數（如果已登入）
          userEmail 
            ? supabase.from('poops').select('*', { count: 'exact', head: true }).eq('user_id', userEmail)
            : Promise.resolve({ count: 0 })
        ]);

        setTotalCount(totalResult.count || 0);
        setPublicCount(publicResult.count || 0);
        setUserCount(userResult.count || 0);

        console.log('📊 Initial counts loaded:', {
          total: totalResult.count,
          public: publicResult.count,
          user: userResult.count
        });
      } catch (error) {
        console.error('❌ Error loading initial counts:', error);
      }
    };

    loadInitialCounts();
  }, []); // ✅ 空陣列 = 只執行一次

  // ✅ 使用 Realtime 更新計數 - 只訂閱一次
  useEffect(() => {
    console.log('🔄 Setting up realtime counter subscription');

    const subscription = supabase
      .channel('poop_counter')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poops'
        },
        (payload) => {
          console.log('📈 New poop added:', payload.new);
          
          // 更新總數
          setTotalCount(prev => prev + 1);
          
          // 如果是公開的，更新公開計數
          if (payload.new.privacy === 'public') {
            setPublicCount(prev => prev + 1);
          }
          
          // 如果是當前用戶的，更新用戶計數
          if (userEmail && payload.new.user_id === userEmail) {
            setUserCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'poops'
        },
        (payload) => {
          console.log('📉 Poop deleted:', payload.old);
          
          // 更新總數
          setTotalCount(prev => Math.max(0, prev - 1));
          
          // 如果是公開的，更新公開計數
          if (payload.old.privacy === 'public') {
            setPublicCount(prev => Math.max(0, prev - 1));
          }
          
          // 如果是當前用戶的，更新用戶計數
          if (userEmail && payload.old.user_id === userEmail) {
            setUserCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    // 清理訂閱
    return () => {
      console.log('🔄 Cleaning up counter subscription');
      supabase.removeChannel(subscription);
    };
  }, [userEmail]); // ✅ 只依賴 userEmail

  return (
    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>總便便數:</span>
          <span className="font-bold text-gray-800">{totalCount}</span>
        </div>
        <div className="flex justify-between">
          <span>公開便便:</span>
          <span className="font-bold text-green-600">{publicCount}</span>
        </div>
        {userEmail && (
          <div className="flex justify-between">
            <span>我的便便:</span>
            <span className="font-bold text-amber-600">{userCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};