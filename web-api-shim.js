(function () {
  "use strict";

  // 原生 Android App 已经有真正的 BanbanNative，不要在 WebView 内覆盖。
  if (window.BanbanNative) return;

  var BASE = String(window.BANBAN_WEB_API_BASE || "").replace(/\/+$/, "");

  function proxyUrl(path) {
    return BASE + path;
  }

  function configured() {
    return /^https?:\/\//i.test(BASE);
  }

  function emit(action, data) {
    if (typeof window.__BANBAN_WEB_ACCOUNT_RESULT === "function") {
      window.__BANBAN_WEB_ACCOUNT_RESULT(action, data);
    }
    if (typeof window.__banbanVideoParseResult === "function") {
      window.__banbanVideoParseResult(action, data);
    }
  }

  function fail(action, message) {
    emit(action, { status: 0, msg: message });
  }

  function stripTags(value) {
    return String(value || "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractStat(html, label) {
    if (!html) return "";
    var pattern = new RegExp(
      "<h5[^>]*>[\\s\\S]*?" +
        label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
        "[\\s\\S]*?</h5>[\\s\\S]*?<h3[^>]*>([\\s\\S]*?)</h3>",
      "i"
    );
    var match = String(html).match(pattern);
    return match ? stripTags(match[1]) : "";
  }

  function extractValue(html, label) {
    if (!html) return "";
    var pattern = new RegExp(
      "<label>\\s*" +
        label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
        "\\s*</label>[\\s\\S]*?<input[^>]*?value=\"([^\"]+)\"",
      "i"
    );
    var match = String(html).match(pattern);
    return match ? match[1].trim() : "";
  }

  function request(path, options) {
    if (!configured()) {
      return Promise.reject(
        new Error("网页接口代理未配置，请先部署 Cloudflare Worker 并填写 web-api-config.js")
      );
    }
    return fetch(proxyUrl(path), {
      credentials: "include",
      ...options,
    });
  }

  var bridge = {
    __BANBAN_WEB_SHIM: true,

    registerVideoParseUser: function (username, password, qq) {
      var form = new URLSearchParams();
      form.set("username", String(username || "").trim());
      form.set("password", String(password || ""));
      form.set("qq", String(qq || "").trim());
      request("/user/login/reg", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: form.toString(),
      })
        .then(function (response) {
          return response.text().then(function (text) {
            var finalUrl =
              response.headers.get("x-proxy-final-url") || response.url || "";
            var success =
              response.status === 200 &&
              (text.indexOf("注册成功") !== -1 ||
                finalUrl.indexOf("type=success") !== -1 ||
                !/注册失败|注册未成功|用户名.*存在|不符合要求/.test(text));
            emit("register", {
              status: success ? 200 : 0,
              msg: success
                ? "注册成功，正在自动登录…"
                : "注册未成功，用户名可能已存在或信息不符合要求",
            });
          });
        })
        .catch(function (error) {
          fail("register", "注册失败：" + error.message);
        });
    },

    loginVideoParseUser: function (username, password) {
      var form = new URLSearchParams();
      form.set("username", String(username || "").trim());
      form.set("password", String(password || ""));
      request("/user/login/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: form.toString(),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (login) {
          if (!login || Number(login.status) !== 200) {
            throw new Error(login && login.msg ? login.msg : "登录失败");
          }
          return request("/user/information", { method: "GET" }).then(function (info) {
            return info.text().then(function (html) {
              var uid = extractValue(html, "UID");
              var key = extractValue(html, "KEY");
              if (!uid || !key) {
                throw new Error("登录成功，但没有读取到 UID / KEY");
              }
              return request("/user/index", { method: "GET" })
                .then(function (index) {
                  return index.text().then(function (dashboard) {
                    emit("login", {
                      status: 200,
                      msg: "接口登录成功",
                      uid: uid,
                      key: key,
                      accountStatus: extractStat(dashboard, "账号状态"),
                      points: extractStat(dashboard, "剩余点数"),
                      balance: extractStat(dashboard, "账户余额"),
                    });
                  });
                })
                .catch(function () {
                  emit("login", {
                    status: 200,
                    msg: "接口登录成功",
                    uid: uid,
                    key: key,
                    accountStatus: "",
                    points: "",
                    balance: "",
                  });
                });
            });
          });
        })
        .catch(function (error) {
          fail("login", "登录失败：" + error.message);
        });
    },

    fetchVideoParseAccount: function () {
      request("/user/index", { method: "GET" })
        .then(function (response) {
          return response.text();
        })
        .then(function (html) {
          emit("account", {
            status: 200,
            accountStatus: extractStat(html, "账号状态"),
            points: extractStat(html, "剩余点数"),
            balance: extractStat(html, "账户余额"),
          });
        })
        .catch(function (error) {
          fail("account", "账户信息刷新失败：" + error.message);
        });
    },

    requestVideoParse: function (url) {
      var target;
      try {
        target = new URL(String(url || ""));
      } catch (error) {
        emit("parse", { status: 0, msg: "解析地址无效" });
        return;
      }
      request(target.pathname + target.search, { method: "GET" })
        .then(function (response) {
          return response.text().then(function (text) {
            emit("parse", {
              status: response.status === 200 ? 200 : 0,
              body: text,
              msg: response.status === 200 ? "解析成功" : "解析请求失败",
            });
          });
        })
        .catch(function (error) {
          emit("parse", { status: 0, msg: "解析请求失败：" + error.message });
        });
    },
  };

  window.__BANBAN_WEB_SHIM = true;
  window.BanbanNative = bridge;
})();
