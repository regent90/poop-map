import { Poop } from '../types';

// 根據便便類型確定圖標類型
export const getPoopIconType = (poop: Poop, currentUserEmail?: string): 'my' | 'friend' | 'public' => {
  if (currentUserEmail && poop.userId === currentUserEmail) {
    return 'my';
  }
  
  if (poop.privacy === 'friends' && poop.userId !== currentUserEmail) {
    return 'friend';
  }
  
  return 'public';
};

// 將 React 組件轉換為 SVG 字符串用於地圖標記
export const createMapIconFromSvg = (svgString: string, size: number = 32): any => {
  const google = (window as any).google;
  
  if (!google?.maps) {
    return null;
  }
  
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString),
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size)
  };
};

// 為不同類型的便便創建 SVG 圖標
export const createPoopMapIcon = (type: 'my' | 'friend' | 'public', size: number = 32): any => {
  let svgContent: string;
  
  switch (type) {
    case 'my':
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="11" fill="rgba(251, 191, 36, 0.2)" stroke="rgba(251, 191, 36, 0.4)" stroke-width="1"/>
          <path d="M12 4c-1.5 0-2.5 1-2.5 2.5 0 0.5 0.2 1 0.5 1.4-1.2 0.3-2 1.4-2 2.6 0 0.8 0.3 1.5 0.8 2-1 0.4-1.8 1.3-1.8 2.5 0 1.7 1.3 3 3 3h4c1.7 0 3-1.3 3-3 0-1.2-0.8-2.1-1.8-2.5 0.5-0.5 0.8-1.2 0.8-2 0-1.2-0.8-2.3-2-2.6 0.3-0.4 0.5-0.9 0.5-1.4C14.5 5 13.5 4 12 4z" fill="#F59E0B" stroke="#D97706" stroke-width="0.5" filter="url(#glow)"/>
          <ellipse cx="10.5" cy="8" rx="1" ry="0.5" fill="#FEF3C7" opacity="0.8"/>
          <ellipse cx="13" cy="11" rx="0.8" ry="0.4" fill="#FEF3C7" opacity="0.6"/>
        </svg>
      `;
      break;
      
    case 'friend':
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="11" fill="rgba(34, 197, 94, 0.15)" stroke="rgba(34, 197, 94, 0.3)" stroke-width="1"/>
          <path d="M12 4c-1.5 0-2.5 1-2.5 2.5 0 0.5 0.2 1 0.5 1.4-1.2 0.3-2 1.4-2 2.6 0 0.8 0.3 1.5 0.8 2-1 0.4-1.8 1.3-1.8 2.5 0 1.7 1.3 3 3 3h4c1.7 0 3-1.3 3-3 0-1.2-0.8-2.1-1.8-2.5 0.5-0.5 0.8-1.2 0.8-2 0-1.2-0.8-2.3-2-2.6 0.3-0.4 0.5-0.9 0.5-1.4C14.5 5 13.5 4 12 4z" fill="#10B981" stroke="#059669" stroke-width="0.5"/>
          <circle cx="10.5" cy="9" r="0.8" fill="#065F46"/>
          <circle cx="13.5" cy="9" r="0.8" fill="#065F46"/>
          <circle cx="10.7" cy="8.8" r="0.3" fill="#ECFDF5"/>
          <circle cx="13.7" cy="8.8" r="0.3" fill="#ECFDF5"/>
          <path d="M10.5 12c0.5 0.5 1 0.8 1.5 0.8s1-0.3 1.5-0.8" stroke="#065F46" stroke-width="0.8" stroke-linecap="round" fill="none"/>
        </svg>
      `;
      break;
      
    case 'public':
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="11" fill="rgba(147, 51, 234, 0.15)" stroke="rgba(147, 51, 234, 0.3)" stroke-width="1"/>
          <path d="M12 4c-1.5 0-2.5 1-2.5 2.5 0 0.5 0.2 1 0.5 1.4-1.2 0.3-2 1.4-2 2.6 0 0.8 0.3 1.5 0.8 2-1 0.4-1.8 1.3-1.8 2.5 0 1.7 1.3 3 3 3h4c1.7 0 3-1.3 3-3 0-1.2-0.8-2.1-1.8-2.5 0.5-0.5 0.8-1.2 0.8-2 0-1.2-0.8-2.3-2-2.6 0.3-0.4 0.5-0.9 0.5-1.4C14.5 5 13.5 4 12 4z" fill="#9333EA" stroke="#7C3AED" stroke-width="0.5"/>
          <g transform="translate(15, 6)">
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" stroke="#9333EA" stroke-width="0.5"/>
            <path d="M-1.5 -0.5 L0 0.5 L-1.5 1.5" stroke="#9333EA" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M-1 0 L1 0" stroke="#9333EA" stroke-width="0.8" stroke-linecap="round"/>
          </g>
          <g transform="translate(8, 7)">
            <path d="M0 -1 L0.3 -0.3 L1 0 L0.3 0.3 L0 1 L-0.3 0.3 L-1 0 L-0.3 -0.3 Z" fill="#F3E8FF" opacity="0.8"/>
          </g>
        </svg>
      `;
      break;
      
    default:
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#8B5CF6" stroke="#7C3AED" stroke-width="2"/>
          <text x="12" y="16" text-anchor="middle" font-size="12" fill="white">💩</text>
        </svg>
      `;
  }
  
  return createMapIconFromSvg(svgContent, size);
};