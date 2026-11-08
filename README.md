# \# 班伴网页端 

# 

# 这是「班伴」的静态网页版本

# 

# \## 目录内容

# 

# ```text

# index.html              网页入口

# css/                    样式

# js/                     应用逻辑

# icons/                  图标、二维码、鲸鲸图片

# manifest.webmanifest    PWA 配置

# sw.js                   Service Worker

# .nojekyll               防止 Gitee Pages 使用 Jekyll 处理

# LICENSE                 MIT License

# OPEN\_SOURCE\_NOTICE.md   开源声明

# ```

# 

# \## 开源声明

# 

# 本项目代码采用 MIT License。

# 

# 完整说明见：

# 

# \- \[OPEN\_SOURCE\_NOTICE.md](OPEN\_SOURCE\_NOTICE.md)

# \- \[LICENSE](LICENSE)

# 

# \## 功能说明

# 

# 这是一个纯网页版本，排班、待办、统计、一言、个人资料、主题和大部分本地功能都可以使用。

# 

# 以下功能依赖 Android 原生 WebView 桥接，在纯网页端不可用：

# 

# \- 短视频解析接口登录、注册和解析

# \- 保存视频/图片到 Android 本地文件

# \- Android 小组件

# \- 系统级通知、精确闹钟

# \- 原生文件导入/导出

# 

# 这些按钮在网页端会提示当前环境不支持，属正常现象。

# 

# \## Gitee Pages 无法开启时

# 

# 如果仓库的「服务」里没有 Gitee Pages 入口，通常是账号或仓库暂时不满足 Gitee Pages 的开通条件（例如实名认证或服务调整）。

# 

# 可以改用以下任意一个静态托管：

# 

# \- Cloudflare Pages

# \- Vercel

# \- Netlify

# \- GitHub Pages

# 

# 上传方式相同，入口文件都是 `index.html`。

# 

# \## 更新网页

# 

# 重新构建后，用新的 `dist` 内容覆盖仓库文件，然后在 Gitee Pages 里重新部署。

# 

# 如果用户仍看到旧版本，刷新页面或重新打开即可；应用会通过 Service Worker 缓存更新。



