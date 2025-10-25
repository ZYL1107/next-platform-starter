import { notFound } from 'next/navigation';
import Link from 'next/link';
import { gameExists, getGameInfo } from '../actions';
import { getGameStats, getGameReviews } from './actions';
import GameInfoCard from './components/game-info-card';
import RatingSection from './components/rating-section';
import ReviewSection from './components/review-section';

export async function generateMetadata({ params }) {
  const { gameId } = await params;
  const gameInfo = await getGameInfo(gameId);

  if (!gameInfo) {
    return {
      title: '游戏未找到',
    };
  }

  return {
    title: `${gameInfo.name} - 游戏详情`,
    description: gameInfo.description || `查看 ${gameInfo.name} 的详细信息、评分和玩家评论`,
  };
}

export default async function GameDetailPage({ params }) {
  const { gameId } = await params;

  // 并行获取数据
  const [exists, gameInfo, stats, reviews] = await Promise.all([
    gameExists(gameId),
    getGameInfo(gameId),
    getGameStats(gameId),
    getGameReviews(gameId, 20)
  ]);

  if (!exists || !gameInfo) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 返回按钮 */}
      <Link href="/games" className="btn btn-ghost mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回游戏列表
      </Link>

      {/* 游戏信息卡片 */}
      <GameInfoCard gameInfo={gameInfo} stats={stats} />

      {/* 评分区域 */}
      <RatingSection stats={stats} />

      {/* 评论区域 */}
      <ReviewSection gameId={gameId} reviews={reviews} />

      {/* 开始游戏按钮 */}
      <div className="text-center mt-8 mb-12">
        <Link
          href={`/games/${gameId}/play`}
          className="btn btn-primary btn-lg gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          开始游戏
        </Link>
      </div>
    </div>
  );
}
