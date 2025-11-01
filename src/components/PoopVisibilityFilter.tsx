import React, { useState, useRef, useEffect } from 'react';

export type PoopVisibilityFilter = 'all' | 'mine' | 'friends' | 'public';

interface PoopVisibilityFilterProps {
  currentFilter: PoopVisibilityFilter;
  onFilterChange: (filter: PoopVisibilityFilter) => void;
  counts: {
    mine: number;
    friends: number;
    public: number;
    total: number;
  };
}

export const PoopVisibilityFilter: React.FC<PoopVisibilityFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filterOptions = [
    {
      value: 'all' as const,
      label: '全部便便',
      icon: '🌍',
      description: '顯示所有可見的便便',
      count: counts.total,
      color: 'text-gray-700'
    },
    {
      value: 'mine' as const,
      label: '我的便便',
      icon: '👤',
      description: '只顯示我的便便記錄',
      count: counts.mine,
      color: 'text-purple-700'
    },
    {
      value: 'friends' as const,
      label: '朋友便便',
      icon: '👥',
      description: '只顯示朋友的便便',
      count: counts.friends,
      color: 'text-blue-700'
    },
    {
      value: 'public' as const,
      label: '公開便便',
      icon: '🌐',
      description: '只顯示公開的便便',
      count: counts.public,
      color: 'text-green-700'
    },
  ];

  const currentOption = filterOptions.find(option => option.value === currentFilter);

  const handleFilterSelect = (filter: PoopVisibilityFilter) => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 主按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200 hover:bg-white transition-colors"
      >
        <span className="text-lg">{currentOption?.icon}</span>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-gray-800">
            {currentOption?.label}
          </div>
          <div className="text-xs text-gray-500">
            {currentOption?.count} 個便便
          </div>
        </div>
        <div className="text-sm font-bold text-purple-600 sm:hidden">
          {currentOption?.count}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜單 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">便便可見性</h3>
              <p className="text-xs text-gray-500">選擇要顯示的便便類型</p>
            </div>
            
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterSelect(option.value)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center ${
                  currentFilter === option.value ? 'bg-purple-50 border-r-4 border-purple-500' : ''
                }`}
              >
                <span className="text-2xl mr-3">{option.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      currentFilter === option.value ? 'text-purple-700' : 'text-gray-800'
                    }`}>
                      {option.label}
                    </span>
                    <span className={`text-sm font-bold ${option.color}`}>
                      {option.count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </p>
                </div>
                
                {currentFilter === option.value && (
                  <span className="text-purple-500 ml-2">✓</span>
                )}
              </button>
            ))}
          </div>
          
          {/* 底部提示 */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              💡 切換可見性來減少地圖上的便便數量
            </p>
          </div>
        </div>
      )}
    </div>
  );
};