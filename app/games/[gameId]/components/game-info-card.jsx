'use client';

export default function GameInfoCard({ gameInfo, stats }) {
  return (
    <div className="card bg-base-100 shadow-xl mb-8">
      <div className="card-body lg:flex-row gap-6">
        {/* 游戏缩略图 */}
        <div className="flex-shrink-0">
          {gameInfo.thumbnail ? (
            <img
              src={gameInfo.thumbnail}
              alt={gameInfo.name}
              width={300}
              height={300}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-[300px] h-[300px] rounded-lg bg-base-200 flex items-center justify-center">
              <svg
                className="w-32 h-32 text-base-content opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 游戏信息 */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2 text-base-content">{gameInfo.name}</h1>

          {/* 评分显示 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`text-2xl ${
                    star <= Math.round(stats.averageRating)
                      ? 'text-warning'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xl font-semibold text-base-content">{stats.averageRating}</span>
            <span className="text-sm text-base-content opacity-70">
              ({stats.totalRatings} 个评分)
            </span>
          </div>

          {/* 游戏描述 */}
          <p className="text-lg text-base-content opacity-80 mb-4">
            {gameInfo.description || '暂无描述'}
          </p>

          {/* 游戏信息标签 */}
          <div className="flex flex-wrap gap-2">
            <div className="badge badge-outline text-base-content">
              版本 {gameInfo.version || '1.0.0'}
            </div>
            <div className="badge badge-outline text-base-content">
              {gameInfo.orientation === 'landscape' ? '横屏' : '竖屏'}
            </div>
            <div className="badge badge-outline text-base-content">
              {stats.totalReviews} 条评论
            </div>
            {gameInfo.created && (
              <div className="badge badge-outline text-base-content">
                发布于 {gameInfo.created}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
