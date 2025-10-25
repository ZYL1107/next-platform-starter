'use client';
import { useState } from 'react';
import { submitReview } from '../actions';

export default function ReviewForm({ gameId, onSubmitted }) {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 验证
    if (!userName.trim()) {
      setError('请输入昵称');
      return;
    }

    if (rating === 0) {
      setError('请选择评分');
      return;
    }

    if (comment.length < 5) {
      setError('评论至少需要5个字');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReview(gameId, userName, rating, comment);

      if (result.success) {
        // 清空表单
        setUserName('');
        setRating(0);
        setComment('');

        // 通知父组件
        if (onSubmitted && result.review) {
          onSubmitted(result.review);
        }
      } else {
        setError(result.error || '提交失败');
      }
    } catch (err) {
      setError('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      5: '非常棒！',
      4: '很好',
      3: '还不错',
      2: '一般',
      1: '不太好'
    };
    return texts[rating] || '';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-base-200 rounded-lg p-6 mb-6">
      <h3 className="font-bold text-lg mb-4 text-base-content">发表评论</h3>

      {/* 昵称输入 */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-base-content">昵称</span>
        </label>
        <input
          type="text"
          placeholder="请输入你的昵称"
          className="input input-bordered text-base-content"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          maxLength={20}
          disabled={isSubmitting}
        />
      </div>

      {/* 评分选择 */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-base-content">评分</span>
        </label>
        <div className="flex gap-2 items-center">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-4xl transition-transform hover:scale-110"
              disabled={isSubmitting}
            >
              <span
                className={
                  star <= (hoveredRating || rating)
                    ? 'text-warning'
                    : 'text-gray-300'
                }
              >
                ★
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-base-content opacity-70">
              {getRatingText(rating)}
            </span>
          )}
        </div>
      </div>

      {/* 评论输入 */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-base-content">评论内容</span>
          <span className="label-text-alt text-base-content opacity-70">{comment.length}/500</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24 text-base-content"
          placeholder="分享你的游戏体验..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          disabled={isSubmitting}
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 提交按钮 */}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner"></span>
            提交中...
          </>
        ) : (
          '提交评论'
        )}
      </button>
    </form>
  );
}
