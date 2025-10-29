import React from 'react';

interface PoopIconProps {
  size?: number;
  className?: string;
}

// 自己的便便圖標 - 金黃色，帶有光環效果
export const MyPoopIcon: React.FC<PoopIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 光環效果 */}
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="rgba(251, 191, 36, 0.2)"
        stroke="rgba(251, 191, 36, 0.4)"
        strokeWidth="1"
      />
      
      {/* 便便主體 */}
      <path
        d="M12 4c-1.5 0-2.5 1-2.5 2.5 0 0.5 0.2 1 0.5 1.4-1.2 0.3-2 1.4-2 2.6 0 0.8 0.3 1.5 0.8 2-1 0.4-1.8 1.3-1.8 2.5 0 1.7 1.3 3 3 3h4c1.7 0 3-1.3 3-3 0-1.2-0.8-2.1-1.8-2.5 0.5-0.5 0.8-1.2 0.8-2 0-1.2-0.8-2.3-2-2.6 0.3-0.4 0.5-0.9 0.5-1.4C14.5 5 13.5 4 12 4z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="0.5"
      />
      
      {/* 閃亮效果 */}
      <ellipse cx="10.5" cy="8" rx="1" ry="0.5" fill="#FEF3C7" opacity="0.8" />
      <ellipse cx="13" cy="11" rx="0.8" ry="0.4" fill="#FEF3C7" opacity="0.6" />
    </svg>
  );
};

// 好友的便便圖標 - 藍綠色，友善的感覺
export const FriendPoopIcon: React.FC<PoopIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 友善光暈 */}
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="rgba(34, 197, 94, 0.15)"
        stroke="rgba(34, 197, 94, 0.3)"
        strokeWidth="1"
      />
      
      {/* 便便主體 */}
      <path
        d="M12 4c-1.5 0-2.5 1-2.5 2.5 0 0.5 0.2 1 0.5 1.4-1.2 0.3-2 1.4-2 2.6 0 0.8 0.3 1.5 0.8 2-1 0.4-1.8 1.3-1.8 2.5 0 1.7 1.3 3 3 3h4c1.7 0 3-1.3 3-3 0-1.2-0.8-2.1-1.8-2.5 0.5-0.5 0.8-1.2 0.8-2 0-1.2-0.8-2.3-2-2.6 0.3-0.4 0.5-0.9 0.5-1.4C14.5 5 13.5 4 12 4z"
        fill="#10B981"
        stroke="#059669"
        strokeWidth="0.5"
      />
      
      {/* 友善的眼睛 */}
      <circle cx="10.5" cy="9" r="0.8" fill="#065F46" />
      <circle cx="13.5" cy="9" r="0.8" fill="#065F46" />
      <circle cx="10.7" cy="8.8" r="0.3" fill="#ECFDF5" />
      <circle cx="13.7" cy="8.8" r="0.3" fill="#ECFDF5" />
      
      {/* 微笑 */}
      <path
        d="M10.5 12c0.5 0.5 1 0.8 1.5 0.8s1-0.3 1.5-0.8"
        stroke="#065F46"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// 公開的便便圖標 - 紫色，帶有分享符號
export const PublicPoopIcon: React.FC<PoopIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 公開光暈 */}
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="rgba(147, 51, 234, 0.15)"
        stroke="rgba(147, 51, 234, 0.3)"
        strokeWidth="1"
      />
      
      {/* 便便主體 */}
      <path
        d="M12 4c-1.5 0-2.5 1-2.5 2.5 0 0.5 0.2 1 0.5 1.4-1.2 0.3-2 1.4-2 2.6 0 0.8 0.3 1.5 0.8 2-1 0.4-1.8 1.3-1.8 2.5 0 1.7 1.3 3 3 3h4c1.7 0 3-1.3 3-3 0-1.2-0.8-2.1-1.8-2.5 0.5-0.5 0.8-1.2 0.8-2 0-1.2-0.8-2.3-2-2.6 0.3-0.4 0.5-0.9 0.5-1.4C14.5 5 13.5 4 12 4z"
        fill="#9333EA"
        stroke="#7C3AED"
        strokeWidth="0.5"
      />
      
      {/* 分享符號 */}
      <g transform="translate(15, 6)">
        <circle cx="0" cy="0" r="3" fill="#FFFFFF" stroke="#9333EA" strokeWidth="0.5" />
        <path
          d="M-1.5 -0.5 L0 0.5 L-1.5 1.5"
          stroke="#9333EA"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M-1 0 L1 0"
          stroke="#9333EA"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </g>
      
      {/* 星星效果 */}
      <g transform="translate(8, 7)">
        <path
          d="M0 -1 L0.3 -0.3 L1 0 L0.3 0.3 L0 1 L-0.3 0.3 L-1 0 L-0.3 -0.3 Z"
          fill="#F3E8FF"
          opacity="0.8"
        />
      </g>
    </svg>
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