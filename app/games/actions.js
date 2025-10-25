'use server';

import fs from 'fs';
import path from 'path';

/**
 * 查找游戏文件夹（大小写不敏感）
 * @param {string} gameId - 游戏ID
 * @returns {string|null} - 实际的文件夹名称，如果找不到返回null
 */
function findGameFolder(gameId) {
  const gamesDir = path.join(process.cwd(), 'public/games');

  if (!fs.existsSync(gamesDir)) {
    return null;
  }

  const decodedGameId = decodeURIComponent(gameId);
  const folders = fs.readdirSync(gamesDir);

  // 先尝试精确匹配
  if (folders.includes(decodedGameId)) {
    return decodedGameId;
  }

  // 再尝试大小写不敏感匹配
  const lowerGameId = decodedGameId.toLowerCase();
  const matchedFolder = folders.find(folder => folder.toLowerCase() === lowerGameId);

  return matchedFolder || null;
}

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
    const actualFolder = findGameFolder(gameId);

    if (!actualFolder) {
      console.log(`[getGameInfo] 未找到游戏文件夹，gameId: ${gameId}`);
      return null;
    }

    console.log(`[getGameInfo] 尝试获取游戏信息，gameId: ${gameId}, 实际文件夹: ${actualFolder}`);

    const configPath = path.join(
      process.cwd(),
      'public/games',
      actualFolder,
      'game.json'
    );

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log(`[getGameInfo] 找到游戏信息，返回: ${JSON.stringify(config)}`);
      return config;
    }

    return null;
  } catch (error) {
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
    const actualFolder = findGameFolder(gameId);

    if (!actualFolder) {
      console.log(`[gameExists] 未找到游戏文件夹，gameId: ${gameId}`);
      return false;
    }

    console.log(`[gameExists] 检查游戏是否存在，gameId: ${gameId}, 实际文件夹: ${actualFolder}`);

    const gamePath = path.join(process.cwd(), 'public/games', actualFolder, 'index.html');
    const exists = fs.existsSync(gamePath);
    console.log(`[gameExists] 检查路径: ${gamePath}, 结果: ${exists}`);
    return exists;
  } catch (error) {
    console.error(`Error checking game existence for ${gameId}:`, error);
    console.log(`[gameExists] 错误，返回 false`);
    return false;
  }
}
