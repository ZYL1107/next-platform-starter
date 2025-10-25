'use client';
import { useState } from 'react';
import ReviewCarousel from './review-carousel';
import ReviewForm from './review-form';

export default function ReviewSection({ gameId, reviews: initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);

  const handleReviewSubmitted = (newReview) => {
    setReviews([newReview, ...reviews]);
    setShowForm(false);
  };

  return (
    <div className="card bg-base-100 shadow-lg mb-8">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-2xl text-base-content">玩家评论</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? '取消' : '写评论'}
          </button>
        </div>

        {/* 评论表单 */}
        {showForm && (
          <ReviewForm
            gameId={gameId}
            onSubmitted={handleReviewSubmitted}
          />
        )}

        {/* 评论轮播 */}
        {reviews.length > 0 ? (
          <ReviewCarousel reviews={reviews} />
        ) : (
          <div className="text-center py-12 text-base-content opacity-60">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>暂无评论，快来成为第一个评论的玩家吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}
