# 班伴网页端 · Cloudflare Worker 接口代理

网页端直接请求 `https://api.videoparse.cn` 会被浏览器的 CORS 拦截。  
这个 Worker 只做一件事：把班伴需要的接口请求转发到 `api.videoparse.cn`，并补上 CORS 响应头。

## 部署

1. 打开 Cloudflare Dashboard
2. 进入 **Workers & Pages**
3. 创建一个 Worker
4. 把 `worker.js` 的内容完整粘贴进去
5. 部署
6. 复制 Worker 地址，例如：

```text
https://banban-api.example.workers.dev
```

## 配置前端

打开：

```text
web-api-config.js
```

把地址填进去：

```js
window.BANBAN_WEB_API_BASE = "https://banban-api.example.workers.dev";
```

保存后重新上传网页。

## 允许的网站

Worker 默认允许：

```text
https://36ddnn.github.io
http://127.0.0.1:8001
http://localhost:8001
```

如果以后换了域名，修改 `worker.js` 顶部的 `ALLOWED_ORIGINS`，重新部署。

## 这个 Worker 能处理什么

- `/user/login/reg`
- `/user/login/checkUser`
- `/user/information`
- `/user/index`
- `/home/api`

只允许这些路径，其他地址会返回 404。

## 安全说明

- Worker 只转发到 `api.videoparse.cn`，不是公开的任意 URL 代理。
- 账号密码仍由浏览器提交，Worker 不保存账号密码。
- 会话 Cookie 由 Worker 转发给浏览器，用于接口登录状态。
- 请不要把 Worker 改成允许任意目标地址，否则会变成开放代理。
