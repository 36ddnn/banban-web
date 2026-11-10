const API_ORIGIN = "https://api.videoparse.cn";
const MEDIA_HOSTS = [
  "douyinpic.com",
  "douyinvod.com",
  "douyin.com",
  "byteimg.com",
  "bytecdn.cn",
  "ixigua.com",
  "pstatp.com",
  "snssdk.com",
  "amemv.com",
  "tiktokcdn.com",
  "douyinlive.com",
];

function corsHeaders(origin) {
  const allowed = origin || "*";
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

function mediaAllowed(hostname) {
  const host = String(hostname || "").toLowerCase();
  return MEDIA_HOSTS.some((suffix) => host === suffix || host.endsWith("." + suffix));
}

function safeFilename(value) {
  return (
    String(value || "班伴媒体")
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "班伴媒体"
  );
}

async function downloadMedia(url, cors) {
  const target = url.searchParams.get("target") || "";
  const filename = safeFilename(url.searchParams.get("filename") || "");
  let mediaUrl;
  try {
    mediaUrl = new URL(target);
  } catch (error) {
    return new Response("媒体地址无效", { status: 400, headers: cors });
  }
  if (mediaUrl.protocol !== "https:" || !mediaAllowed(mediaUrl.hostname)) {
    return new Response("不允许下载这个媒体地址", { status: 400, headers: cors });
  }
  let media;
  try {
    media = await fetch(mediaUrl.toString(), {
      method: "GET",
      headers: {
        Referer: "https://www.douyin.com/",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
        Accept: "*/*",
      },
    });
  } catch (error) {
    return new Response("媒体下载失败", { status: 502, headers: cors });
  }
  if (!media.ok || !media.body) {
    return new Response("媒体不可下载", { status: media.status || 502, headers: cors });
  }
  const headers = new Headers(cors);
  headers.set(
    "Content-Type",
    media.headers.get("Content-Type") || "application/octet-stream"
  );
  headers.set(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
  );
  headers.set("Cache-Control", "no-store");
  return new Response(media.body, { status: 200, headers });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    if (url.pathname === "/download") {
      return downloadMedia(url, cors);
    }
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
