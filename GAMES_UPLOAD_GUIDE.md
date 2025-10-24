# Cocos 游戏上传指南

本指南将帮助您将 Cocos 游戏添加到这个网站上。

## 快速开始

### 1. 导出 Cocos 游戏

在 Cocos Creator 中：
1. 打开您的游戏项目
2. 菜单：`项目` -> `构建发布`
3. 选择平台：`Web Mobile` 或 `Web Desktop`
4. 点击 `构建`，然后点击 `运行`
5. 构建完成后，在项目目录找到 `build/web-mobile/` 或 `build/web-desktop/` 文件夹

### 2. 复制游戏文件

将导出的所有文件复制到本项目的 `public/games/` 目录下：

```bash
# 创建游戏文件夹（使用英文名称作为游戏ID）
mkdir public/games/my-awesome-game

# 复制 Cocos 导出的所有文件
cp -r /path/to/cocos/build/web-mobile/* public/games/my-awesome-game/
```

### 3. 创建游戏配置文件

在游戏文件夹内创建 `game.json` 配置文件：

```json
{
  "id": "my-awesome-game",
  "name": "我的超棒游戏",
  "description": "这是一个非常有趣的游戏，快来试试吧！",
  "thumbnail": "/games/my-awesome-game/thumbnail.png",
  "version": "1.0.0",
  "orientation": "portrait",
  "created": "2025-10-23"
}
```

### 4. 添加缩略图（可选）

为了更好的展示效果，建议添加游戏缩略图：
- 在游戏文件夹中放置一张图片，命名为 `thumbnail.png`
- 推荐尺寸：16:9 比例，例如 1280x720 或 640x360
- 支持格式：PNG, JPG, WEBP

## 配置文件详解

### game.json 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 游戏唯一标识符，必须与文件夹名称相同，只能使用英文、数字、连字符 |
| `name` | string | ✅ | 游戏显示名称，可以使用中文 |
| `description` | string | ❌ | 游戏描述，会显示在游戏卡片上 |
| `thumbnail` | string | ❌ | 缩略图路径，相对于网站根目录 |
| `version` | string | ❌ | 游戏版本号 |
| `orientation` | string | ❌ | 屏幕方向，`portrait`（竖屏）或 `landscape`（横屏），默认 `portrait` |
| `created` | string | ❌ | 创建日期，格式：YYYY-MM-DD |

### orientation 说明

- **portrait**（竖屏）：适合手机竖屏玩的游戏
- **landscape**（横屏）：适合手机横屏玩的游戏，系统会提示用户旋转屏幕

## 目录结构示例

```
public/games/
├── my-awesome-game/          # 游戏1
│   ├── index.html            # Cocos 导出的入口文件
│   ├── src/                  # 游戏源码
│   ├── assets/               # 游戏资源
│   ├── thumbnail.png         # 缩略图
│   └── game.json             # 游戏配置
│
├── another-cool-game/        # 游戏2
│   ├── index.html
│   ├── src/
│   ├── assets/
│   ├── thumbnail.png
│   └── game.json
│
└── example-game/             # 示例游戏
    └── game.json
```

## 部署

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问游戏中心页面
# http://localhost:3000/games
```

### 生产部署

1. 提交代码到 Git 仓库：
```bash
git add public/games/my-awesome-game
git commit -m "Add new game: my-awesome-game"
git push
```

2. Netlify 会自动检测到更新并重新部署
3. 部署完成后，访问您的网站即可看到新游戏

## 常见问题

### Q: 游戏无法加载？
A: 检查以下几点：
- 确保 `index.html` 文件存在
- 确保所有 Cocos 导出的文件都已复制
- 检查浏览器控制台是否有错误信息

### Q: 缩略图不显示？
A: 检查：
- 图片路径是否正确（必须以 `/games/` 开头）
- 图片文件是否存在
- 图片格式是否支持

### Q: 游戏在手机上无法操作？
A: 确保：
- Cocos 导出时选择了 Web Mobile 平台
- 游戏本身支持触摸操作
- 检查游戏的分辨率适配设置

### Q: 如何更新游戏？
A:
1. 替换 `public/games/游戏ID/` 下的文件
2. 更新 `game.json` 中的 `version` 字段
3. 提交并推送代码

### Q: 如何删除游戏？
A:
1. 删除 `public/games/游戏ID/` 整个文件夹
2. 提交并推送代码

## 最佳实践

1. **文件大小优化**
   - 压缩图片和音频资源
   - 使用 Cocos 的资源压缩功能
   - 建议单个游戏大小不超过 50MB

2. **命名规范**
   - 游戏 ID 使用小写字母和连字符，如：`my-game`、`puzzle-game-2024`
   - 避免使用空格和特殊字符

3. **缩略图设计**
   - 使用清晰、吸引人的游戏截图
   - 避免文字过多
   - 保持图片清晰度

4. **游戏描述**
   - 简洁明了，1-2句话说明游戏特色
   - 避免过长的描述

5. **测试**
   - 在本地测试游戏是否正常运行
   - 在不同设备和浏览器上测试
   - 测试横屏/竖屏切换

## 技术支持

如果遇到问题，可以：
1. 查看浏览器控制台的错误信息
2. 检查 Netlify 的部署日志
3. 参考 Cocos Creator 官方文档

## 进阶功能

### 自定义样式
可以在游戏的 `index.html` 中添加自定义 CSS 来调整游戏容器的样式。

### 添加游戏统计
未来可以集成 Netlify Blobs 来记录游戏的访问次数和用户评分。

### 社交分享
可以添加分享按钮，让玩家分享游戏到社交平台。

---

祝您的游戏开发顺利！ 🎮
