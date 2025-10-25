'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GamePlayer({ gameInfo }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showOrientationHint, setShowOrientationHint] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 检查屏幕方向
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const needsLandscape = gameInfo.orientation === 'landscape';

      if (needsLandscape && isPortrait) {
        setShowOrientationHint(true);
      } else {
        setShowOrientationHint(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [gameInfo.orientation]);

  const handleFullscreen = () => {
    const gameContainer = document.getElementById('game-container');
    if (!document.fullscreenElement) {
      gameContainer.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* 顶部导航栏 */}
      {!isFullscreen && (
        <div className="bg-base-300 text-base-content px-4 py-3 flex items-center justify-between shadow-lg z-50">
          <div className="flex items-center gap-3">
            <Link
              href={`/games/${gameInfo.id}`}
              className="btn btn-ghost btn-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回详情
            </Link>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg">{gameInfo.name}</h1>
              {gameInfo.version && (
                <p className="text-xs opacity-60">v{gameInfo.version}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 方向提示 */}
            {gameInfo.orientation === 'landscape' && (
              <div className="hidden md:flex items-center gap-1 text-xs opacity-60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                </svg>
                <span>建议横屏</span>
              </div>
            )}

            {/* 全屏按钮 */}
            <button
              onClick={handleFullscreen}
              className="btn btn-ghost btn-sm"
              title="全屏"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 游戏容器 */}
      <div id="game-container" className="flex-1 relative">
        {/* 加载动画 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-200 z-40">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
              <p className="text-lg font-semibold">正在加载游戏...</p>
              <p className="text-sm opacity-60 mt-2">{gameInfo.name}</p>
            </div>
          </div>
        )}

        {/* 横屏提示 */}
        {showOrientationHint && !isFullscreen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-30">
            <div className="text-center text-white p-6">
              <svg className="w-20 h-20 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">建议旋转屏幕</h2>
              <p className="opacity-80">此游戏适合横屏模式游玩</p>
            </div>
          </div>
        )}

        {/* 游戏 iframe */}
        <iframe
          src={`/games/${gameInfo.id}/index.html`}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          allowFullScreen
          allow="accelerometer; gyroscope; fullscreen"
        />
      </div>
    </div>
  );
}
