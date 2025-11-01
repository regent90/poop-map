import React, { useState } from 'react';

interface MobileQuickActionsProps {
  onOpenInventory?: () => void;
  onOpenFriends?: () => void;
  inventoryItemCount?: number;
  friendsCount?: number;
}

export const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({
  onOpenInventory,
  onOpenFriends,
  inventoryItemCount = 0,
  friendsCount = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      icon: '🎒',
      label: '道具庫存',
      action: onOpenInventory,
      badge: inventoryItemCount > 0 ? inventoryItemCount : undefined,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: '👥',
      label: '好友',
      action: onOpenFriends,
      badge: friendsCount > 0 ? friendsCount : undefined,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 xl:hidden">
      {/* 展開的操作按鈕 */}
      {isExpanded && (
        <div className="mb-4 space-y-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.action?.();
                setIsExpanded(false);
              }}
              className={`relative w-12 h-12 rounded-full ${action.color} text-white shadow-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110`}
              style={{
                animation: `slideUp 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              <span className="text-xl">{action.icon}</span>
              {action.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {action.badge > 9 ? '9+' : action.badge}
                </span>
              )}
              
              {/* 標籤 */}
              <div className="absolute right-14 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {action.label}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 主按鈕 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg flex items-center justify-center transition-all duration-300 ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <span className="text-2xl">
          {isExpanded ? '✕' : '⚡'}
        </span>
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};