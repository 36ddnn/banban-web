(function () {
  "use strict";

  if (!window.__BANBAN_WEB_SHIM) return;

  var configured = /^https?:\/\//i.test(String(window.BANBAN_WEB_API_BASE || ""));
  var manualHandler = null;

  function setStatus(message, isError) {
    var node = document.querySelector("#videoApiRegisterStatus");
    if (!node) return;
    node.textContent = message || "";
    node.classList.toggle("is-error", Boolean(isError));
  }

  function setButton(button, text, disabled) {
    if (!button) return;
    button.textContent = text;
    button.disabled = Boolean(disabled);
  }

  function endpoint(uid, key) {
    return (
      "https://api.videoparse.cn/home/api?type=dsp&uid=" +
      encodeURIComponent(uid) +
      "&key=" +
      encodeURIComponent(key) +
      "&url="
    );
  }

  function finishRegistration(api, credentials) {
    try {
      var raw = JSON.parse(window.localStorage.getItem("banban.data.v1") || "{}");
      raw.settings = raw.settings || {};
      var previous = raw.settings.videoParserApi || {};
      raw.settings.videoParserApi = {
        ...previous,
        uid: String(api.uid || ""),
        key: String(api.key || ""),
        username: credentials.username,
        password: credentials.password,
        qq: credentials.qq,
        endpoint: endpoint(api.uid, api.key),
        accountStatus: String(api.accountStatus || ""),
        points: String(api.points || ""),
        balance: String(api.balance || ""),
        poolEnabled: false,
        poolAccounts: [],
      };
      window.localStorage.setItem("banban.data.v1", JSON.stringify(raw));
      setStatus("注册并登录成功，正在刷新页面…", false);
      window.setTimeout(function () {
        window.location.reload();
      }, 500);
    } catch (error) {
      setStatus("注册成功，但保存本地账号失败：" + error.message, true);
    }
  }

  function handleManualResult(action, data) {
    if (!manualHandler) return;
    var button = document.querySelector("#videoApiRegisterBtn");
    if (action === "register") {
      if (Number(data.status) !== 200) {
        setStatus(data.msg || "注册失败", true);
        setButton(button, "注册接口", false);
        manualHandler = null;
        window.__BANBAN_WEB_ACCOUNT_RESULT = null;
        return;
      }
      setStatus("注册成功，正在自动登录…", false);
      setButton(button, "正在自动登录…", true);
      manualHandler.phase = "login";
      window.BanbanNative.loginVideoParseUser(
        manualHandler.credentials.username,
        manualHandler.credentials.password
      );
      return;
    }
    if (action !== "login" || manualHandler.phase !== "login") return;
    if (Number(data.status) !== 200 || !data.uid || !data.key) {
      setStatus(data.msg || "注册成功，但自动登录失败，请手动登录", true);
      setButton(button, "注册接口", false);
      manualHandler = null;
      window.__BANBAN_WEB_ACCOUNT_RESULT = null;
      return;
    }
    finishRegistration(data, manualHandler.credentials);
  }

  function manualRegister() {
    var button = document.querySelector("#videoApiRegisterBtn");
    var username = document.querySelector("#videoApiRegUser")?.value.trim() || "";
    var password = document.querySelector("#videoApiRegPass")?.value || "";
    var qq = document.querySelector("#videoApiRegQQ")?.value.trim() || "";
    if (!username || !password || !qq) {
      setStatus("请填写用户名、密码和 QQ", true);
      return;
    }
    if (!configured) {
      setStatus("网页接口代理未配置，请先部署 Cloudflare Worker 并填写 web-api-config.js", true);
      return;
    }
    manualHandler = {
      phase: "register",
      credentials: { username: username, password: password, qq: qq },
    };
    window.__banbanVideoParseResult = null;
    window.__BANBAN_WEB_ACCOUNT_RESULT = handleManualResult;
    setStatus("正在提交注册…", false);
    setButton(button, "正在注册…", true);
    window.BanbanNative.registerVideoParseUser(username, password, qq);
  }

  function configure() {
    var registerButton = document.querySelector("#videoApiRegisterBtn");
    if (!registerButton) return;

    [
      "#videoApiRegUser",
      "#videoApiRegPass",
      "#videoApiRegQQ",
      "#videoApiLoginUser",
      "#videoApiLoginPass",
    ].forEach(function (selector) {
      var input = document.querySelector(selector);
      if (!input) return;
      input.readOnly = false;
      input.removeAttribute("readonly");
      input.setAttribute("aria-readonly", "false");
    });

    var tab = document.querySelector("#videoApiTabRegister");
    if (tab) tab.textContent = "注册";
    var heading = document.querySelector("#videoApiRegisterPanel .video-api-section-head h3");
    if (heading) heading.textContent = "注册接口";
    var registerUser = document.querySelector("#videoApiRegUser");
    var registerPass = document.querySelector("#videoApiRegPass");
    var registerQQ = document.querySelector("#videoApiRegQQ");
    if (registerUser) registerUser.placeholder = "手动输入接口用户名";
    if (registerPass) registerPass.placeholder = "手动输入接口密码";
    if (registerQQ) registerQQ.placeholder = "手动输入 QQ";

    if (!registerButton.dataset.webManual) {
      var clone = registerButton.cloneNode(true);
      clone.dataset.webManual = "1";
      clone.textContent = "注册接口";
      clone.disabled = false;
      registerButton.replaceWith(clone);
      clone.addEventListener("click", manualRegister);
      registerButton = clone;
    }

    var panel = document.querySelector("#videoApiRegisterPanel");
    if (panel && !document.querySelector("#webApiProxyNote")) {
      var note = document.createElement("p");
      note.id = "webApiProxyNote";
      note.className = "web-api-proxy-note";
      note.textContent = configured
        ? "网页端通过 Cloudflare Worker 代理注册接口。"
        : "网页端注册需要先在 web-api-config.js 中填写 Cloudflare Worker 地址。";
      panel.appendChild(note);
    }
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
