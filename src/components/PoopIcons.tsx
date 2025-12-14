import React from 'react';

interface PoopIconProps {
  size?: number;
  className?: string;
}

// 自己的便便圖標 - 使用 3D 圖片
export const MyPoopIcon: React.FC<PoopIconProps> = ({ size = 24, className = '' }) => {
  return (
    <img
      src="/images/icon/icon_my_poop.png"
      alt="My Poop"
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// 好友的便便圖標 - 使用 3D 圖片
export const FriendPoopIcon: React.FC<PoopIconProps> = ({ size = 24, className = '' }) => {
  return (
    <img
      src="/images/icon/icon_friend_poop.png"
      alt="Friend Poop"
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// 地球圖標 - 用於顯示全部
export const GlobeIcon: React.FC<PoopIconProps> = ({ size = 24, className = '' }) => {
  return (
    <img
      src="/images/icon/icon_globe.png"
      alt="Globe"
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// 公開的便便圖標 - 使用 3D 圖片
export const PublicPoopIcon: React.FC<PoopIconProps> = ({ size = 24, className = '' }) => {
  return (
    <img
      src="/images/icon/icon_public_poop.png"
      alt="Public Poop"
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// 便便圖標選擇器組件
interface PoopIconSelectorProps {
  type: 'my' | 'friend' | 'public';
  size?: number;
  className?: string;
}

export const PoopIcon: React.FC<PoopIconSelectorProps> = ({ type, size = 24, className = '' }) => {
  switch (type) {
    case 'my':
      return <MyPoopIcon size={size} className={className} />;
    case 'friend':
      return <FriendPoopIcon size={size} className={className} />;
    case 'public':
      return <PublicPoopIcon size={size} className={className} />;
    default:
      return <MyPoopIcon size={size} className={className} />;
  }
};