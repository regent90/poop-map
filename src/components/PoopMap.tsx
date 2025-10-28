import React, { useEffect, useState, useRef } from 'react';
import { Poop } from '../types';

interface MarkerProps {
  map: any | undefined;
  position: { lat: number, lng: number };
  poop: Poop;
}

const Marker: React.FC<MarkerProps> = ({ map, position, poop }) => {
  const markerRef = useRef<any | null>(null);

  useEffect(() => {
    if (map) {
      if (!markerRef.current) {
        // Create a custom icon using SVG
        const poopSvg = `
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#8B4513" stroke="#654321" stroke-width="2"/>
            <text x="20" y="28" text-anchor="middle" font-size="20" fill="white">💩</text>
          </svg>
        `;
        
        const poopIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(poopSvg),
          scaledSize: new (window as any).google.maps.Size(40, 40),
          anchor: new (window as any).google.maps.Point(20, 20)
        };

        // Create the standard Marker
        markerRef.current = new (window as any).google.maps.Marker({
          position,
          map,
          icon: poopIcon,
          title: `Poop dropped on ${new Date(poop.timestamp).toLocaleString()}`,
          animation: (window as any).google.maps.Animation.DROP
        });
        
        // Add click handler to show info
        markerRef.current.addListener('click', () => {
          const date = new Date(poop.timestamp);
          const rating = poop.rating ? '⭐'.repeat(Math.floor(poop.rating)) + (poop.rating % 1 !== 0 ? '✨' : '') : '';
          const location = poop.customLocation || poop.placeName || '';
          
          // Get current user from localStorage to check if this is their poop
          const currentUserData = localStorage.getItem('poopMapUser');
          const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
          const isOwnPoop = currentUser && poop.userId === currentUser.email;
          
          // Only show photo if it's the user's own poop
          let photoHtml = '';
          if (poop.photo && isOwnPoop) {
            photoHtml = `<img src="${poop.photo}" style="width: 100%; max-width: 200px; height: 100px; object-fit: cover; border-radius: 4px; margin: 8px 0;" alt="Poop photo">`;
          } else if (poop.photo && !isOwnPoop) {
            photoHtml = `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">📷 Photo (private)</p>`;
          }
          
          // Show privacy indicator
          const privacyIcon = poop.privacy === 'private' ? '🔒' : poop.privacy === 'friends' ? '👥' : '🌍';
          const privacyText = poop.privacy === 'private' ? 'Private' : poop.privacy === 'friends' ? 'Friends Only' : 'Public';
          
          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 250px;">
                <h3 style="color: #92400e; font-weight: bold; margin: 0 0 8px 0;">💩 Poop Drop</h3>
                ${!isOwnPoop ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">👤 ${poop.userId}</p>` : ''}
                <p style="margin: 4px 0; font-size: 14px; color: #4b5563;">
                  📅 ${date.toLocaleString()}
                </p>
                ${location ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">📍 ${location}</p>` : ''}
                ${rating ? `<p style="margin: 4px 0; font-size: 14px;">Rating: ${rating} (${poop.rating}/5)</p>` : ''}
                ${photoHtml}
                ${poop.notes && isOwnPoop ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280; font-style: italic;">"${poop.notes}"</p>` : ''}
                <p style="margin: 4px 0; font-size: 10px; color: #9ca3af;">
                  ${privacyIcon} ${privacyText}
                </p>
                <p style="margin: 4px 0; font-size: 10px; color: #9ca3af;">
                  ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}
                </p>
              </div>
            `
          });
          infoWindow.open(map, markerRef.current);
        });
        
        // Debug log
        console.log('Created poop marker at:', position, 'for poop:', poop.id);
      } else {
        // If marker already exists, just update its position
        markerRef.current.position = position;
      }
    }
  }, [map, position, poop]);

  // Cleanup effect to remove the marker when the component unmounts
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
        // mapId: 'poop-map-style', // Removed to avoid requiring cloud setup
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
    <div style={{ height: '100vh', width: '100%' }}>
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

export const PoopMap: React.FC<{ poops: Poop[] }> = ({ poops }) => {
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
        <Marker key={poop.id} position={{ lat: poop.lat, lng: poop.lng }} poop={poop} />
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
        // Create user location marker with blue dot
        const userSvg = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
            <circle cx="10" cy="10" r="3" fill="white"/>
          </svg>
        `;
        
        const userIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(userSvg),
          scaledSize: new (window as any).google.maps.Size(20, 20),
          anchor: new (window as any).google.maps.Point(10, 10)
        };
        
        markerRef.current = new (window as any).google.maps.Marker({
          position,
          map,
          icon: userIcon,
          title: 'Your current location'
        });
      } else {
        markerRef.current.setPosition(position);
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