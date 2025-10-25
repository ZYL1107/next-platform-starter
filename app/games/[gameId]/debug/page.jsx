import Link from 'next/link';
import { gameExists, getGameInfo } from '../../actions';

export default async function GameDebugPage({ params }) {
  const { gameId } = await params;

  // 获取详细信息
  const exists = await gameExists(gameId);
  const gameInfo = await getGameInfo(gameId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">游戏调试信息</h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">URL 参数</h2>
          <pre className="bg-base-200 p-4 rounded overflow-auto">
            {JSON.stringify({ gameId }, null, 2)}
          </pre>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-4">
        <div className="card-body">
          <h2 className="card-title">游戏是否存在</h2>
          <pre className="bg-base-200 p-4 rounded overflow-auto">
            {JSON.stringify({ exists }, null, 2)}
          </pre>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-4">
        <div className="card-body">
          <h2 className="card-title">游戏信息</h2>
          <pre className="bg-base-200 p-4 rounded overflow-auto">
            {JSON.stringify(gameInfo, null, 2)}
          </pre>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-4">
        <div className="card-body">
          <h2 className="card-title">环境信息</h2>
          <pre className="bg-base-200 p-4 rounded overflow-auto">
            {JSON.stringify({
              NODE_ENV: process.env.NODE_ENV,
              NETLIFY: process.env.NETLIFY,
              CONTEXT: process.env.CONTEXT,
              cwd: process.cwd()
            }, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link href={`/games/${gameId}`} className="btn btn-primary">
          去游戏详情页
        </Link>
        <Link href={`/games/${gameId}/play`} className="btn btn-secondary">
          去游戏播放页
        </Link>
        <Link href="/games" className="btn btn-ghost">
          返回游戏列表
        </Link>
      </div>
    </div>
  );
}
