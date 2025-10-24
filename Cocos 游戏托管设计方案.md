# Cocos 游戏托管设计方案

## 1. 项目概述

在现有的 Next.js + Netlify 项目中集成 Cocos 游戏托管功能，允许上传多个 Cocos 导出的游戏，并提供游戏列表和游戏运行页面，支持移动端访问。

## 2. 技术架构

### 2.1 存储方案
- **静态文件存储**: 将 Cocos 游戏文件夹直接放在 `public/games/` 目录下
- **游戏元数据**: 使用 Netlify Blobs 存储游戏信息（名称、描述、封面图等）
- **优势**: 
  - 静态文件通过 Netlify CDN 分发，加载速度快
  - 无需额外的文件上传逻辑，部署时自动包含
  - 适合移动端访问

### 2.2 目录结构设计

```
项目根目录/
├── public/
│   └── games/                    # Cocos 游戏存储目录
│       ├── game-1/               # 游戏1文件夹
│       │   ├── index.html        # Cocos 导出的入口文件
│       │   ├── src/              # 游戏源码
│       │   ├── assets/           # 游戏资源
│       │   └── game.json         # 游戏元数据配置
│       ├── game-2/               # 游戏2文件夹
│       │   ├── index.html
│       │   ├── src/
│       │   ├── assets/
│       │   └── game.json
│       └── ...
├── app/
│   └── games/                    # 游戏功能路由
│       ├── page.jsx              # 游戏列表页
│       ├── [gameId]/             # 动态路由
│       │   └── page.jsx          # 游戏运行页
│       └── actions.js            # Server Actions
└── components/
    └── game-card.jsx             # 游戏卡片组件
```

## 3. 实现方案

### 3.1 游戏元数据格式 (`game.json`)

每个游戏文件夹内放置 `game.json` 配置文件：

```json
{
  "id": "game-1",
  "name": "我的第一个游戏",
  "description": "这是一个很棒的 Cocos 游戏",
  "thumbnail": "/games/game-1/thumbnail.png",
  "version": "1.0.0",
  "orientation": "landscape",
  "created": "2025-10-23"
}
```

### 3.2 游戏列表页 (`app/games/page.jsx`)

**功能**:
- 扫描 `public/games/` 目录下的所有游戏
- 读取每个游戏的 `game.json` 元数据
- 以卡片形式展示游戏列表
- 支持搜索和筛选
- 移动端响应式设计

**关键代码结构**:
```javascript
// Server Component
export default async function GamesPage() {
  const games = await listGames(); // Server Action
  
  return (
    <div className="container">
      <h1>游戏中心</h1>
      <div className="game-grid">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
```

### 3.3 游戏运行页 (`app/games/[gameId]/page.jsx`)

**功能**:
- 使用 iframe 嵌入 Cocos 游戏
- 全屏显示，适配移动端
- 提供返回按钮和游戏信息
- 支持横屏/竖屏切换提示

**关键代码结构**:
```javascript
export default async function GamePage({ params }) {
  const { gameId } = params;
  const gameInfo = await getGameInfo(gameId);
  
  return (
    <div className="game-container">
      <iframe 
        src={`/games/${gameId}/index.html`}
        className="game-iframe"
        allowFullScreen
      />
    </div>
  );
}
```

### 3.4 Server Actions (`app/games/actions.js`)

```javascript
'use server';

import fs from 'fs';
import path from 'path';

// 列出所有游戏
export async function listGames() {
  const gamesDir = path.join(process.cwd(), 'public/games');
  const folders = fs.readdirSync(gamesDir);
  
  const games = folders.map(folder => {
    const configPath = path.join(gamesDir, folder, 'game.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config;
    }
    return null;
  }).filter(Boolean);
  
  return games;
}

// 获取单个游戏信息
export async function getGameInfo(gameId) {
  const configPath = path.join(
    process.cwd(), 
    'public/games', 
    gameId, 
    'game.json'
  );
  
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  
  return null;
}
```

## 4. 样式设计

### 4.1 游戏列表样式
- 响应式网格布局（移动端1列，平板2列，桌面3-4列）
- 游戏卡片包含：缩略图、标题、描述、播放按钮
- 悬停效果和动画

### 4.2 游戏运行页样式
- 全屏 iframe，无边框
- 固定的顶部导航栏（返回按钮、游戏标题）
- 加载动画
- 横屏提示（对于横屏游戏）

```css
.game-iframe {
  width: 100vw;
  height: 100vh;
  border: none;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}
```

## 5. 移动端优化

### 5.1 响应式设计
- 使用 Tailwind CSS 的响应式类
- 触摸友好的按钮尺寸（最小 44x44px）
- 自适应字体大小

### 5.2 性能优化
- 懒加载游戏缩略图
- 游戏文件通过 Netlify CDN 分发
- 预加载关键资源

### 5.3 横屏/竖屏适配
```javascript
// 检测屏幕方向
useEffect(() => {
  const handleOrientation = () => {
    if (gameInfo.orientation === 'landscape') {
      // 提示用户旋转屏幕
    }
  };
  
  window.addEventListener('orientationchange', handleOrientation);
  return () => window.removeEventListener('orientationchange', handleOrientation);
}, []);
```

## 6. 部署流程

### 6.1 开发阶段
1. 在 `public/games/` 下创建游戏文件夹
2. 将 Cocos 导出的文件复制到对应文件夹
3. 创建 `game.json` 配置文件
4. 本地测试：`npm run dev`

### 6.2 生产部署
1. 提交代码到 Git 仓库
2. Netlify 自动构建和部署
3. 游戏文件自动包含在部署包中
4. 通过 CDN 访问游戏

### 6.3 添加新游戏步骤
```bash
# 1. 创建游戏文件夹
mkdir public/games/my-new-game

# 2. 复制 Cocos 导出的文件
cp -r /path/to/cocos/build/web-mobile/* public/games/my-new-game/

# 3. 创建配置文件
cat > public/games/my-new-game/game.json << EOF
{
  "id": "my-new-game",
  "name": "我的新游戏",
  "description": "游戏描述",
  "thumbnail": "/games/my-new-game/thumbnail.png",
  "version": "1.0.0",
  "orientation": "portrait",
  "created": "$(date +%Y-%m-%d)"
}
EOF

# 4. 提交并部署
git add public/games/my-new-game
git commit -m "Add new game: my-new-game"
git push
```

## 7. 安全考虑

### 7.1 文件访问控制
- 游戏文件为静态资源，公开访问
- 不需要额外的权限控制
- 通过 Netlify 的 CDN 安全分发

### 7.2 内容安全策略 (CSP)
在 `next.config.js` 中配置：
```javascript
async headers() {
  return [
    {
      source: '/games/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "frame-ancestors 'self'"
        }
      ]
    }
  ];
}
```

## 8. 扩展功能（可选）

### 8.1 游戏统计
- 使用 Netlify Blobs 记录游戏访问次数
- 显示热门游戏排行

### 8.2 用户评分
- 允许用户对游戏评分和评论
- 数据存储在 Netlify Blobs

### 8.3 分类和标签
- 为游戏添加分类（动作、益智、休闲等）
- 支持按分类筛选

### 8.4 社交分享
- 添加分享按钮（微信、QQ、微博等）
- 生成游戏分享卡片

## 9. 测试计划

### 9.1 功能测试
- [ ] 游戏列表正确显示
- [ ] 游戏可以正常加载和运行
- [ ] 移动端访问正常
- [ ] 横屏/竖屏切换正常

### 9.2 性能测试
- [ ] 首屏加载时间 < 3s
- [ ] 游戏加载时间 < 5s
- [ ] CDN 缓存生效

### 9.3 兼容性测试
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] 微信内置浏览器
- [ ] 桌面浏览器

## 10. 文档和维护

### 10.1 开发文档
- API 文档
- 组件使用说明
- 部署流程文档

### 10.2 用户文档
- 游戏上传指南
- 配置文件说明
- 常见问题解答

## 11. 总结

这个方案的核心优势：
- ✅ **简单**: 直接放文件到 `public/games/`，无需复杂上传
- ✅ **快速**: CDN 分发，加载速度快
- ✅ **稳定**: 静态文件，不依赖数据库
- ✅ **易维护**: 文件结构清晰，易于管理
- ✅ **移动友好**: 响应式设计，适配各种设备
- ✅ **扩展性强**: 可轻松添加新功能

下一步行动：
1. 创建 `public/games/` 目录
2. 实现游戏列表页和运行页
3. 添加第一个测试游戏
4. 测试移动端访问
5. 部署到 Netlify