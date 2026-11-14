(function () {
  "use strict";

  var ua = navigator.userAgent || "";
  var isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh|MacIntel/i.test(ua) && (navigator.maxTouchPoints || 0) > 1);
  if (!isIOS) return;

  var cache = { url: "", promise: null, file: null };
  var toastTimer = 0;

  function showToast(message) {
    var node = document.getElementById("webShareToast");
    if (!node) {
      node = document.createElement("div");
      node.id = "webShareToast";
      node.className = "web-share-toast";
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      node.classList.remove("is-visible");
    }, 2600);
  }

  function currentMedia() {
    var result = document.querySelector("#altParseResult");
    if (!result) return null;
    var video = result.querySelector("video.alt-result-video");
    var src = video ? video.currentSrc || video.src || "" : "";
    if (!src) {
      var open = result.querySelector("[data-alt-open]");
      src = open ? open.getAttribute("data-alt-open") || "" : "";
    }
    if (!src) return null;
    var titleNode = result.querySelector(".alt-parse-copy h3");
    return {
      url: src,
      title: titleNode ? titleNode.textContent.trim() : "班伴视频",
    };
  }

  function mediaFilename(title, url) {
    var ext = ".mp4";
    try {
      var match = new URL(url).pathname.match(/\.(mp4|mov|m4v|webm)$/i);
      if (match) ext = "." + match[1].toLowerCase();
    } catch (error) {}
    var safe = String(title || "班伴视频")
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60);
    return (safe || "班伴视频") + ext;
  }

  function downloadUrls(media) {
    var filename = mediaFilename(media.title, media.url);
    var target = encodeURIComponent(media.url);
    var name = encodeURIComponent(filename);
    var urls = [
      "/api/download?target=" + target + "&filename=" + name,
    ];
    var base = String(window.BANBAN_WEB_API_BASE || "").replace(/\/+$/, "");
    if (/^https?:\/\//i.test(base)) {
      urls.push(base + "/download?target=" + target + "&filename=" + name);
    }
    return { urls: urls, filename: filename };
  }

  async function fetchFile(media) {
    if (cache.url === media.url && cache.promise) return cache.promise;
    cache.url = media.url;
    cache.file = null;
    var info = downloadUrls(media);
    cache.promise = (async function () {
      for (var index = 0; index < info.urls.length; index += 1) {
        try {
          var response = await fetch(info.urls[index], {
            method: "GET",
            credentials: "omit",
            cache: "no-store",
          });
          if (!response.ok) continue;
          var blob = await response.blob();
          if (!blob || blob.size < 1024) continue;
          var type =
            blob.type && blob.type.indexOf("video/") === 0
              ? blob.type
              : "video/mp4";
          return new File([blob], info.filename, { type: type });
        } catch (error) {
          // Try the next proxy.
        }
      }
      try {
        var direct = await fetch(media.url, {
          method: "GET",
          credentials: "omit",
          cache: "no-store",
        });
        if (direct.ok) {
          var directBlob = await direct.blob();
          if (directBlob && directBlob.size >= 1024) {
            return new File([directBlob], info.filename, {
              type:
                directBlob.type && directBlob.type.indexOf("video/") === 0
                  ? directBlob.type
                  : "video/mp4",
            });
          }
        }
      } catch (error) {}
      throw new Error("无法读取视频文件");
    })();
    cache.promise.then(function (file) {
      cache.file = file;
    }).catch(function () {});
    return cache.promise;
  }

  async function shareToWechat(media) {
    if (!navigator.share) {
      window.open(media.url, "_blank", "noopener");
      showToast("当前浏览器不支持分享，已打开视频");
      return;
    }
    try {
      var file = cache.url === media.url && cache.file
        ? cache.file
        : await fetchFile(media);
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: media.title });
        return;
      }
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
    try {
      await navigator.share({
        title: media.title,
        text: "分享一个视频",
        url: media.url,
      });
    } catch (error) {
      if (error && error.name === "AbortError") return;
      window.open(media.url, "_blank", "noopener");
      showToast("视频文件读取失败，已打开原视频");
    }
  }

  function enhance() {
    var media = currentMedia();
    if (!media) return;
    document.querySelectorAll(".alt-parse-buttons").forEach(function (container) {
      var button =
        container.querySelector("[data-alt-save-media]") ||
        container.querySelector("[data-alt-save-local]");
      if (!button || button.dataset.webShare === "1") return;
      var replacement = button.cloneNode(true);
      replacement.dataset.webShare = "1";
      replacement.textContent = "分享给微信好友";
      button.replaceWith(replacement);
      replacement.addEventListener("click", async function () {
        var current = currentMedia();
        if (!current) return;
        var oldText = replacement.textContent;
        replacement.disabled = true;
        replacement.textContent = "准备分享…";
        try {
          await shareToWechat(current);
        } finally {
          replacement.disabled = false;
          replacement.textContent = oldText;
        }
      });
      fetchFile(media).catch(function () {});
    });
  }

  function start() {
    enhance();
    new MutationObserver(enhance).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
