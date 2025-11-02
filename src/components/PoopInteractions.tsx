import React, { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Poop, UserProfile, TranslationStrings, PoopLike, PoopComment } from '../types';
import { 
  addPoopLike,
  removePoopLike,
  addPoopComment, 
  deletePoopComment
} from '../services/unifiedDatabase';

interface PoopInteractionsProps {
  poop: Poop;
  currentUser: UserProfile;
  translations: TranslationStrings;
  isVisible: boolean; // 根據隱私設定決定是否顯示
}

export const PoopInteractions: React.FC<PoopInteractionsProps> = ({
  poop,
  currentUser,
  translations: t,
  isVisible
}) => {
  // 獲取當前用戶的顯示名稱
  const currentUserDisplayName = useQuery(api.users.getUserDisplayName, 
    currentUser?.email ? { email: currentUser.email } : "skip"
  );

  // 使用 Convex 即時查詢
  const likes = useQuery(api.interactions.getLikes, 
    isVisible ? { poopId: poop.id as Id<"poops"> } : "skip"
  ) || [];
  
  const comments = useQuery(api.interactions.getComments, 
    isVisible ? { poopId: poop.id as Id<"poops"> } : "skip"
  ) || [];

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  // 檢查當前用戶是否已按讚
  const isLiked = currentUser?.email ? 
    likes.some(like => like.userEmail === currentUser.email) : false;

  // 調試日誌
  useEffect(() => {
    if (isVisible && poop.id) {
      console.log(`📊 Convex real-time data for poop ${poop.id}: ${likes.length} likes, ${comments.length} comments`);
    }
  }, [likes, comments, poop.id, isVisible]);

  // 處理按讚/取消讚
  const handleToggleLike = async () => {
    if (!currentUser?.email || isTogglingLike) return;

    setIsTogglingLike(true);
    try {
      const isCurrentlyLiked = likes.some(like => like.userEmail === currentUser.email);
      
      if (isCurrentlyLiked) {
        // 移除按讚
        await removePoopLike(poop.id, currentUser.email);
        console.log(`👎 Like removed for poop ${poop.id}`);
      } else {
        // 添加按讚
        await addPoopLike(
          poop.id,
          currentUser.email,
          currentUser.email,
          currentUserDisplayName || currentUser.name || 'Unknown',
          currentUser.picture
        );
        console.log(`👍 Like added for poop ${poop.id}`);
      }
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setIsTogglingLike(false);
    }
  };

  // 處理添加留言
  const handleAddComment = async () => {
    if (!currentUser?.email || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await addPoopComment(
        poop.id,
        currentUser.email,
        currentUser.email,
        currentUserDisplayName || currentUser.name || 'Unknown',
        newComment.trim(),
        currentUser.picture
      );
      
      setNewComment('');
      console.log('💬 Comment added for poop:', poop.id);
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 處理刪除留言
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deletePoopComment(commentId);
      console.log('🗑️ Comment deleted:', commentId);
    } catch (error) {
      console.error('❌ Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      {/* 互動統計 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {likes.length > 0 && (
            <span className="flex items-center">
              <span className="mr-1">👍</span>
              {likes.length} {likes.length === 1 ? t.like : t.likes}
            </span>
          )}
          {comments.length > 0 && (
            <span className="flex items-center">
              <span className="mr-1">💬</span>
              {comments.length} {comments.length === 1 ? t.comment : t.comments}
            </span>
          )}
        </div>
      </div>

      {/* 互動按鈕 */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handleToggleLike}
          disabled={isTogglingLike}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isLiked 
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isTogglingLike ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>{isLiked ? '👍' : '👍'}</span>
          <span>{isLiked ? t.unlike : t.like}</span>
        </button>

        <button
          onClick={() => document.getElementById(`comment-input-${poop.id}`)?.focus()}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <span>💬</span>
          <span>{t.comment}</span>
        </button>
      </div>

      {/* 留言輸入 */}
      <div className="mb-4">
        <div className="flex items-start space-x-3">
          {currentUser?.picture && (
            <img 
              src={currentUser.picture} 
              alt={currentUser.name || 'User'} 
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex-1">
            <textarea
              id={`comment-input-${poop.id}`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t.writeComment}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  newComment.trim() && !isSubmittingComment
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmittingComment ? '...' : t.postComment}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 留言列表 */}
      {comments.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">{t.comments}</h4>
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
              {comment.userPicture && (
                <img 
                  src={comment.userPicture} 
                  alt={comment.userName} 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-gray-800">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {comment.userEmail === currentUser?.email && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      {t.deleteComment}
                    </button>
                  )}
                </div>
                <p className="text-gray-700 mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 按讚列表 */}
      {likes.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <details className="cursor-pointer">
            <summary className="text-sm text-gray-600 hover:text-gray-800">
              {t.likedBy} {likes.length} {likes.length === 1 ? 'person' : 'people'}
            </summary>
            <div className="mt-2 space-y-1">
              {likes.map((like) => (
                <div key={like.id} className="flex items-center space-x-2 text-sm">
                  {like.userPicture && (
                    <img 
                      src={like.userPicture} 
                      alt={like.userName} 
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-gray-700">{like.userName}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};