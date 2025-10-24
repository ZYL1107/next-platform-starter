'use server';

import fs from 'fs';
import path from 'path';

/**
 * 列出所有游戏
 * 扫描 public/games 目录，读取所有 game.json 配置文件
 */
export async function listGames() {
  try {
    const gamesDir = path.join(process.cwd(), 'public/games');

    // 检查目录是否存在
    if (!fs.existsSync(gamesDir)) {
      return [];
    }

    const folders = fs.readdirSync(gamesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const games = folders.map(folder => {
      const configPath = path.join(gamesDir, folder, 'game.json');
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          return config;
        } catch (error) {
          console.error(`Error reading game config for ${folder}:`, error);
          return null;
        }
      }
      return null;
    }).filter(Boolean);

    // 按创建时间倒序排列
    games.sort((a, b) => new Date(b.created) - new Date(a.created));

    return games;
  } catch (error) {
    console.error('Error listing games:', error);
    return [];
  }
}

/**
 * 获取单个游戏信息
 * @param {string} gameId - 游戏ID
 */
export async function getGameInfo(gameId) {
  try {
    const configPath = path.join(
      process.cwd(),
      'public/games',
      gameId,
      'game.json'
    );

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config;
    }

    return null;
  } catch (error) {
    console.error(`Error getting game info for ${gameId}:`, error);
    return null;
  }
}

/**
 * 检查游戏是否存在
 * @param {string} gameId - 游戏ID
 */
export async function gameExists(gameId) {
  try {
    const gamePath = path.join(process.cwd(), 'public/games', gameId, 'index.html');
    return fs.existsSync(gamePath);
  } catch (error) {
    return false;
  }
}
