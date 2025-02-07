export const handler = async (event) => {
  const url = event.queryStringParameters.url; // 获取前端传递的 URL
  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'url' parameter" }),
    };
  }

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Netlify-Proxy-Function",
      },
    });

    const data = await response.text(); // 获取响应数据

    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*", // 允许跨域
        "Content-Type": "application/json",
      },
      body: data, // 直接返回目标服务器的响应
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};
