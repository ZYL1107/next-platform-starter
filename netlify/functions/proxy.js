// 配置允许的请求头和 CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length',
};

async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders
    };
  }

  try {
    const path = event.path;
    const prefix = '/.netlify/functions/proxy/';
    
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

    if (!path.startsWith(prefix)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: 'Invalid proxy path'
      };
    }

    const targetPath = path.slice(prefix.length);
    if (!targetPath) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: 'No target URL provided'
      };
    }

    const targetUrl = `https://${targetPath}`;
    
    // 优化的请求头处理
    const headers = new Headers();
    for (const [key, value] of Object.entries(event.headers)) {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'accept-encoding') {
        headers.set(key, value);
      }
    }

    // 优化的请求体处理
    let body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: headers,
      body: body,
      redirect: 'follow',
    });

    // 检查是否是流式响应
    const contentType = response.headers.get('content-type') || '';
    const isStreamResponse = contentType.includes('stream');

    if (isStreamResponse) {
      // 对于流式响应，直接返回响应体
      return {
        statusCode: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          ...corsHeaders
        },
        body: response.body,
      };
    }

    // 对于非流式响应，使用更高效的处理方式
    const responseBody = await response.text();
    return {
      statusCode: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        ...corsHeaders
      },
      body: responseBody,
    };

  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: error.message
    };
  }
}

exports.handler = handler;
