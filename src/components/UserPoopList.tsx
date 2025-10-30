import React, { useState, useEffect } from 'react';
import { Poop } from '../types';
import { supabase } from '../supabase';

interface UserPoopListProps {
  userId: string;
  onPoopClick?: (poop: Poop, index: number) => void;
}

export const UserPoopList: React.FC<UserPoopListProps> = ({ userId, onPoopClick }) => {
  const [userPoops, setUserPoops] = useState<Poop[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ 只依賴 userId - 載入用戶便便
  useEffect(() => {
    const loadUserPoops = async () => {
      if (!userId) {
        setUserPoops([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Loading poops for user:', userId);

        const { data, error } = await supabase
          .from('poops')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (error) {
          console.error('❌ Error loading user poops:', error);
          return;
        }

        const poops = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          lat: item.lat,
          lng: item.lng,
          timestamp: item.timestamp,
          rating: item.rating,
          notes: item.notes,
          photo: item.photo,
          privacy: item.privacy,
          placeName: item.place_name,
          customLocation: item.custom_location,
          address: item.address
        })) as Poop[];

        setUserPoops(poops);
        console.log(`📋 Loaded ${poops.length} poops for user ${userId}`);
      } catch (error) {
        console.error('❌ Error in loadUserPoops:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPoops();
  }, [userId]); // ✅ 只依賴 userId

  // ✅ 監聽該使用者的新便便
  useEffect(() => {
    if (!userId) return;

    console.log('🔄 Setting up user poops subscription for:', userId);

    const subscription = supabase
      .channel(`user_poops_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poops',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newPoop = {
            id: payload.new.id,
            userId: payload.new.user_id,
            lat: payload.new.lat,
            lng: payload.new.lng,
            timestamp: payload.new.timestamp,
            rating: payload.new.rating,
            notes: payload.new.notes,
            photo: payload.new.photo,
            privacy: payload.new.privacy,
            placeName: payload.new.place_name,
            customLocation: payload.new.custom_location,
            address: payload.new.address
          } as Poop;

          console.log('📋 New poop added for user:', newPoop.id);
          setUserPoops(prev => [newPoop, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'poops',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedPoop = {
            id: payload.new.id,
            userId: payload.new.user_id,
            lat: payload.new.lat,
            lng: payload.new.lng,
            timestamp: payload.new.timestamp,
            rating: payload.new.rating,
            notes: payload.new.notes,
            photo: payload.new.photo,
            privacy: payload.new.privacy,
            placeName: payload.new.place_name,
            customLocation: payload.new.custom_location,
            address: payload.new.address
          } as Poop;

          console.log('📋 Poop updated for user:', updatedPoop.id);
          setUserPoops(prev => 
            prev.map(poop => poop.id === updatedPoop.id ? updatedPoop : poop)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'poops',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📋 Poop deleted for user:', payload.old.id);
          setUserPoops(prev => prev.filter(poop => poop.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up user poops subscription for:', userId);
      supabase.removeChannel(subscription);
    };
  }, [userId]); // ✅ 只依賴 userId

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (userPoops.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        <p>還沒有便便記錄</p>
        <p className="text-sm">點擊地圖來添加第一個便便！</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {userPoops.map((poop, index) => (
        <div
          key={poop.id}
          onClick={() => onPoopClick?.(poop, userPoops.length - index)}
          className="p-3 bg-white rounded-lg shadow-sm border cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">💩</span>
                <span className="font-medium text-sm">#{userPoops.length - index}</span>
                {poop.rating && (
                  <div className="text-yellow-500 text-sm">
                    {'⭐'.repeat(Math.floor(poop.rating))}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-600">
                {new Date(poop.timestamp).toLocaleString('zh-TW')}
              </div>
              
              {(poop.placeName || poop.customLocation) && (
                <div className="text-xs text-gray-500 mt-1">
                  📍 {poop.customLocation || poop.placeName}
                </div>
              )}
              
              {poop.notes && (
                <div className="text-xs text-gray-700 mt-1 line-clamp-2">
                  {poop.notes}
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-400">
              {poop.privacy === 'private' && '🔒'}
              {poop.privacy === 'friends' && '👥'}
              {poop.privacy === 'public' && '🌍'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};