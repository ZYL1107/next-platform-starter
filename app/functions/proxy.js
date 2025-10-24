export async function handler(event) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  
    // 处理 CORS 预检请求
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "",
      };
    }
  
    try {
      const { queryStringParameters } = event;
      const targetUrl = queryStringParameters.url;
  
      if (!targetUrl) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Missing 'url' parameter" }),
        };
      }
  
      const response = await fetch(targetUrl, {
        method: event.httpMethod,
        headers: {
          ...event.headers,
          host: new URL(targetUrl).host, // 避免 host 头问题
        },
        body: event.body,
      });
  
      const responseBody = await response.text();
  
      return {
        statusCode: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": response.headers.get("content-type") || "text/plain",
        },
        body: responseBody,
      };
    } catch (error) {
      console.error("Proxy error:", error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Internal Server Error" }),
      };
    }
  }
  