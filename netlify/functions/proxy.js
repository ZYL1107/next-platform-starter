// 配置允许的请求头和 CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length',
};

// 主要处理函数
async function handler(event, context) {
  // 处理 CORS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders
    };
  }

  try {
    // 获取路径部分
    const path = event.path;
    const prefix = '/.netlify/functions/proxy/';
    
    // 如果是根路径请求
    if (!path || path === prefix || path === prefix.slice(0, -1)) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain',
          ...corsHeaders
        },
        body: 'Proxy is running!'
      };
    }

    // 确保路径以正确的前缀开始
    if (!path.startsWith(prefix)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: 'Invalid proxy path'
      };
    }

    // 提取目标URL
    const targetPath = path.slice(prefix.length);
    if (!targetPath) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: 'No target URL provided'
      };
    }

    const targetUrl = `https://${targetPath}`;

    // 创建新的请求头
    const headers = new Headers(event.headers);
    headers.delete('host');
    headers.delete('accept-encoding');

    // 处理请求体，特别是对于multipart/form-data
    let body = event.body;
    const contentType = event.headers['content-type'] || '';

    // 如果是 Base64 编码的请求体，需要解码
    if (event.isBase64Encoded) {
      body = Buffer.from(event.body, 'base64');
    }

    // 转发请求到目标服务器
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: headers,
      body: body,
      redirect: 'follow',
    });

    // 获取响应体
    let responseBody;
    const responseContentType = response.headers.get('content-type') || '';

    // 如果响应是 JSON，使用 text() 方法
    if (responseContentType.includes('application/json')) {
      responseBody = await response.text();
    } else {
      // 对于二进制数据，使用 arrayBuffer() 并转换为 Base64
      const buffer = await response.arrayBuffer();
      responseBody = Buffer.from(buffer).toString('base64');
    }

    // 返回响应
    return {
      statusCode: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        ...corsHeaders
      },
      body: responseBody,
      isBase64Encoded: !responseContentType.includes('application/json')
    };

  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: 'Internal Server Error: ' + error.message
    };
  }
}

exports.handler = handler;
