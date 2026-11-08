(function () {
  "use strict";

  if (!window.__BANBAN_WEB_SHIM) return;

  var API_SITE = "https://api.videoparse.cn/user/login";
  var ENDPOINT_PREFIX = "https://api.videoparse.cn/home/api";

  function setStatus(node, message, isError) {
    if (!node) return;
    node.textContent = message || "";
    node.classList.toggle("is-error", Boolean(isError));
  }

  function endpointFrom(uid, key) {
    return (
      ENDPOINT_PREFIX +
      "?type=dsp&uid=" +
      encodeURIComponent(uid) +
      "&key=" +
      encodeURIComponent(key) +
      "&url="
    );
  }

  function parseEndpoint(value) {
    var text = String(value || "").trim();
    if (!text) return { error: "请先粘贴接口地址" };
    var url;
    try {
      url = new URL(text);
    } catch (error) {
      return { error: "接口地址格式不正确" };
    }
    if (url.hostname !== "api.videoparse.cn" || url.pathname !== "/home/api") {
      return { error: "接口地址必须来自 api.videoparse.cn/home/api" };
    }
    var uid = String(url.searchParams.get("uid") || "").trim();
    var key = String(url.searchParams.get("key") || "").trim();
    if (!uid || !key) {
      return { error: "接口地址缺少 uid 或 key" };
    }
    return { uid: uid, key: key, endpoint: endpointFrom(uid, key) };
  }

  function saveEndpoint(input, status) {
    var parsed = parseEndpoint(input ? input.value : "");
    if (parsed.error) {
      setStatus(status, parsed.error, true);
      return;
    }
    try {
      var raw = JSON.parse(window.localStorage.getItem("banban.data.v1") || "{}");
      raw.settings = raw.settings || {};
      var previous = raw.settings.videoParserApi || {};
      raw.settings.videoParserApi = {
        ...previous,
        uid: parsed.uid,
        key: parsed.key,
        username: "",
        password: "",
        qq: "",
        endpoint: parsed.endpoint,
        accountStatus: "手动配置",
        points: "",
        balance: "",
        poolEnabled: false,
        poolAccounts: [],
      };
      window.localStorage.setItem("banban.data.v1", JSON.stringify(raw));
      setStatus(status, "接口地址已保存，正在刷新页面…", false);
      window.setTimeout(function () {
        window.location.reload();
      }, 500);
    } catch (error) {
      setStatus(status, "保存失败：" + error.message, true);
    }
  }

  function configure() {
    var auth = document.querySelector(".video-api-auth");
    if (!auth) return;
    if (document.querySelector("#webApiManualSection")) return;

    auth.hidden = true;

    var previous =
      (JSON.parse(window.localStorage.getItem("banban.data.v1") || "{}").settings || {})
        .videoParserApi || {};

    var panel = document.createElement("section");
    panel.id = "webApiManualSection";
    panel.className = "web-api-manual";
    panel.innerHTML =
      '<div class="web-api-manual-head">' +
        "<h3>手动配置解析接口</h3>" +
        "<span>iPhone 网页版</span>" +
      "</div>" +
      '<p class="web-api-manual-copy">网页版不提供注册和登录。请先到接口官网注册，复制解析接口地址后粘贴到这里。</p>' +
      '<ol class="web-api-manual-steps">' +
        "<li>打开接口官网，注册并登录。</li>" +
        "<li>进入用户中心，找到 <b>UID</b> 和 <b>KEY</b>。</li>" +
        "<li>复制解析接口地址，或按下面的格式拼接。</li>" +
      "</ol>" +
      '<a class="web-api-manual-link" href="' +
        API_SITE +
        '" target="_blank" rel="noopener">打开接口官网注册 / 登录</a>' +
      '<code class="web-api-endpoint-example">https://api.videoparse.cn/home/api?type=dsp&amp;uid=你的UID&amp;key=你的KEY&amp;url=</code>' +
      '<label class="web-api-endpoint-field">解析接口地址' +
        '<input id="webApiEndpointInput" type="url" spellcheck="false" autocomplete="off" placeholder="粘贴以 https://api.videoparse.cn/home/api 开头的地址">' +
      "</label>" +
      '<button class="primary-button web-api-endpoint-save" id="webApiEndpointSave" type="button">保存接口地址</button>' +
      '<p class="web-api-endpoint-status" id="webApiEndpointStatus" aria-live="polite"></p>';

    var anchor = document.querySelector(".video-api-auth");
    anchor.parentNode.insertBefore(panel, anchor);

    var input = document.querySelector("#webApiEndpointInput");
    var status = document.querySelector("#webApiEndpointStatus");
    if (input && previous.endpoint) input.value = previous.endpoint;
    document.querySelector("#webApiEndpointSave")?.addEventListener("click", function () {
      saveEndpoint(input, status);
    });
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("#videoParserApiBtn")) {
      window.setTimeout(configure, 120);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", configure, { once: true });
  } else {
    configure();
  }
})();
