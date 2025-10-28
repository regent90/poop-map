import React, { useEffect, useState, useRef } from 'react';
import { Poop } from '../types';

interface MarkerProps {
  map?: any;
  position: { lat: number, lng: number };
  poop: Poop;
  onPoopClick?: (poop: Poop) => void;
}

const Marker: React.FC<MarkerProps> = ({ map, position, poop, onPoopClick }) => {
  const markerRef = useRef<any | null>(null);

  useEffect(() => {
    if (map) {
      if (!markerRef.current) {
        // Check if AdvancedMarkerElement is available, fallback to regular Marker
        const google = (window as any).google;
        
        if (google?.maps?.marker?.AdvancedMarkerElement) {
          // Create custom HTML element for the marker
          const markerElement = document.createElement('div');
          markerElement.innerHTML = '💩';
          markerElement.style.fontSize = '24px';
          markerElement.style.cursor = 'pointer';
          markerElement.style.background = '#8B4513';
          markerElement.style.borderRadius = '50%';
          markerElement.style.width = '40px';
          markerElement.style.height = '40px';
          markerElement.style.display = 'flex';
          markerElement.style.alignItems = 'center';
          markerElement.style.justifyContent = 'center';
          markerElement.style.border = '2px solid #654321';
          markerElement.title = `Poop dropped on ${new Date(poop.timestamp).toLocaleString()}`;

          // Create AdvancedMarkerElement
          markerRef.current = new google.maps.marker.AdvancedMarkerElement({
            position,
            map,
            content: markerElement,
            title: `Poop dropped on ${new Date(poop.timestamp).toLocaleString()}`
          });
        } else {
          // Fallback to regular Marker with custom icon
          const poopSvg = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#8B4513" stroke="#654321" stroke-width="2"/>
              <text x="20" y="28" text-anchor="middle" font-size="20" fill="white">💩</text>
            </svg>
          `;
          
          const poopIcon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(poopSvg),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          };

          // Create the standard Marker
          markerRef.current = new google.maps.Marker({
            position,
            map,
            icon: poopIcon,
            title: `Poop dropped on ${new Date(poop.timestamp).toLocaleString()}`,
            animation: google.maps.Animation.DROP
          });
        }
        
        // Add click handler
        markerRef.current.addListener('click', () => {
          console.log('🗺️ Poop marker clicked:', poop.id);
          if (onPoopClick) {
            onPoopClick(poop);
          }
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