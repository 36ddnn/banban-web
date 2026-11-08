const API_ORIGIN = "https://api.videoparse.cn";
const ALLOWED_ORIGINS = [
  "https://36ddnn.github.io",
  "http://127.0.0.1:8001",
  "http://localhost:8001",
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Expose-Headers": "X-Proxy-Final-URL",
    Vary: "Origin",
  };
}

function copyCookies(apiResponse, responseHeaders) {
  let cookies = [];
  if (typeof apiResponse.headers.getSetCookie === "function") {
    cookies = apiResponse.headers.getSetCookie();
  } else {
    const raw = apiResponse.headers.get("set-cookie") || "";
    if (raw) cookies = raw.split(/,(?=[^;=]+\s*=)/);
  }
  cookies.forEach((cookie) => {
    let cleaned = cookie
      .replace(/;\s*Domain=[^;]+/gi, "")
      .replace(/;\s*SameSite=[^;]+/gi, "");
    if (!/;\s*Secure/i.test(cleaned)) cleaned += "; Secure";
    cleaned += "; SameSite=None";
    responseHeaders.append("Set-Cookie", cleaned);
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const allowedPath =
      url.pathname.startsWith("/user/") || url.pathname === "/home/api";
    if (!allowedPath) {
      return new Response("Not found", { status: 404, headers: cors });
    }

    const target = new URL(API_ORIGIN + url.pathname + url.search);
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (["host", "origin", "referer", "cf-connecting-ip"].includes(lower)) return;
      headers.set(key, value);
    });

    let body;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    let apiResponse;
    try {
      apiResponse = await fetch(target.toString(), {
        method: request.method,
        headers,
        body,
        redirect: "follow",
      });
    } catch (error) {
      return new Response(JSON.stringify({ status: 0, msg: "接口代理请求失败" }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const responseHeaders = new Headers(cors);
    const contentType = apiResponse.headers.get("Content-Type");
    if (contentType) responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("X-Proxy-Final-URL", apiResponse.url);
    copyCookies(apiResponse, responseHeaders);

    return new Response(apiResponse.body, {
      status: apiResponse.status,
      headers: responseHeaders,
    });
  },
};
