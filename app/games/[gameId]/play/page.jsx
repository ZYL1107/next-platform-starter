import { notFound } from 'next/navigation';
import { getGameInfo, gameExists } from '../../actions';
import GamePlayer from './game-player';

export async function generateMetadata({ params }) {
  const { gameId } = await params;
  const gameInfo = await getGameInfo(gameId);

  if (!gameInfo) {
    return {
      title: '游戏未找到',
    };
  }

  return {
    title: `${gameInfo.name} - 游戏中心`,
    description: gameInfo.description || `在线畅玩 ${gameInfo.name}`,
  };
}

export default async function GamePlayPage({ params }) {
  const { gameId } = await params;

  // 并行获取游戏信息和检查是否存在
  const [exists, gameInfo] = await Promise.all([
    gameExists(gameId),
    getGameInfo(gameId),
  ]);

  if (!exists || !gameInfo) {
    notFound();
  }

  return <GamePlayer gameInfo={gameInfo} />;
}
