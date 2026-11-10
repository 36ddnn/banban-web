# 班伴 · 开源声明

更新日期：2026-11-08

## 1. 项目信息

- 项目名称：班伴 · 工作周记
- 英文名称：Banban
- 作者：无忧易连
- 源码仓库：<https://gitee.com/dingyiyun/banban>
- 网页版本：部署后由 Gitee Pages 提供访问
- 技术形态：原生 HTML / CSS / JavaScript PWA，Android WebView 外壳使用 Java

## 2. 代码许可

除本声明另有说明外，本项目中的源代码、页面结构、样式、构建脚本和文档，均采用 **MIT License** 授权。

完整许可文本见仓库根目录：

- [LICENSE](LICENSE)

在遵守 MIT License 的前提下，你可以：

- 使用、复制和分发本项目代码
- 修改代码并用于个人或商业项目
- 将修改后的版本再发布
- 在项目中保留原作者版权声明和许可声明

再分发时，请保留 `LICENSE` 中的版权声明和许可声明。

## 3. 不包含在 MIT 授权内的内容

以下内容属于作者或权利人的品牌资产，不随 MIT License 授权：

- 「班伴」「BANBAN」「无忧易连」等名称和文字标识
- 应用图标、启动图、Logo、二维码
- 鲸鲸形象、插画、角色设定和相关图片
- 应用截图、宣传图和商店素材

你可以在介绍、评测或引用本项目时展示这些素材，但不得将它们作为自己的应用名称、图标、品牌或容易造成来源混淆的标识使用。

项目中使用的第三方素材，仍归各自权利人所有，并适用其各自的许可条款。

## 4. 第三方组件与数据

本项目运行时没有第三方 JavaScript 依赖，界面由原生 HTML / CSS / JavaScript 编写。

构建期使用以下工具：

| 工具 | 用途 | 许可 |
| --- | --- | --- |
| [terser](https://github.com/terser/terser) | JavaScript 压缩 | BSD-2-Clause |
| [clean-css](https://github.com/clean-css/clean-css) | CSS 压缩 | MIT |
| [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator) | JavaScript 混淆 | BSD-2-Clause |
| [html-minifier-terser](https://github.com/terser/html-minifier-terser) | HTML 压缩 | MIT |

第三方数据：

- 天气数据来自 [Open-Meteo](https://open-meteo.com/)，适用 **CC BY 4.0**，使用时保留来源说明。
- 短视频解析功能通过第三方接口服务完成。接口账号、接口服务条款、点数、充值和解析结果均由对应服务提供方负责，不属于本项目 MIT 授权范围。
- Android WebView、Java 标准库、Android SDK 等平台组件适用其各自的平台许可。

## 5. 隐私与数据说明

- 排班、待办、个人资料、设置和本地保存记录默认只保存在本机 `localStorage` 中。
- 天气功能会在需要时向 Open-Meteo 发起网络请求。
- 短视频解析、接口登录和账户状态查询会向对应的第三方接口服务发起请求。
- 网页端和 Android 端都不会主动把排班、待办或个人资料上传到本项目自己的服务器。
- 使用第三方接口服务时，请同时阅读并遵守该服务提供方的隐私政策和使用条款。

## 6. 使用与分发说明

- 本项目按现状提供，不承诺适用于任何特定用途。
- 使用短视频解析功能时，请遵守目标平台的服务条款、版权规定和当地法律，仅用于学习、研究和合法授权的内容。
- 请勿使用本项目进行侵犯版权、绕过访问限制、批量滥用接口或其他违法活动。
- 第三方接口服务可能调整、限流、收费或停止服务，由此造成的功能不可用不属于本项目可控范围。

## 7. 免责声明

本项目按 **“AS IS”** 提供，不附带任何明示或默示担保，包括但不限于适销性、特定用途适用性和不侵权担保。

在适用法律允许的最大范围内，作者不对因使用或无法使用本项目而产生的任何直接、间接、偶然、特殊或后果性损失承担责任。

## 8. 贡献

欢迎通过 Gitee 仓库提交 Issue 或 Pull Request。

提交代码即表示你同意：

- 你有权提交该代码或素材
- 你的贡献可以按本项目的 MIT License 进行授权
- 贡献内容不包含他人的未授权代码、图片或数据

## 9. 联系方式

- Gitee 仓库：<https://gitee.com/dingyiyun/banban>
- 问题反馈：<https://work.weixin.qq.com/kfid/kfc77f35cf189540caf>

## 10. 声明更新

本声明可能随项目发展调整。更新后的声明将在仓库中发布，并自发布之日起生效。
