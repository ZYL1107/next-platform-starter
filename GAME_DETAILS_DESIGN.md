# 游戏详情页设计方案

## 1. 需求分析

### 1.1 功能需求
- **游戏详情展示**：显示游戏名称、简介、缩略图等基本信息
- **评分系统**：1-5星评分，用户可点击星星进行打分
- **评论系统**：用户可以发表评论，评论需要动态轮播展示
- **数据持久化**：评分和评论数据需要永久存储

### 1.2 用户流程
1. 用户从游戏列表页点击游戏卡片
2. 进入游戏详情页，查看游戏信息、评分、评论
3. 用户可以给游戏打分（点击星星）
4. 用户可以填写评论并提交
5. 评论以轮播形式动态展示
6. 点击"开始游戏"按钮进入游戏播放界面

---

## 2. 技术方案可行性分析

### 2.1 方案一：Netlify Blobs（推荐）✅

#### 优点
- **已集成**：项目已安装 `@netlify/blobs@8.1.0` 依赖
- **高性能**：边缘存储，读写速度快
- **强一致性**：支持 `consistency: 'strong'` 模式，确保数据一致性
- **无限容量**：理论上支持无限数据存储
- **免费额度**：Netlify 免费计划包含大量 Blobs 存储和读写操作
- **简单易用**：API 简洁，支持 key-value 存储和前缀查询

#### 缺点
- **依赖 Netlify**：不能轻易迁移到其他平台
- **查询能力有限**：不支持复杂查询（如按时间排序、分页等），需要在应用层实现

#### 数据结构设计
```javascript
// 评论数据格式
Key: `reviews:${gameId}:${timestamp}-${randomId}`
Value: {
  gameId: "Bunny Leap",
  userId: "anonymous-xxx",  // 匿名用户ID（可用浏览器指纹或UUID）
  userName: "玩家昵称",
  rating: 5,
  comment: "这个游戏太好玩了！",
  timestamp: "2025-10-25T10:30:00.000Z"
}

// 评分数据格式
Key: `ratings:${gameId}:${userId}`
Value: {
  gameId: "Bunny Leap",
  userId: "anonymous-xxx",
  rating: 5,
  timestamp: "2025-10-25T10:30:00.000Z"
}
```

#### 预估成本
- **免费额度**：每月 10GB 存储 + 1000万次读取 + 100万次写入
- **单条评论大小**：约 200 字节（假设评论 100 字以内）
- **存储容量估算**：10000 条评论 ≈ 2MB（远低于免费额度）
- **读写估算**：
  - 每次页面加载读取约 50 条评论 = 50 次读取
  - 每月 10000 次访问 = 50万次读取（在免费额度内）

#### 推荐原因
✅ **零额外成本** - 项目已有依赖，无需额外配置
✅ **开发效率高** - 简单的 Server Actions 即可实现
✅ **性能优秀** - 边缘存储，全球访问速度快
✅ **适合中小规模** - 游戏平台初期完全够用

---

### 2.2 方案二：Netlify Functions + JSON 文件存储 ⚠️

#### 实现方式
- 在 `netlify/functions/` 创建 API 函数
- 数据以 JSON 文件形式存储在文件系统（如 `data/reviews.json`）
- 通过 Netlify Functions 读写文件

#### 优点
- **简单直观**：JSON 文件易于理解和调试
- **平台无关**：理论上可以迁移到任何 Node.js 环境
- **易于备份**：可以直接提交到 Git 仓库

#### 缺点
- **并发问题**：❌ 多用户同时写入会导致数据竞争和丢失
- **性能瓶颈**：❌ 每次读写都需要加载整个 JSON 文件
- **存储限制**：❌ Netlify Functions 的文件系统是只读的（只能写入 /tmp 临时目录）
- **数据丢失风险**：❌ /tmp 目录在函数冷启动后会被清空
- **扩展性差**：❌ 数据量增大后性能急剧下降

#### 结论
⚠️ **不推荐** - Netlify Functions 的文件系统是只读的，无法持久化 JSON 文件。即使使用 `/tmp` 目录，数据也会在函数冷启动后丢失。

---

### 2.3 方案三：Netlify Functions + 外部数据库（备选）

#### 适用场景
- 需要复杂查询（如分页、排序、搜索）
- 需要跨平台数据共享
- 数据量超过 Netlify Blobs 免费额度

#### 可选数据库
- **Firebase Firestore**：免费额度充足，实时同步
- **MongoDB Atlas**：免费 512MB 存储
- **Supabase**：开源 PostgreSQL，免费 500MB

#### 缺点
- 需要额外注册和配置第三方服务
- 增加项目复杂度
- 可能产生额外成本

---

## 3. 最终推荐方案：Netlify Blobs

**选择 Netlify Blobs 的理由：**
1. ✅ 项目已有依赖，零配置成本
2. ✅ 性能优秀，支持高并发
3. ✅ 免费额度充足，适合中小型游戏平台
4. ✅ API 简单，开发效率高
5. ✅ 边缘存储，全球访问速度快

**适用范围：**
- 评论数量 < 100万条
- 单游戏评论 < 1万条
- 月活跃用户 < 10万

如果未来数据量增长，可以考虑迁移到方案三（外部数据库）。

---

## 4. 详细设计方案

### 4.1 目录结构

```
app/games/[gameId]/
├── page.jsx                    # Server Component - 游戏详情页主页面
├── game-player.jsx             # Client Component - 游戏播放器（已存在）
├── components/
│   ├── game-info-card.jsx      # Client Component - 游戏信息卡片
│   ├── rating-section.jsx      # Client Component - 评分区域
│   ├── review-section.jsx      # Client Component - 评论区域
│   ├── review-carousel.jsx     # Client Component - 评论轮播组件
│   └── review-form.jsx         # Client Component - 评论表单
└── actions.js                  # Server Actions - 评分/评论数据处理
```

### 4.2 数据库设计（Netlify Blobs）

#### Store 名称
- `game-reviews` - 存储所有游戏的评论和评分数据

#### Key 命名规范
```
reviews:{gameId}:{timestamp}-{randomId}    # 评论数据
ratings:{gameId}:{userId}                  # 评分数据（每个用户只能评一次分）
```

#### 数据模型

```typescript
// 评论数据
interface Review {
  id: string;                    // 评论唯一ID
  gameId: string;                // 游戏ID（如 "Bunny Leap"）
  userId: string;                // 用户ID（匿名用户使用UUID）
  userName: string;              // 用户昵称
  rating: number;                // 评分 (1-5)
  comment: string;               // 评论内容
  timestamp: string;             // ISO 格式时间戳
  likes?: number;                // 点赞数（可选，未来扩展）
}

// 评分数据
interface Rating {
  gameId: string;                // 游戏ID
  userId: string;                // 用户ID
  rating: number;                // 评分 (1-5)
  timestamp: string;             // ISO 格式时间戳
}

// 聚合统计（在 Server Action 中计算）
interface GameStats {
  averageRating: number;         // 平均评分
  totalRatings: number;          // 评分总数
  totalReviews: number;          // 评论总数
  ratingDistribution: {          // 评分分布
    5: number,
    4: number,
    3: number,
    2: number,
    1: number
  }
}
```

### 4.3 Server Actions 实现

创建 `app/games/[gameId]/actions.js`：

```javascript
'use server';
import { getStore } from '@netlify/blobs';
import { randomUUID } from 'crypto';

/**
 * 获取游戏的所有评论
 * @param {string} gameId - 游戏ID
 * @param {number} limit - 限制返回数量（默认50）
 * @returns {Promise<Review[]>}
 */
export async function getGameReviews(gameId, limit = 50) {
  try {
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
 * @returns {Promise<{success: boolean, error?: string}>}
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
      return { success: false, error: '评论长度必须在5-500字之间' };
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

    return { success: true };
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
    const store = await getStore('game-reviews');
    const key = `ratings:${gameId}:${userId}`;
    const data = await store.get(key);
    return !!data;
  } catch (error) {
    console.error('Error checking user rating:', error);
    return false;
  }
}
```

### 4.4 UI 组件设计

#### 4.4.1 游戏详情页主页面 (`page.jsx`)

```jsx
import { notFound } from 'next/navigation';
import { gameExists, getGameInfo } from '../actions';
import { getGameStats, getGameReviews } from './actions';
import GameInfoCard from './components/game-info-card';
import RatingSection from './components/rating-section';
import ReviewSection from './components/review-section';
import Link from 'next/link';

export default async function GameDetailPage({ params }) {
  const { gameId } = params;

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
        ← 返回游戏列表
      </Link>

      {/* 游戏信息卡片 */}
      <GameInfoCard gameInfo={gameInfo} stats={stats} />

      {/* 评分区域 */}
      <RatingSection gameId={gameId} stats={stats} />

      {/* 评论区域 */}
      <ReviewSection gameId={gameId} reviews={reviews} />

      {/* 开始游戏按钮 */}
      <div className="text-center mt-8">
        <Link
          href={`/games/${gameId}/play`}
          className="btn btn-primary btn-lg"
        >
          🎮 开始游戏
        </Link>
      </div>
    </div>
  );
}
```

#### 4.4.2 游戏信息卡片 (`components/game-info-card.jsx`)

```jsx
'use client';
import Image from 'next/image';

export default function GameInfoCard({ gameInfo, stats }) {
  return (
    <div className="card bg-base-100 shadow-xl mb-8">
      <div className="card-body lg:flex-row gap-6">
        {/* 游戏缩略图 */}
        <div className="flex-shrink-0">
          <Image
            src={gameInfo.thumbnail || '/placeholder-game.png'}
            alt={gameInfo.name}
            width={300}
            height={300}
            className="rounded-lg object-cover"
          />
        </div>

        {/* 游戏信息 */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{gameInfo.name}</h1>

          {/* 评分显示 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`text-2xl ${
                    star <= Math.round(stats.averageRating)
                      ? 'text-warning'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xl font-semibold">{stats.averageRating}</span>
            <span className="text-sm opacity-60">
              ({stats.totalRatings} 个评分)
            </span>
          </div>

          {/* 游戏描述 */}
          <p className="text-lg opacity-80 mb-4">
            {gameInfo.description || '暂无描述'}
          </p>

          {/* 游戏信息标签 */}
          <div className="flex flex-wrap gap-2">
            <div className="badge badge-outline">
              版本 {gameInfo.version || '1.0.0'}
            </div>
            <div className="badge badge-outline">
              {gameInfo.orientation === 'landscape' ? '横屏' : '竖屏'}
            </div>
            <div className="badge badge-outline">
              {stats.totalReviews} 条评论
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 4.4.3 评分区域 (`components/rating-section.jsx`)

```jsx
'use client';
import { useState } from 'react';

export default function RatingSection({ gameId, stats }) {
  return (
    <div className="card bg-base-100 shadow-lg mb-8">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">评分分布</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：平均分显示 */}
          <div className="flex flex-col items-center justify-center p-6 bg-base-200 rounded-lg">
            <div className="text-6xl font-bold text-primary mb-2">
              {stats.averageRating}
            </div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`text-3xl ${
                    star <= Math.round(stats.averageRating)
                      ? 'text-warning'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm opacity-60">
              基于 {stats.totalRatings} 个评分
            </p>
          </div>

          {/* 右侧：评分分布条形图 */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.totalRatings > 0
                ? (count / stats.totalRatings) * 100
                : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-12 text-right">{rating}星</span>
                  <div className="flex-1 h-6 bg-base-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm opacity-60">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 4.4.4 评论区域 (`components/review-section.jsx`)

```jsx
'use client';
import { useState } from 'react';
import ReviewCarousel from './review-carousel';
import ReviewForm from './review-form';

export default function ReviewSection({ gameId, reviews: initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);

  const handleReviewSubmitted = (newReview) => {
    setReviews([newReview, ...reviews]);
    setShowForm(false);
  };

  return (
    <div className="card bg-base-100 shadow-lg mb-8">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-2xl">玩家评论</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? '取消' : '写评论'}
          </button>
        </div>

        {/* 评论表单 */}
        {showForm && (
          <ReviewForm
            gameId={gameId}
            onSubmitted={handleReviewSubmitted}
          />
        )}

        {/* 评论轮播 */}
        {reviews.length > 0 ? (
          <ReviewCarousel reviews={reviews} />
        ) : (
          <div className="text-center py-12 opacity-60">
            <p>暂无评论，快来成为第一个评论的玩家吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 4.4.5 评论轮播组件 (`components/review-carousel.jsx`)

```jsx
'use client';
import { useState, useEffect } from 'react';

export default function ReviewCarousel({ reviews }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, 5000); // 每5秒切换

    return () => clearInterval(timer);
  }, [isAutoPlaying, reviews.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev =>
      prev === 0 ? reviews.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % reviews.length);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (reviews.length === 0) return null;

  const currentReview = reviews[currentIndex];

  return (
    <div className="relative">
      {/* 评论卡片 */}
      <div className="bg-base-200 rounded-lg p-6 min-h-[200px]">
        {/* 评分显示 */}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`text-xl ${
                star <= currentReview.rating
                  ? 'text-warning'
                  : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* 评论内容 */}
        <p className="text-lg mb-4 leading-relaxed">
          "{currentReview.comment}"
        </p>

        {/* 用户信息和时间 */}
        <div className="flex justify-between items-center text-sm opacity-60">
          <span className="font-semibold">{currentReview.userName}</span>
          <span>
            {new Date(currentReview.timestamp).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>

      {/* 导航按钮 */}
      {reviews.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2"
          >
            ❮
          </button>
          <button
            onClick={goToNext}
            className="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2"
          >
            ❯
          </button>
        </>
      )}

      {/* 指示器 */}
      {reviews.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-base-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* 自动播放指示 */}
      {reviews.length > 1 && (
        <div className="text-center mt-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="btn btn-ghost btn-xs"
          >
            {isAutoPlaying ? '⏸ 暂停自动播放' : '▶ 继续自动播放'}
          </button>
        </div>
      )}
    </div>
  );
}
```

#### 4.4.6 评论表单 (`components/review-form.jsx`)

```jsx
'use client';
import { useState } from 'react';
import { submitReview } from '../actions';

export default function ReviewForm({ gameId, onSubmitted }) {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 验证
    if (!userName.trim()) {
      setError('请输入昵称');
      return;
    }

    if (rating === 0) {
      setError('请选择评分');
      return;
    }

    if (comment.length < 5) {
      setError('评论至少需要5个字');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReview(gameId, userName, rating, comment);

      if (result.success) {
        // 清空表单
        setUserName('');
        setRating(0);
        setComment('');

        // 通知父组件
        onSubmitted({
          id: Date.now().toString(),
          gameId,
          userName,
          rating,
          comment,
          timestamp: new Date().toISOString()
        });
      } else {
        setError(result.error || '提交失败');
      }
    } catch (err) {
      setError('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-base-200 rounded-lg p-6 mb-6">
      <h3 className="font-bold text-lg mb-4">发表评论</h3>

      {/* 昵称输入 */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">昵称</span>
        </label>
        <input
          type="text"
          placeholder="请输入你的昵称"
          className="input input-bordered"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          maxLength={20}
          disabled={isSubmitting}
        />
      </div>

      {/* 评分选择 */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">评分</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-4xl transition-transform hover:scale-110"
              disabled={isSubmitting}
            >
              <span
                className={
                  star <= (hoveredRating || rating)
                    ? 'text-warning'
                    : 'text-gray-300'
                }
              >
                ★
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 flex items-center text-sm opacity-60">
              {rating === 5 && '非常棒！'}
              {rating === 4 && '很好'}
              {rating === 3 && '还不错'}
              {rating === 2 && '一般'}
              {rating === 1 && '不太好'}
            </span>
          )}
        </div>
      </div>

      {/* 评论输入 */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">评论内容</span>
          <span className="label-text-alt">{comment.length}/500</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="分享你的游戏体验..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          disabled={isSubmitting}
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* 提交按钮 */}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner"></span>
            提交中...
          </>
        ) : (
          '提交评论'
        )}
      </button>
    </form>
  );
}
```

### 4.5 路由调整

需要调整路由结构，将游戏播放器移到单独的路由：

```
app/games/[gameId]/
├── page.jsx              # 游戏详情页（新）
├── play/
│   └── page.jsx          # 游戏播放页（移动原 page.jsx 内容）
├── components/           # 详情页组件
└── actions.js            # Server Actions
```

**迁移步骤：**
1. 创建 `app/games/[gameId]/play/page.jsx`
2. 将现有 `app/games/[gameId]/page.jsx` 的游戏播放器代码移到 `play/page.jsx`
3. 更新 `app/games/[gameId]/page.jsx` 为详情页
4. 更新游戏列表页的链接从 `/games/[gameId]` 到 `/games/[gameId]`（详情页）

---

## 5. 实施步骤

### 阶段 1：准备工作（10分钟）
1. ✅ 创建新的目录结构
2. ✅ 调整路由（将播放器移到 `/play` 子路由）

### 阶段 2：后端开发（30分钟）
1. ✅ 创建 `app/games/[gameId]/actions.js`
2. ✅ 实现 Server Actions：
   - `getGameReviews()`
   - `submitReview()`
   - `getGameStats()`

### 阶段 3：前端组件开发（60分钟）
1. ✅ 创建 `game-info-card.jsx`
2. ✅ 创建 `rating-section.jsx`
3. ✅ 创建 `review-section.jsx`
4. ✅ 创建 `review-carousel.jsx`
5. ✅ 创建 `review-form.jsx`
6. ✅ 创建详情页 `page.jsx`

### 阶段 4：样式调整（20分钟）
1. ✅ 调整 Tailwind 样式
2. ✅ 测试响应式布局（手机、平板、桌面）

### 阶段 5：测试与优化（30分钟）
1. ✅ 测试评分提交
2. ✅ 测试评论提交
3. ✅ 测试轮播功能
4. ✅ 测试错误处理
5. ✅ 性能优化（加载速度、动画流畅度）

**预计总耗时：2.5 小时**

---

## 6. 未来扩展方向

### 6.1 用户系统
- 集成真实用户认证（Netlify Identity）
- 防止重复评分
- 用户评论历史

### 6.2 社交功能
- 评论点赞功能
- 评论回复功能
- 评论举报功能

### 6.3 数据分析
- 游戏热度排行榜
- 玩家活跃度统计
- 评分趋势图表

### 6.4 性能优化
- 评论分页加载
- 虚拟滚动（处理大量评论）
- 缓存策略（减少 Blobs 读取次数）

### 6.5 管理功能
- 管理员审核评论
- 删除不当评论
- 游戏数据导出

---

## 7. 风险与挑战

### 7.1 数据一致性
**问题：** 多用户同时评分可能导致统计不准确
**解决方案：**
- 使用 Netlify Blobs 的强一致性模式
- 评分和评论使用不同的 key 前缀
- 定期重新计算统计数据

### 7.2 垃圾评论
**问题：** 恶意用户可能发布垃圾评论
**解决方案：**
- 限制评论长度（5-500字）
- 添加简单的验证码（未来扩展）
- 管理员审核功能（未来扩展）

### 7.3 性能问题
**问题：** 大量评论可能导致加载缓慢
**解决方案：**
- 初次加载限制20条评论
- 实现"加载更多"分页功能
- 使用客户端缓存

### 7.4 匿名用户识别
**问题：** 无法准确识别匿名用户
**解决方案：**
- 使用浏览器 localStorage 存储用户ID
- 使用浏览器指纹技术（fingerprint.js）
- 提示用户注册以解锁更多功能

---

## 8. 总结

**推荐方案：Netlify Blobs + Server Actions**

**优势：**
- ✅ 零配置成本（项目已有依赖）
- ✅ 开发周期短（约2.5小时）
- ✅ 免费额度充足
- ✅ 性能优秀
- ✅ 易于维护

**适用场景：**
- 中小型游戏平台（月活跃用户 < 10万）
- 评论数�� < 100万条
- 预算有限的初创项目

**下一步行动：**
1. 确认设计方案
2. 按照实施步骤开始开发
3. 测试和部署

---

## 附录

### A. Netlify Blobs API 参考

```javascript
import { getStore } from '@netlify/blobs';

// 获取 store
const store = await getStore('store-name');

// 写入数据
await store.set('key', 'value', {
  metadata: { type: 'review' }
});

// 读取数据
const data = await store.get('key');

// 列出数据
for await (const { key } of store.list({ prefix: 'reviews:' })) {
  console.log(key);
}

// 删除数据
await store.delete('key');
```

### B. DaisyUI 组件参考

- **Card**: `card`, `card-body`, `card-title`
- **Button**: `btn`, `btn-primary`, `btn-ghost`, `btn-circle`
- **Input**: `input`, `input-bordered`
- **Textarea**: `textarea`, `textarea-bordered`
- **Alert**: `alert`, `alert-error`
- **Badge**: `badge`, `badge-outline`
- **Loading**: `loading`, `loading-spinner`

### C. 相关文档链接

- [Netlify Blobs 官方文档](https://docs.netlify.com/blobs/overview/)
- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [DaisyUI 组件库](https://daisyui.com/components/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
