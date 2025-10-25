'use client';

export default function RatingSection({ stats }) {
  return (
    <div className="card bg-base-100 shadow-lg mb-8">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">评分分布</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：平均分显示 */}
          <div className="flex flex-col items-center justify-center p-6 bg-base-200 rounded-lg">
            <div className="text-6xl font-bold text-primary mb-2">
              {stats.averageRating}
            </div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`text-3xl ${
                    star <= Math.round(stats.averageRating)
                      ? 'text-warning'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-base-content opacity-70">
              基于 {stats.totalRatings} 个评分
            </p>
          </div>

          {/* 右侧：评分分布条形图 */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.totalRatings > 0
                ? (count / stats.totalRatings) * 100
                : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-12 text-right text-base-content">{rating}星</span>
                  <div className="flex-1 h-6 bg-base-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-base-content opacity-70">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
