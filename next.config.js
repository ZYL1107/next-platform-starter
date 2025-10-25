/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // 禁用尾部斜杠自动添加
    trailingSlash: false,
    // 优化图片处理
    images: {
        unoptimized: true
    }
};

module.exports = nextConfig;
