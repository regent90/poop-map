import React, { useState } from 'react';
import { MyPoopIcon, FriendPoopIcon, PublicPoopIcon, PoopIcon } from './PoopIcons';
import { IconUsageExample } from './IconUsageExample';

export const IconShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'design' | 'usage'>('design');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          便便圖標設計展示
        </h1>
        
        {/* 標籤頁導航 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('design')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'design'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              設計展示
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'usage'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              使用示例
            </button>
          </div>
        </div>

        {activeTab === 'design' ? (
          <div>
        
        {/* 個別圖標展示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* 我的便便 */}
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4 text-amber-800">我的便便</h2>
            <div className="flex justify-center items-center mb-4">
              <MyPoopIcon size={64} />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              金黃色設計，帶有光環效果和閃亮細節，突出個人記錄的特殊性
            </p>
            <div className="flex justify-center gap-2">
              <MyPoopIcon size={16} />
              <MyPoopIcon size={24} />
              <MyPoopIcon size={32} />
              <MyPoopIcon size={48} />
            </div>
          </div>

          {/* 好友的便便 */}
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4 text-green-700">好友的便便</h2>
            <div className="flex justify-center items-center mb-4">
              <FriendPoopIcon size={64} />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              藍綠色設計，帶有友善的眼睛和微笑，營造溫馨的社交氛圍
            </p>
            <div className="flex justify-center gap-2">
              <FriendPoopIcon size={16} />
              <FriendPoopIcon size={24} />
              <FriendPoopIcon size={32} />
              <FriendPoopIcon size={48} />
            </div>
          </div>

          {/* 公開的便便 */}
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">公開的便便</h2>
            <div className="flex justify-center items-center mb-4">
              <PublicPoopIcon size={64} />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              紫色設計，帶有分享符號和星星效果，表示公開分享的內容
            </p>
            <div className="flex justify-center gap-2">
              <PublicPoopIcon size={16} />
              <PublicPoopIcon size={24} />
              <PublicPoopIcon size={32} />
              <PublicPoopIcon size={48} />
            </div>
          </div>
        </div>

        {/* 使用場景示例 */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">使用場景示例</h2>
          
          {/* 統計信息 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">統計信息顯示</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <PoopIcon type="my" size={20} />
                <span className="text-sm text-gray-600">我的記錄: 15 筆</span>
              </div>
              <div className="flex items-center gap-2">
                <PoopIcon type="friend" size={20} />
                <span className="text-sm text-gray-600">好友記錄: 8 筆</span>
              </div>
              <div className="flex items-center gap-2">
                <PoopIcon type="public" size={20} />
                <span className="text-sm text-gray-600">公開記錄: 23 筆</span>
              </div>
            </div>
          </div>

          {/* 地圖標記 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">地圖標記</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-1">
                  <PoopIcon type="my" size={16} />
                  <span className="text-xs text-gray-500">我的位置</span>
                </div>
                <div className="flex items-center gap-1">
                  <PoopIcon type="friend" size={16} />
                  <span className="text-xs text-gray-500">好友位置</span>
                </div>
                <div className="flex items-center gap-1">
                  <PoopIcon type="public" size={16} />
                  <span className="text-xs text-gray-500">公開位置</span>
                </div>
              </div>
            </div>
          </div>

          {/* 列表項目 */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">記錄列表</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-amber-50 rounded">
                <PoopIcon type="my" size={24} />
                <div>
                  <div className="font-medium text-sm">今天 14:30</div>
                  <div className="text-xs text-gray-500">台北市信義區</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                <PoopIcon type="friend" size={24} />
                <div>
                  <div className="font-medium text-sm">小明 - 今天 12:15</div>
                  <div className="text-xs text-gray-500">台北市大安區</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-purple-50 rounded">
                <PoopIcon type="public" size={24} />
                <div>
                  <div className="font-medium text-sm">匿名用戶 - 昨天 16:45</div>
                  <div className="text-xs text-gray-500">台北市中山區</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 設計說明 */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">設計理念</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-amber-800 mb-2">我的便便 (金黃色)</h3>
              <ul className="space-y-1">
                <li>• 使用溫暖的金黃色調</li>
                <li>• 添加光環效果突出重要性</li>
                <li>• 閃亮細節增加個人化感受</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-700 mb-2">好友的便便 (藍綠色)</h3>
              <ul className="space-y-1">
                <li>• 使用友善的藍綠色調</li>
                <li>• 添加眼睛和微笑表情</li>
                <li>• 營造溫馨的社交氛圍</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-purple-700 mb-2">公開的便便 (紫色)</h3>
              <ul className="space-y-1">
                <li>• 使用醒目的紫色調</li>
                <li>• 添加分享符號表示公開性</li>
                <li>• 星星效果增加吸引力</li>
              </ul>
            </div>
          </div>
        </div>
          </div>
        ) : (
          <IconUsageExample />
        )}
      </div>
    </div>
  );
};