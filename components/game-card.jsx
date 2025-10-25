import Link from 'next/link';
import Image from 'next/image';

export function GameCard({ game }) {
  return (
    <Link href={`/games/${game.id}`} className="group">
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* 游戏缩略图 */}
        <figure className="relative aspect-video bg-base-200 overflow-hidden">
          {game.thumbnail ? (
            <img
              src={game.thumbnail}
              alt={game.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-20 h-20 text-base-content opacity-20"
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

          {/* 播放按钮覆盖层 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary opacity-0 group-hover:opacity-90 transition-all duration-300 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary-content ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </figure>

        {/* 游戏信息 */}
        <div className="card-body">
          <h2 className="card-title text-lg">
            {game.name}
            {game.version && (
              <span className="badge badge-sm badge-ghost">v{game.version}</span>
            )}
          </h2>

          <p className="text-sm text-base-content opacity-70 line-clamp-2">
            {game.description || '暂无描述'}
          </p>

          <div className="card-actions justify-between items-center mt-2">
            {/* 方向标识 */}
            <div className="flex gap-1 items-center text-xs text-base-content opacity-50">
              {game.orientation === 'landscape' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                  </svg>
                  <span>横屏</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>竖屏</span>
                </>
              )}
            </div>

            {/* 查看详情按钮 */}
            <button className="btn btn-primary btn-sm">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
