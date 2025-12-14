import React, { useState, useRef, useEffect } from 'react';
import { MyPoopIcon, FriendPoopIcon, PublicPoopIcon, GlobeIcon } from './PoopIcons';

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
  translations: any; // 添加翻譯支援
}

export const PoopVisibilityFilter: React.FC<PoopVisibilityFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  translations,
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
      label: translations.allPoops,
      icon: null,
      description: translations.showAllVisible,
      color: 'text-gray-700',
      component: <GlobeIcon size={20} />
    },
    {
      value: 'mine' as const,
      label: translations.myPoops,
      icon: null,
      description: translations.showMyPoops,
      color: 'text-amber-700',
      component: <MyPoopIcon size={20} />
    },
    {
      value: 'friends' as const,
      label: translations.friendPoops,
      icon: null,
      description: translations.showFriendPoops,
      color: 'text-green-700',
      component: <FriendPoopIcon size={20} />
    },
    {
      value: 'public' as const,
      label: translations.publicPoops,
      icon: null,
      description: translations.showPublicPoops,
      color: 'text-purple-700',
      component: <PublicPoopIcon size={20} />
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
        <div className="flex items-center justify-center w-5 h-5">
          {currentOption?.component ? (
            currentOption.component
          ) : (
            <span className="text-lg">{currentOption?.icon}</span>
          )}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-gray-800">
            {currentOption?.label}
          </div>
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
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">{translations.poopVisibility}</h3>
              <p className="text-xs text-gray-500">{translations.selectPoopType}</p>
            </div>

            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterSelect(option.value)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center ${currentFilter === option.value ? 'bg-amber-50 border-r-4 border-amber-500' : ''
                  }`}
              >
                <div className="flex items-center justify-center w-8 h-8 mr-3">
                  {option.component ? (
                    React.cloneElement(option.component, { size: 24 })
                  ) : (
                    <span className="text-2xl">{option.icon}</span>
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${currentFilter === option.value ? 'text-amber-700' : 'text-gray-800'
                    }`}>
                    {option.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </p>
                </div>

                {currentFilter === option.value && (
                  <span className="text-amber-500 ml-2">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* 底部提示 */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              💡 {translations.switchVisibilityTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};