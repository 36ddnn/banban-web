(function () {
  "use strict";

  var DOWNLOAD_URL = "https://gitee.com/dingyiyun/banban";
  var IOS_GUIDE_KEY = "banban-ios-install-guide-seen";

  // Android app 会注入 BanbanNative；原生 App 内不弹任何提示。
  // 网页端为了复用接口逻辑会注入一个带 __BANBAN_WEB_SHIM 标记的桥接，不能当成 App。
  if (
    (window.BanbanNative && !window.__BANBAN_WEB_SHIM) ||
    window.location.protocol === "file:"
  ) {
    return;
  }

  var ua = navigator.userAgent || "";
  var maxTouchPoints = navigator.maxTouchPoints || 0;
  var isIPadOS = /Macintosh|MacIntel/i.test(ua) && maxTouchPoints > 1;
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || isIPadOS;
  var isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function downloadButton(label) {
    return '<a class="wg-primary" href="' +
      escapeHTML(DOWNLOAD_URL) +
      '" target="_blank" rel="noopener">' +
      label +
      "</a>";
  }

  function mount(html, options) {
    var existing = document.querySelector(".wg-overlay");
    if (existing) existing.remove();
    var overlay = document.createElement("div");
    overlay.className = "wg-overlay";
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    document.body.classList.add("wg-locked");
    var close = overlay.querySelector("[data-wg-close]");
    if (close && options && typeof options.onClose === "function") {
      close.addEventListener("click", options.onClose);
    }
    var primary = overlay.querySelector(".wg-primary");
    window.setTimeout(function () {
      if (primary) primary.focus({ preventScroll: true });
    }, 30);
  }

  function closeOverlay() {
    var overlay = document.querySelector(".wg-overlay");
    if (overlay) overlay.remove();
    document.body.classList.remove("wg-locked");
  }

  function showForcedDownloadNotice() {
    mount(
      '<div class="wg-card wg-card-forced" role="dialog" aria-modal="true" aria-labelledby="wg-title">' +
        '<div class="wg-icon wg-icon-android">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path></svg>' +
        "</div>" +
        '<h2 id="wg-title">请使用班伴 App</h2>' +
        '<p class="wg-copy">网页端仅支持苹果手机使用，其他设备请下载班伴安卓 App 后使用。</p>' +
        '<p class="wg-note">App 支持排班、待办、统计、短视频解析、本地保存和系统提醒。</p>' +
        '<div class="wg-actions wg-actions-single">' +
          downloadButton("前往下载安卓 App") +
        "</div>" +
      "</div>"
    );
  }

  function showIOSGuide() {
    mount(
      '<div class="wg-card wg-card-ios" role="dialog" aria-modal="true" aria-labelledby="wg-title">' +
        '<div class="wg-icon wg-icon-ios">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M12 7v7M9 10l3-3 3 3"></path></svg>' +
        "</div>" +
        '<p class="wg-kicker">BANBAN · 添加到主屏幕</p>' +
        '<h2 id="wg-title">把班伴放到主屏幕</h2>' +
        '<p class="wg-copy">可以将本页面添加到主屏幕上，方便下次直接打开。</p>' +
        '<ol class="wg-steps">' +
          '<li>' +
            '<span class="wg-step-index">1</span>' +
            '<span class="wg-step-copy"><b>用 Safari 打开本页面</b><small>点击底部工具栏的「分享」按钮</small></span>' +
            '<span class="wg-step-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M8 8l4-4 4 4"></path><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"></path></svg></span>' +
          "</li>" +
          '<li>' +
            '<span class="wg-step-index">2</span>' +
            '<span class="wg-step-copy"><b>选择「添加到主屏幕」</b><small>在分享菜单中向上滑动找到该选项</small></span>' +
            '<span class="wg-step-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M12 8v8M8 12h8"></path></svg></span>' +
          "</li>" +
          '<li>' +
            '<span class="wg-step-index">3</span>' +
            '<span class="wg-step-copy"><b>点击右上角「添加」</b><small>以后从主屏幕图标直接打开班伴</small></span>' +
            '<span class="wg-step-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6"></path></svg></span>' +
          "</li>" +
        "</ol>" +
        '<div class="wg-actions wg-actions-single">' +
          '<button class="wg-primary" type="button" data-wg-close>我知道了</button>' +
        "</div>" +
        '<p class="wg-footnote">仅首次访问提示，关闭后不再显示。</p>' +
      "</div>",
      {
        onClose: function () {
          try {
            window.localStorage.setItem(IOS_GUIDE_KEY, "1");
          } catch (error) {}
          closeOverlay();
        },
      }
    );
  }

  function detect() {
    if (isIOS) {
      if (isStandalone) return;
      var seen = false;
      try {
        seen = window.localStorage.getItem(IOS_GUIDE_KEY) === "1";
      } catch (error) {
        seen = false;
      }
      if (!seen) showIOSGuide();
      return;
    }
    // 非苹果手机设备：不允许继续使用网页，只能下载安卓 App。
    showForcedDownloadNotice();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", detect, { once: true });
  } else {
    detect();
  }
})();
