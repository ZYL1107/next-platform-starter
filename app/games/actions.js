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
    const decodedGameId = decodeURIComponent(gameId);
    console.log(`[getGameInfo] 尝试获取游戏信息，gameId: ${decodedGameId}`);
    const configPath = path.join(
      process.cwd(),
      'public/games',
      decodedGameId,
      'game.json'
    );

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log(`[getGameInfo] 找到游戏信息，返回: ${JSON.stringify(config)}`);
      return config;
    }

    return null;
  } catch (error) {
    console.log(`[getGameInfo] 未找到游戏信息，configPath: ${configPath}`);
    console.error(`Error getting game info for ${gameId}:`, error);
    console.log(`[getGameInfo] 错误，返回 null`);
    return null;
  }
}

/**
 * 检查游戏是否存在
 * @param {string} gameId - 游戏ID
 */
export async function gameExists(gameId) {
  try {
    const decodedGameId = decodeURIComponent(gameId);
    console.log(`[gameExists] 检查游戏是否存在，gameId: ${decodedGameId}`);
    const gamePath = path.join(process.cwd(), 'public/games', decodedGameId, 'index.html');
    const exists = fs.existsSync(gamePath);
    console.log(`[gameExists] 检查路径: ${gamePath}, 结果: ${exists}`);
    return exists;
  } catch (error) {
    console.error(`Error checking game existence for ${gameId}:`, error);
    console.log(`[gameExists] 错误，返回 false`);
    return false;
  }
}
