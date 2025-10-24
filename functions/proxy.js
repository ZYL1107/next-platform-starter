// netlify/functions/proxy.js
const fetch = require('node-fetch')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Time-Zone',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

exports.handler = async function(event, context) {
  // 处理 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  try {
    // 获取目标URL
    const path = event.path.replace('/.netlify/functions/proxy/', '')
    const targetUrl = `https://${path}`
    
    // 获取查询参数
    const queryString = event.queryStringParameters 
      ? '?' + Object.entries(event.queryStringParameters)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : ''

    // 转发请求
    const response = await fetch(targetUrl + queryString, {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body,
    })

    // 获取响应内容
    const body = await response.text()
    
    // 获取响应头
    const headers = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    // 添加 CORS 头
    Object.assign(headers, corsHeaders)

    return {
      statusCode: response.status,
      headers: headers,
      body: body
    }
  } catch (error) {
    console.log('Error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }
  }
}
