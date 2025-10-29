import React from 'react';
import { PoopIcon } from './PoopIcons';

export const IconUsageExample: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">便便圖標使用示例</h2>
      
      {/* 基本使用 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">基本使用</h3>
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <div className="text-center">
            <PoopIcon type="my" size={32} />
            <p className="text-sm mt-2 text-gray-600">我的便便</p>
          </div>
          <div className="text-center">
            <PoopIcon type="friend" size={32} />
            <p className="text-sm mt-2 text-gray-600">好友的便便</p>
          </div>
          <div className="text-center">
            <PoopIcon type="public" size={32} />
            <p className="text-sm mt-2 text-gray-600">公開的便便</p>
          </div>
        </div>
      </div>

      {/* 不同尺寸 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">不同尺寸</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow text-center">
            <h4 className="font-medium mb-3 text-amber-800">我的便便</h4>
            <div className="flex justify-center items-end gap-2">
              <PoopIcon type="my" size={16} />
              <PoopIcon type="my" size={24} />
              <PoopIcon type="my" size={32} />
              <PoopIcon type="my" size={48} />
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow text-center">
            <h4 className="font-medium mb-3 text-green-700">好友的便便</h4>
            <div className="flex justify-center items-end gap-2">
              <PoopIcon type="friend" size={16} />
              <PoopIcon type="friend" size={24} />
              <PoopIcon type="friend" size={32} />
              <PoopIcon type="friend" size={48} />
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow text-center">
            <h4 className="font-medium mb-3 text-purple-700">公開的便便</h4>
            <div className="flex justify-center items-end gap-2">
              <PoopIcon type="public" size={16} />
              <PoopIcon type="public" size={24} />
              <PoopIcon type="public" size={32} />
              <PoopIcon type="public" size={48} />
            </div>
          </div>
        </div>
      </div>

      {/* 在列表中使用 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">在列表中使用</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            <div className="p-4 flex items-center gap-3 hover:bg-gray-50">
              <PoopIcon type="my" size={24} />
              <div className="flex-1">
                <div className="font-medium text-gray-900">我的便便記錄</div>
                <div className="text-sm text-gray-500">今天 14:30 - 台北市信義區</div>
              </div>
              <div className="text-sm text-amber-600">⭐⭐⭐⭐⭐</div>
            </div>
            <div className="p-4 flex items-center gap-3 hover:bg-gray-50">
              <PoopIcon type="friend" size={24} />
              <div className="flex-1">
                <div className="font-medium text-gray-900">小明的便便記錄</div>
                <div className="text-sm text-gray-500">今天 12:15 - 台北市大安區</div>
              </div>
              <div className="text-sm text-green-600">⭐⭐⭐</div>
            </div>
            <div className="p-4 flex items-center gap-3 hover:bg-gray-50">
              <PoopIcon type="public" size={24} />
              <div className="flex-1">
                <div className="font-medium text-gray-900">匿名用戶的便便記錄</div>
                <div className="text-sm text-gray-500">昨天 16:45 - 台北市中山區</div>
              </div>
              <div className="text-sm text-purple-600">⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* 在按鈕中使用 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">在按鈕中使用</h3>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors">
            <PoopIcon type="my" size={20} />
            <span>查看我的記錄</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
            <PoopIcon type="friend" size={20} />
            <span>查看好友記錄</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors">
            <PoopIcon type="public" size={20} />
            <span>查看公開記錄</span>
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">統計卡片</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-800">15</div>
                <div className="text-sm text-amber-600">我的記錄</div>
              </div>
              <PoopIcon type="my" size={40} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-800">8</div>
                <div className="text-sm text-green-600">好友記錄</div>
              </div>
              <PoopIcon type="friend" size={40} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-800">23</div>
                <div className="text-sm text-purple-600">公開記錄</div>
              </div>
              <PoopIcon type="public" size={40} />
            </div>
          </div>
        </div>
      </div>

      {/* 代碼示例 */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-white">代碼示例</h3>
        <pre className="text-green-400 text-sm overflow-x-auto">
{`// 基本使用
<PoopIcon type="my" size={32} />
<PoopIcon type="friend" size={32} />
<PoopIcon type="public" size={32} />

// 在按鈕中使用
<button className="flex items-center gap-2">
  <PoopIcon type="my" size={20} />
  <span>我的便便</span>
</button>

// 自定義樣式
<PoopIcon 
  type="friend" 
  size={24} 
  className="hover:scale-110 transition-transform" 
/>`}
        </pre>
      </div>
    </div>
  );
};