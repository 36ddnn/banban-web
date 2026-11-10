const API_HOST = "api.videoparse.cn";

function json(body, status) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestGet({ request }) {
  const requestUrl = new URL(request.url);
  const target = requestUrl.searchParams.get("target") || "";
  let apiUrl;
  try {
    apiUrl = new URL(target);
  } catch (error) {
    return json(JSON.stringify({ code: 400, msg: "解析地址无效" }), 400);
  }
  if (apiUrl.hostname !== API_HOST || apiUrl.pathname !== "/home/api") {
    return json(JSON.stringify({ code: 400, msg: "只允许解析接口地址" }), 400);
  }
  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
      },
    });
    const body = await response.text();
    return json(body, response.status);
  } catch (error) {
    return json(JSON.stringify({ code: 502, msg: "解析代理请求失败" }), 502);
  }
}
