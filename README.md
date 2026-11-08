# 班伴网页端 · GitHub Pages 部署包

这是「班伴」的静态网页版本，已经构建完成，不需要安装 Node.js，也不需要再打包。

## 目录内容

```text
index.html                       网页入口
css/                             样式
js/                              应用逻辑
icons/                           图标、二维码、鲸鲸图片
manifest.webmanifest             PWA 配置
sw.js                            Service Worker
.nojekyll                        防止 GitHub Pages 使用 Jekyll 处理
.github/workflows/pages.yml      自动部署到 GitHub Pages
LICENSE                          MIT License
OPEN_SOURCE_NOTICE.md            开源声明
```

## 上传到 GitHub

新建一个仓库，例如：

```text
banban-web
```

然后把这个文件夹里的**全部内容**上传到仓库根目录。

注意是上传文件夹里面的文件，不要把 `banban-web-github` 这一层再套进去。

仓库根目录应该直接看到：

```text
index.html
css/
js/
icons/
.github/
```

## 开启 GitHub Pages

### 方式一：使用仓库自带的 Actions

仓库已经包含：

```text
.github/workflows/pages.yml
```

进入仓库：

```text
Settings → Pages → Build and deployment → Source
```

选择：

```text
GitHub Actions
```

之后每次推送到 `main` 或 `master` 分支，都会自动部署。

首次推送后，可以在仓库的 **Actions** 页面查看 `Deploy static site to Pages` 是否成功。

### 方式二：直接从分支部署

如果不使用 Actions：

```text
Settings → Pages → Source → Deploy from a branch
Branch：main 或 master
Folder：/ (root)
```

保存后等待部署完成。

## 用户访问地址

GitHub Pages 的地址规则：

```text
https://<GitHub用户名>.github.io/<仓库名>/
```

当前部署地址：

```text
https://36ddnn.github.io/banban-web/
```

如果使用自定义域名，则在 `Settings → Pages → Custom domain` 中配置。

### 打开是 404 时

先确认仓库根目录直接存在以下文件：

```text
index.html
css/
js/
icons/
.github/workflows/pages.yml
```

如果仓库里看到的是 `banban-web-github/` 这一层文件夹，说明文件被套了一层，GitHub Pages 根目录会找不到 `index.html`。需要把这一层里面的文件移到仓库根目录。

然后检查：

```text
Settings → Pages → Build and deployment → Source
```

如果使用 Actions，选择 `GitHub Actions`，再到 Actions 页面确认 `Deploy static site to Pages` 是否成功。

如果使用分支部署，选择 `Deploy from a branch`，分支选 `main` 或 `master`，目录选 `/ (root)`。

修改后等待 1–3 分钟再刷新。GitHub Pages 首次部署和更新不是立即生效。

## 不要使用这些地址

下面的地址不能直接当网页打开：

```text
https://github.com/<用户名>/<仓库名>/blob/main/index.html
https://raw.githubusercontent.com/<用户名>/<仓库名>/main/index.html
```

这些分别是 GitHub 文件预览页和纯文本文件，CSS、JS、图片无法按网页方式加载。

必须使用 GitHub Pages 生成的站点地址。

## 本地预览

在当前文件夹打开终端：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000/
```

不要直接双击 `index.html`，因为 PWA 和 Service Worker 需要通过 HTTP/HTTPS 访问。

## 功能说明

这是一个纯网页版本，排班、待办、统计、一言、个人资料、主题和大部分本地功能都可以使用。

以下功能依赖 Android WebView 原生桥接，在纯网页端不可用：

- 短视频解析接口登录、注册和解析
- 保存视频/图片到 Android 本地文件
- Android 小组件
- 系统级通知、精确闹钟
- 原生文件导入/导出

这些按钮在网页端会提示当前环境不支持，属正常现象。

## 访问提示

网页端会根据访问设备显示不同提示：

- Android App 内访问：不显示任何提示
- Windows 浏览器：提示网页端部分功能不可用，并提供 App 下载入口
- iPhone / iPad 首次访问：显示「添加到主屏幕」引导，关闭后不再重复
- Android 浏览器：显示下载 App 的强制提示，不提供继续使用网页的按钮

这些提示文件是：

```text
web-guard.js
web-guard.css
```

已经接入 `index.html` 和 `sw.js`，不需要额外配置。

## 更新网页

重新构建后，用新的 `dist` 内容覆盖仓库文件，然后推送到 `main`。

如果使用 Actions，推送后会自动重新部署；如果使用分支部署，GitHub Pages 会自动更新。

用户如果仍看到旧版本，刷新页面或重新打开即可；应用会通过 Service Worker 缓存更新。

## 开源声明

本项目代码采用 MIT License。

- [OPEN_SOURCE_NOTICE.md](OPEN_SOURCE_NOTICE.md)
- [LICENSE](LICENSE)
