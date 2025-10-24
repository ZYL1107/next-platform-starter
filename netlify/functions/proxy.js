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

   // 创建新的Headers对象
const headers = new Headers();
    
// 复制原始请求的headers
Object.entries(event.headers).forEach(([key, value]) => {
  if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'accept-encoding') {
    headers.set(key, value);
  }
});


    // 准备请求配置
    const fetchOptions = {
      method: event.httpMethod,
      headers: headers,
      redirect: 'follow',
    };

    // 只有在有请求体的情况下才添加body
    if (event.body) {
      // 如果是Base64编码的请求体，需要解码
      if (event.isBase64Encoded) {
        fetchOptions.body = Buffer.from(event.body, 'base64');
      } else {
        // 对于JSON请求，保持原样
        fetchOptions.body = event.body;
      }
    }

    // 发送请求
    const response = await fetch(targetUrl, fetchOptions);

    // 获取响应头
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // 处理响应体
    let responseBody;
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // 对于JSON响应，直接获取文本
      responseBody = await response.text();
    } else if (contentType.includes('text/')) {
      // 对于文本响应，直接获取文本
      responseBody = await response.text();
    } else {
      // 对于二进制数据，转换为Base64
      const buffer = await response.arrayBuffer();
      responseBody = Buffer.from(buffer).toString('base64');
    }

    // 返回响应
    return {
      statusCode: response.status,
      headers: {
        ...responseHeaders,
        ...corsHeaders
      },
      body: responseBody,
      isBase64Encoded: !contentType.includes('application/json') && !contentType.includes('text/')
    };

  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      })
    };
  }
}

exports.handler = handler;



