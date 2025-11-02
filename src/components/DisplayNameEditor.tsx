import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface DisplayNameEditorProps {
  userEmail: string;
  currentDisplayName: string;
  onClose: () => void;
  onSuccess: (newDisplayName: string) => void;
}

export const DisplayNameEditor: React.FC<DisplayNameEditorProps> = ({
  userEmail,
  currentDisplayName,
  onClose,
  onSuccess,
}) => {
  const [newDisplayName, setNewDisplayName] = useState(currentDisplayName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDisplayName = useMutation(api.users.updateDisplayName);
  const canChange = useQuery(api.users.canChangeDisplayName, { email: userEmail });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canChange) {
      setError('您已經使用過免費改名機會');
      return;
    }

    const trimmedName = newDisplayName.trim();
    if (!trimmedName) {
      setError('顯示名稱不能為空');
      return;
    }

    if (trimmedName.length > 20) {
      setError('顯示名稱不能超過 20 個字符');
      return;
    }

    if (trimmedName === currentDisplayName) {
      setError('新名稱與當前名稱相同');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateDisplayName({
        email: userEmail,
        displayName: trimmedName,
      });
      
      onSuccess(trimmedName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  if (canChange === undefined) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {canChange ? '✏️ 編輯顯示名稱' : '📝 顯示名稱'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {!canChange ? (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">😅</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              已使用改名機會
            </h3>
            <p className="text-gray-600 mb-4">
              您已經使用過免費改名機會，目前的顯示名稱是：
            </p>
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <span className="font-semibold text-purple-600">{currentDisplayName}</span>
            </div>
            <p className="text-sm text-gray-500">
              如需再次更改，請聯繫客服或等待未來的付費改名功能。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新的顯示名稱
              </label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="輸入您的新顯示名稱"
                maxLength={20}
                disabled={isLoading}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {newDisplayName.length}/20 字符
                </span>
                <span className="text-xs text-orange-500">
                  ⚠️ 免費改名僅限一次
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">💡</span>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">改名須知：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>每個帳號僅有一次免費改名機會</li>
                    <li>名稱長度限制為 20 個字符</li>
                    <li>不能包含不當內容</li>
                    <li>改名後立即生效，無法撤銷</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isLoading || !newDisplayName.trim() || newDisplayName.trim() === currentDisplayName}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    更新中...
                  </div>
                ) : (
                  '確認更改'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};