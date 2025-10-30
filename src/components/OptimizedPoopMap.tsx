import React, { useState, useEffect, useRef } from 'react';
import { Poop } from '../types';
import { supabase } from '../supabase';
import { getPoopIconType, createPoopMapIcon } from '../utils/mapIconUtils';

interface OptimizedPoopMapProps {
  onPoopClick?: (poop: Poop) => void;
  userEmail?: string;
}

export const OptimizedPoopMap: React.FC<OptimizedPoopMapProps> = ({ onPoopClick, userEmail }) => {
  const [poops, setPoops] = useState<Poop[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // ✅ 只執行一次 - 初始化地圖
  useEffect(() => {
    if (mapRef.current && !map) {
      const google = (window as any).google;
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 25.034, lng: 121.564 }, // 台北 101
        zoom: 15,
        mapId: 'DEMO_MAP_ID',
        disableDefaultUI: true,
        gestureHandling: 'greedy'
      });
      
      setMap(newMap);
      console.log('🗺️ Map initialized');
    }
  }, []); // ✅ 空陣列 = 只執行一次

  // ✅ 只執行一次 - 獲取用戶位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          
          // 更新地圖中心
          if (map) {
            map.setCenter(location);
          }
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [map]); // ✅ 只依賴 map

  // ✅ 只執行一次 - 初始載入可見便便
  useEffect(() => {
    const loadInitialPoops = async () => {
      try {
        console.log('🔄 Loading initial poops for map');
        
        let query = supabase.from('poops').select('*');
        
        if (userEmail) {
          // 如果有用戶，載入用戶的便便 + 好友的便便 + 公開便便
          // 這裡簡化為用戶的便便 + 公開便便
          query = query.or(`user_id.eq.${userEmail},privacy.eq.public`);
        } else {
          // 如果沒有用戶，只載入公開便便
          query = query.eq('privacy', 'public');
        }
        
        const { data, error } = await query
          .order('timestamp', { ascending: false })
          .limit(100); // 限制數量
        
        if (error) {
          console.error('❌ Error loading initial poops:', error);
          return;
        }
        
        const initialPoops = data.map(item => ({
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
        
        setPoops(initialPoops);
        console.log(`📍 Loaded ${initialPoops.length} initial poops`);
      } catch (error) {
        console.error('❌ Error in loadInitialPoops:', error);
      }
    };

    loadInitialPoops();
  }, [userEmail]); // ✅ 只依賴 userEmail

  // ✅ 只訂閱一次 - Realtime 監聽新增便便
  useEffect(() => {
    console.log('🔄 Setting up realtime map subscription');

    const subscription = supabase
      .channel('map_poops')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poops'
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

          // 檢查是否應該顯示這個便便
          const shouldShow = 
            newPoop.privacy === 'public' || 
            (userEmail && newPoop.userId === userEmail);

          if (shouldShow) {
            console.log('📍 New poop added to map:', newPoop.id);
            // 新增到列表開頭
            setPoops(prev => [newPoop, ...prev.slice(0, 99)]); // 保持最多 100 個
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up map subscription');
      supabase.removeChannel(subscription);
    };
  }, [userEmail]); // ✅ 只依賴 userEmail

  // 更新地圖標記
  useEffect(() => {
    if (!map) return;

    // 清除舊標記
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current.clear();

    // 添加新標記
    poops.forEach(poop => {
      const iconType = getPoopIconType(poop, userEmail);
      const iconSize = iconType === 'my' ? 40 : iconType === 'friend' ? 36 : 32;
      const poopIcon = createPoopMapIcon(iconType, iconSize);

      const google = (window as any).google;
      const marker = new google.maps.Marker({
        position: { lat: poop.lat, lng: poop.lng },
        map,
        icon: poopIcon,
        title: `Poop dropped on ${new Date(poop.timestamp).toLocaleString()}`,
      });

      marker.addListener('click', () => {
        if (onPoopClick) {
          onPoopClick(poop);
        }
      });

      markersRef.current.set(poop.id, marker);
    });

    console.log(`🗺️ Updated map with ${poops.length} markers`);
  }, [map, poops, userEmail, onPoopClick]);

  // 添加用戶位置標記
  useEffect(() => {
    if (!map || !userLocation) return;

    const google = (window as any).google;
    const userMarker = new google.maps.Marker({
      position: userLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
      title: 'Your location'
    });

    return () => {
      userMarker.setMap(null);
    };
  }, [map, userLocation]);

  return (
    <div className="mobile-map-container">
      <div 
        ref={mapRef} 
        style={{ 
          height: 'calc(var(--vh, 1vh) * 100)', 
          width: '100%' 
        }} 
      />
    </div>
  );
};