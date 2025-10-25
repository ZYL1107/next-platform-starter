'use client';
import { useState, useEffect } from 'react';

export default function ReviewCarousel({ reviews }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, 5000); // 每5秒切换

    return () => clearInterval(timer);
  }, [isAutoPlaying, reviews.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev =>
      prev === 0 ? reviews.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % reviews.length);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (reviews.length === 0) return null;

  const currentReview = reviews[currentIndex];

  return (
    <div className="relative">
      {/* 评论卡片 */}
      <div className="bg-base-200 rounded-lg p-6 min-h-[200px]">
        {/* 评分显示 */}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`text-xl ${
                star <= currentReview.rating
                  ? 'text-warning'
                  : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* 评论内容 */}
        <p className="text-lg mb-4 leading-relaxed text-base-content">
          &ldquo;{currentReview.comment}&rdquo;
        </p>

        {/* 用户信息和时间 */}
        <div className="flex justify-between items-center text-sm text-base-content opacity-70">
          <span className="font-semibold">{currentReview.userName}</span>
          <span>
            {new Date(currentReview.timestamp).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>

      {/* 导航按钮 */}
      {reviews.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2"
            aria-label="上一条评论"
          >
            ❮
          </button>
          <button
            onClick={goToNext}
            className="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2"
            aria-label="下一条评论"
          >
            ❯
          </button>
        </>
      )}

      {/* 指示器 */}
      {reviews.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-base-300'
              }`}
              aria-label={`跳转到第${index + 1}条评论`}
            />
          ))}
        </div>
      )}

      {/* 自动播放控制 */}
      {reviews.length > 1 && (
        <div className="text-center mt-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="btn btn-ghost btn-xs"
          >
            {isAutoPlaying ? '⏸ 暂停自���播放' : '▶ 继续自动播放'}
          </button>
        </div>
      )}
    </div>
  );
}
