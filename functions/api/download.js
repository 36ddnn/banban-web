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

function mediaAllowed(hostname) {
  const host = String(hostname || "").toLowerCase();
  return MEDIA_HOSTS.some((suffix) => host === suffix || host.endsWith("." + suffix));
}

function safeFilename(value) {
  return String(value || "班伴媒体")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "班伴媒体";
}

function parseTarget(request) {
  const requestUrl = new URL(request.url);
  const target = requestUrl.searchParams.get("target") || "";
  const filename = safeFilename(requestUrl.searchParams.get("filename") || "");
  let mediaUrl;
  try {
    mediaUrl = new URL(target);
  } catch (error) {
    return { error: "媒体地址无效" };
  }
  if (mediaUrl.protocol !== "https:" || !mediaAllowed(mediaUrl.hostname)) {
    return { error: "不允许下载这个媒体地址" };
  }
  return { mediaUrl, filename };
}

export async function onRequestHead({ request }) {
  const parsed = parseTarget(request);
  if (parsed.error) {
    return new Response(null, { status: 400 });
  }
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestGet({ request }) {
  const parsed = parseTarget(request);
  if (parsed.error) {
    return new Response(parsed.error, { status: 400 });
  }
  let response;
  try {
    response = await fetch(parsed.mediaUrl.toString(), {
      method: "GET",
      headers: {
        Referer: "https://www.douyin.com/",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
        Accept: "*/*",
      },
    });
  } catch (error) {
    return new Response("媒体下载失败", { status: 502 });
  }
  if (!response.ok || !response.body) {
    return new Response("媒体不可下载", { status: response.status || 502 });
  }
  const contentType = response.headers.get("Content-Type") || "application/octet-stream";
  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(parsed.filename)}`,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
