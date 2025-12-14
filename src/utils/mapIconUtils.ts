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

// 將 React 組件轉換為 SVG 字符串用於地圖標記 (暫時保留函數簽名以避免報錯，但應該沒人用了)
export const createMapIconFromSvg = (svgString: string, size: number = 32): any => {
  return null;
};

// 使用新的 3D PNG 圖標
export const createPoopMapIcon = (type: 'my' | 'friend' | 'public', size: number = 32): any => {
  const google = (window as any).google;

  if (!google?.maps) {
    return null;
  }

  let iconUrl;
  switch (type) {
    case 'my':
      iconUrl = '/images/ui/map_marker_my.png';
      break;
    case 'friend':
      iconUrl = '/images/ui/map_marker_friend.png';
      break;
    case 'public':
      iconUrl = '/images/ui/map_marker_public.png';
      break;
    default:
      iconUrl = '/images/ui/map_marker_public.png';
  }

  return {
    url: iconUrl,
    scaledSize: new google.maps.Size(size * 1.5, size * 1.5), // 稍微放大一點因為 3D 圖標細節較多
    anchor: new google.maps.Point(size * 0.75, size * 1.5) // 錨點設在底部中心 (修正：因為圖是方的，設在底部中心比較像圖釘)
  };
};