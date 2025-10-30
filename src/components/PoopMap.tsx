import React, { useEffect, useState, useRef } from 'react';
import { Poop } from '../types';
import { getPoopIconType, createPoopMapIcon } from '../utils/mapIconUtils';

interface MarkerProps {
  map?: any;
  position: { lat: number, lng: number };
  poop: Poop;
  onPoopClick?: (poop: Poop) => void;
}

// 便便圖標設計函數
const createPoopIcon = (poop: Poop, currentUserEmail?: string) => {
  const isOwnPoop = currentUserEmail && poop.userId === currentUserEmail;
  const isFriendPoop = !isOwnPoop && poop.privacy === 'friends';
  const isPublicPoop = poop.privacy === 'public' && !isOwnPoop;

  // 設計三種不同的便便圖標
  if (isOwnPoop) {
    // 自己的便便 - 金色便便 🌟
    return {
      emoji: '💩',
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      border: '3px solid #FF8C00',
      shadow: '0 4px 8px rgba(255, 140, 0, 0.4)',
      size: '44px',
      fontSize: '26px'
    };
  } else if (isFriendPoop) {
    // 好友的便便 - 藍色便便 👥
    return {
      emoji: '💩',
      background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
      border: '3px solid #2E5C8A',
      shadow: '0 4px 8px rgba(74, 144, 226, 0.4)',
      size: '40px',
      fontSize: '24px'
    };
  } else {
    // 公開的便便 - 綠色便便 🌍
    return {
      emoji: '💩',
      background: 'linear-gradient(135deg, #4CAF50, #45A049)',
      border: '3px solid #388E3C',
      shadow: '0 4px 8px rgba(76, 175, 80, 0.4)',
      size: '36px',
      fontSize: '22px'
    };
  }
};

const Marker: React.FC<MarkerProps> = ({ map, position, poop, onPoopClick }) => {
  const markerRef = useRef<any | null>(null);

  useEffect(() => {
    if (map) {
      if (!markerRef.current) {
        // Get current user from localStorage to determine poop type
        const currentUserData = localStorage.getItem('poopMapUser');
        const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
        
        // Determine icon type based on poop ownership and privacy
        const iconType = getPoopIconType(poop, currentUser?.email);
        
        // Create icon with appropriate size based on type
        const iconSize = iconType === 'my' ? 40 : iconType === 'friend' ? 36 : 32;
        const poopIcon = createPoopMapIcon(iconType, iconSize);
        
        const google = (window as any).google;
        
        // Create the marker
        markerRef.current = new google.maps.Marker({
          position,
          map,
          icon: poopIcon,
          title: `Poop dropped on ${new Date(poop.timestamp).toLocaleString()}`,
          animation: google.maps.Animation.DROP
        });
        
        // Add click handler
        markerRef.current.addListener('click', () => {
          console.log('🗺️ Poop marker clicked:', poop.id, 'type:', iconType);
          if (onPoopClick) {
            onPoopClick(poop);
          }
        });
        
        // Debug log
        console.log('Created poop marker at:', position, 'for poop:', poop.id, 'type:', iconType);
      } else {
        // If marker already exists, just update its position
        markerRef.current.setPosition(position);
      }
    }
  }, [map, position, poop]);

  // Cleanup effect to remove the marker when the component unmounts
  useEffect(() => {
    const currentMarker = markerRef.current;
    return () => {
      if (currentMarker) {
        currentMarker.setMap(null);
      }
    };
  }, []);

  return null;
};


const MapComponent: React.FC<{
  // Fix: Replaced google.maps.LatLngLiteral with an explicit object type to resolve "Cannot find namespace 'google'" error.
  center: { lat: number, lng: number };
  zoom: number;
  children?: React.ReactNode;
}> = ({ center, zoom, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  // Fix: Replaced google.maps.Map with `any` to resolve "Cannot find namespace 'google'" error.
  const [map, setMap] = useState<any>();

  // Initialize map
  useEffect(() => {
    if (ref.current && !map) {
      // Fix: Accessed google maps API through `(window as any).google` to resolve "Property 'google' does not exist on type 'Window'" error.
      setMap(new (window as any).google.maps.Map(ref.current, {
        center,
        zoom,
        mapId: 'DEMO_MAP_ID', // Simple map ID to enable AdvancedMarkerElement
        disableDefaultUI: true,
        gestureHandling: 'greedy'
      }));
    }
  }, [ref, map, center, zoom]);

  // Update map center when prop changes
  useEffect(() => {
    if(map) {
      map.setCenter(center);
    }
  }, [map, center]);


  return (
    <div style={{ height: 'calc(var(--vh, 1vh) * 100)', width: '100%' }}>
      <div ref={ref} style={{ height: '100%', width: '100%' }} />
      {/* Pass the map instance to child components */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // @ts-ignore - We are intentionally adding the 'map' prop
          return React.cloneElement(child, { map });
        }
      })}
    </div>
  );
};

interface PoopMapProps {
  poops: Poop[];
  onPoopClick?: (poop: Poop) => void;
}

export const PoopMap: React.FC<PoopMapProps> = ({ poops, onPoopClick }) => {
  const [center, setCenter] = useState({ lat: 25.034, lng: 121.564 }); // Default to Taipei 101
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(location);
          setUserLocation(location);
        },
        () => {
          console.error('Error: The Geolocation service failed.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
    }
  }, []);

  return (
    <MapComponent center={center} zoom={15}>
      {/* User location marker */}
      {userLocation && (
        <UserLocationMarker position={userLocation} />
      )}
      {/* Poop markers */}
      {poops.map((poop) => (
        <Marker key={poop.id} position={{ lat: poop.lat, lng: poop.lng }} poop={poop} onPoopClick={onPoopClick} />
      ))}
    </MapComponent>
  );
};

// User location marker component
const UserLocationMarker: React.FC<{ map?: any, position: { lat: number, lng: number } }> = ({ map, position }) => {
  const markerRef = useRef<any | null>(null);

  useEffect(() => {
    if (map) {
      if (!markerRef.current) {
        const google = (window as any).google;
        
        if (google?.maps?.marker?.AdvancedMarkerElement) {
          // Create custom HTML element for user location
          const userElement = document.createElement('div');
          userElement.style.width = '20px';
          userElement.style.height = '20px';
          userElement.style.borderRadius = '50%';
          userElement.style.background = '#3B82F6';
          userElement.style.border = '2px solid white';
          userElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          userElement.title = 'Your current location';
          
          // Add inner white dot
          const innerDot = document.createElement('div');
          innerDot.style.width = '6px';
          innerDot.style.height = '6px';
          innerDot.style.borderRadius = '50%';
          innerDot.style.background = 'white';
          innerDot.style.position = 'absolute';
          innerDot.style.top = '50%';
          innerDot.style.left = '50%';
          innerDot.style.transform = 'translate(-50%, -50%)';
          userElement.style.position = 'relative';
          userElement.appendChild(innerDot);

          markerRef.current = new google.maps.marker.AdvancedMarkerElement({
            position,
            map,
            content: userElement,
            title: 'Your current location'
          });
        } else {
          // Fallback to regular Marker
          const userSvg = `
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <circle cx="10" cy="10" r="3" fill="white"/>
            </svg>
          `;
          
          const userIcon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(userSvg),
            scaledSize: new google.maps.Size(20, 20),
            anchor: new google.maps.Point(10, 10)
          };
          
          markerRef.current = new google.maps.Marker({
            position,
            map,
            icon: userIcon,
            title: 'Your current location'
          });
        }
      } else {
        // Update position for both marker types
        if (markerRef.current.position) {
          markerRef.current.position = position;
        } else if (markerRef.current.setPosition) {
          markerRef.current.setPosition(position);
        }
      }
    }
  }, [map, position]);

  useEffect(() => {
    const currentMarker = markerRef.current;
    return () => {
      if (currentMarker) {
        currentMarker.map = null;
      }
    };
  }, []);

  return null;
};