import { notFound } from 'next/navigation';
import { getGameInfo, gameExists } from '../actions';
import GamePlayer from './game-player';

export async function generateMetadata({ params }) {
  const gameInfo = await getGameInfo(params.gameId);

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

export default async function GamePage({ params }) {
  const { gameId } = params;

  // 检查游戏是否存在
  const exists = await gameExists(gameId);
  if (!exists) {
    notFound();
  }

  // 获取游戏信息
  const gameInfo = await getGameInfo(gameId);
  if (!gameInfo) {
    notFound();
  }

  return <GamePlayer gameInfo={gameInfo} />;
}
