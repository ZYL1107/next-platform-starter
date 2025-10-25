'use server';
import { getStore } from '@netlify/blobs';
import { randomUUID } from 'crypto';

// 检查是否在 Netlify 环境中
const isNetlifyEnvironment = () => {
  // 检查多个可能的 Netlify 环境变量
  return !!(
    process.env.NETLIFY ||
    process.env.CONTEXT ||
    process.env.NETLIFY_DEV ||
    process.env.DEPLOY_URL ||
    // 在生产环境中且不是本地开发
    (process.env.NODE_ENV === 'production' && typeof window === 'undefined')
  );
};

/**
 * 获取游戏的所有评论
 * @param {string} gameId - 游戏ID
 * @param {number} limit - 限制返回数量（默认50）
 * @returns {Promise<Review[]>}
 */
export async function getGameReviews(gameId, limit = 50) {
  try {
    // 本地开发环境返回空数组
    if (!isNetlifyEnvironment()) {
      console.log('[getGameReviews] 本地开发环境，返回空数组');
      return [];
    }

    const store = await getStore('game-reviews');
    const reviews = [];

    // 获取该游戏的所有评论
    const prefix = `reviews:${gameId}:`;

    for await (const { key } of store.list({ prefix })) {
      const data = await store.get(key);
      if (data) {
        reviews.push(JSON.parse(data));
      }
      if (reviews.length >= limit) break;
    }

    // 按时间倒序排序（最新的在前）
    reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return reviews;
  } catch (error) {
    console.error('Error getting game reviews:', error);
    return [];
  }
}

/**
 * 提交评论和评分
 * @param {string} gameId - 游戏ID
 * @param {string} userName - 用户昵称
 * @param {number} rating - 评分 (1-5)
 * @param {string} comment - 评论内容
 * @returns {Promise<{success: boolean, error?: string, review?: object}>}
 */
export async function submitReview(gameId, userName, rating, comment) {
  try {
    // 验证输入
    if (!gameId || !userName || !rating || !comment) {
      return { success: false, error: '请填写完整信息' };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: '评分必须在1-5之间' };
    }

    if (comment.length < 5 || comment.length > 500) {
      return { success: false, error: '评论长度必须���5-500字之间' };
    }

    // 本地开发环境返回模拟成功
    if (!isNetlifyEnvironment()) {
      console.log('[submitReview] 本地开发环境，返回模拟数据');
      return {
        success: false,
        error: '本地开发环境不支持评论功能，请部署到 Netlify 后使用'
      };
    }

    // 生成用户ID（可以用浏览器指纹或其他方式）
    const userId = randomUUID();
    const timestamp = new Date().toISOString();
    const reviewId = `${Date.now()}-${randomUUID()}`;

    const store = await getStore('game-reviews');

    // 保存评论
    const reviewData = {
      id: reviewId,
      gameId,
      userId,
      userName,
      rating,
      comment,
      timestamp,
      likes: 0
    };

    await store.set(
      `reviews:${gameId}:${reviewId}`,
      JSON.stringify(reviewData),
      { metadata: { type: 'review' } }
    );

    // 保存评分（用于计算平均分）
    const ratingData = {
      gameId,
      userId,
      rating,
      timestamp
    };

    await store.set(
      `ratings:${gameId}:${userId}`,
      JSON.stringify(ratingData),
      { metadata: { type: 'rating' } }
    );

    return { success: true, review: reviewData };
  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, error: '提交失败，请稍后重试' };
  }
}

/**
 * 获取游戏评分统计
 * @param {string} gameId - 游戏ID
 * @returns {Promise<GameStats>}
 */
export async function getGameStats(gameId) {
  try {
    // 本地开发环境返回空数据
    if (!isNetlifyEnvironment()) {
      console.log('[getGameStats] 本地开发环境，返回空数据');
      return {
        averageRating: 0,
        totalRatings: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const store = await getStore('game-reviews');
    const ratings = [];

    // 获取所有评分
    const prefix = `ratings:${gameId}:`;

    for await (const { key } of store.list({ prefix })) {
      const data = await store.get(key);
      if (data) {
        ratings.push(JSON.parse(data));
      }
    }

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    // 计算平均分
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = (sum / ratings.length).toFixed(1);

    // 计算评分分布
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    // 获取评论总数
    const reviews = await getGameReviews(gameId, 1000);

    return {
      averageRating: parseFloat(averageRating),
      totalRatings: ratings.length,
      totalReviews: reviews.length,
      ratingDistribution: distribution
    };
  } catch (error) {
    console.error('Error getting game stats:', error);
    return {
      averageRating: 0,
      totalRatings: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
}

/**
 * 检查用户是否已评分（可选功能，需要持久化userId）
 * @param {string} gameId - 游戏ID
 * @param {string} userId - 用户ID
 * @returns {Promise<boolean>}
 */
export async function hasUserRated(gameId, userId) {
  try {
    // 本地开发环境返回 false
    if (!isNetlifyEnvironment()) {
      return false;
    }

    const store = await getStore('game-reviews');
    const key = `ratings:${gameId}:${userId}`;
    const data = await store.get(key);
    return !!data;
  } catch (error) {
    console.error('Error checking user rating:', error);
    return false;
  }
}
