import { listGames } from './games/actions';
import { GameCard } from 'components/game-card';

export const metadata = {
  title: '游戏中心 - Cocos 游戏合集',
  description: '在线畅玩各种精彩的 Cocos 游戏，支持手机和电脑访问',
};

export default async function Page() {
  const games = await listGames();

  return (
    <div className="min-h-screen bg-base-100">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">游戏中心</h1>
          <p className="text-lg opacity-90">
            探索精彩的 Cocos 游戏世界，随时随地畅玩
          </p>

          {/* 统计信息 */}
          <div className="mt-6 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              <span>{games.length} 个游戏</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>支持移动设备</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>秒速加载</span>
            </div>
          </div>
        </div>
      </div>

      {/* 游戏列表 */}
      <div className="container mx-auto px-4 py-12">
        {games.length === 0 ? (
          // 空状态
          <div className="text-center py-20">
            <svg
              className="w-24 h-24 mx-auto text-base-content opacity-20 mb-6"
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
            <h2 className="text-2xl font-bold mb-2">还没有游戏</h2>
            <p className="text-base-content opacity-60 mb-6">
              将您的 Cocos 游戏放到 public/games/ 目录下即可
            </p>
            <div className="mockup-code text-left max-w-2xl mx-auto">
              <pre data-prefix="$"><code>mkdir public/games/my-game</code></pre>
              <pre data-prefix="$"><code>cp -r /path/to/cocos/build/web-mobile/* public/games/my-game/</code></pre>
              <pre data-prefix="$"><code>{`echo '{"id":"my-game","name":"我的游戏"}' > public/games/my-game/game.json`}</code></pre>
            </div>
          </div>
        ) : (
          // 游戏网格
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="bg-base-200 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="alert shadow-lg">
            <svg className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="font-bold">使用提示</h3>
              <div className="text-xs">
                横屏游戏建议旋转手机以获得最佳体验 | 支持全屏模式
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}