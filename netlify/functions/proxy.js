// 配置允许的请求头和 CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    try {
      // 获取请求URL的路径部分
      const url = new URL(request.url);
      const pathname = url.pathname;

      // 处理根路径请求
      if (pathname === '/' || pathname === '/index.html') {
        return new Response('Proxy is running!', {
          headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders
          }
        });
      }

      // 构建目标URL（移除开头的斜杠）
      const targetUrl = `https://${pathname.slice(1)}`;
      
      // 创建新的请求头
      const headers = new Headers(request.headers);
      headers.delete('host'); // 删除原始 host 头

      // 转发请求到目标服务器
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'follow',
      });

      // 创建新的响应头
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      // 返回响应
      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
      });

    } catch (error) {
      console.error('Proxy error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
