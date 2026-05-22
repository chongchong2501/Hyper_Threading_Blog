---
title: Cloudflare 免费 VPN 部署教程：基于 edgetunnel 零成本搭建个人代理面板
published: 2026-05-22
description: 参考零度博客教程，使用 Cloudflare Pages、Workers KV 和开源项目 cmliu/edgetunnel，零成本部署一个可视化管理的个人代理面板，并导入订阅到常见客户端使用。
tags: [Cloudflare, VPN, Pages, Workers KV, edgetunnel, 部署教程]
category: 部署运维
draft: false
language: zh-CN
---

# Cloudflare 免费 VPN 部署教程：基于 edgetunnel 零成本搭建个人代理面板

很多人找“免费 VPN”，第一反应是去网上搜公共节点。但这类方案通常有三个问题：不稳定、速度波动大、随时可能失效。相比之下，更适合长期使用的思路，其实是借助 Cloudflare 的免费能力，自己部署一个轻量的代理面板，再把订阅链接导入客户端使用。

这篇文章参考了零度博客的教程，并重新整理成适合直接照着操作的版本。整套方案的核心是 Cloudflare Pages + Workers KV，再配合一个已经成熟的开源项目完成面板和订阅管理。

## 本文使用的开源项目

参考教程里实际使用的项目是：

- GitHub 仓库：<https://github.com/cmliu/edgetunnel>
- 项目名称：`cmliu/edgetunnel`
- 项目说明：一个基于 Cloudflare Workers / Pages 的多功能面板，支持 VLESS、Trojan、Shadowsocks 等协议，带后台管理、订阅生成和 KV 配置能力。

如果你去看这个仓库的 README，会发现它的 Pages 上传部署步骤、`ADMIN` 环境变量、`KV` 命名空间绑定、以及 `edgetunnel.pages.dev` 相关配置，和参考教程中的操作流程是一致的。因此可以确认，这篇教程部署所依赖的核心开源项目就是它。

## 先说结论：这套方案在做什么？

这套方案并不是“白嫖现成 VPN 服务”，而是把 Cloudflare 当作免费托管平台，部署一个属于你自己的轻量代理面板。你后续使用时，主要流程是：

1. 注册免费域名
2. 把域名接入 Cloudflare
3. 创建 Workers KV
4. 在 Cloudflare Pages 部署 `edgetunnel`
5. 配置后台密码和 KV 绑定
6. 绑定自定义域名
7. 登录后台生成订阅
8. 导入客户端使用

整个流程不需要 VPS，也不需要购买服务器。对于轻量使用、技术学习和个人折腾来说，这确实是一个成本很低的路线。

> 提醒一下：请遵守你所在地法律法规，以及 Cloudflare 和相关开源项目的服务条款。本文仅用于技术学习与个人网络加速研究。

## 部署前准备

开始之前，你需要准备下面几样东西：

- 一个 Cloudflare 账号
- 一个邮箱
- 一个免费域名
- 一个可上传 ZIP 的 Cloudflare Pages 项目
- 一个代理客户端，比如 `v2rayN`、`Clash Verge`、`sing-box` 等

如果你完全没有域名，参考教程里使用的是免费域名平台。注册成功后，拿到一个可管理的子域名即可继续。

## 第一步：注册免费域名

先准备一个免费域名。参考教程中使用的是免费二级域名方案，注册完成后可以获得类似下面这样的域名：

- `yourname.ccwu.cc`
- `yourname.us.ci`

建议域名尽量短一些，后续绑定 Pages 时更方便。比如你后面可以拿它来创建这样的子域名：

- `vpn.yourname.ccwu.cc`
- `node.yourname.us.ci`

## 第二步：把域名托管到 Cloudflare

登录 Cloudflare 后，把刚注册的域名接入进去。这里的目标很明确：让这个域名能在 Cloudflare 后台完成 DNS 管理，并能给 Pages 项目绑定自定义域名。

如果你的免费域名平台支持修改 NS 或 DNS 记录，就按 Cloudflare 后台提示完成托管。接入完成后，就可以在 Cloudflare 控制台里管理它。

## 第三步：创建 Workers KV 命名空间

`edgetunnel` 的后台配置依赖 Cloudflare KV 存储，所以这一步不能省。

操作路径大致如下：

`Cloudflare Dashboard -> Workers & Pages -> Storage / Workers KV -> Create`

创建一个新的 KV 命名空间即可，名字可以自定义，比如：

- `edgetunnel-kv`
- `vpn-panel-kv`

创建完成后先不用往里面写数据，后面只要把它绑定到 Pages 项目即可。

## 第四步：下载并部署 edgetunnel 到 Cloudflare Pages

这里就是整篇教程最核心的一步。

你需要先打开 GitHub 仓库：

<https://github.com/cmliu/edgetunnel>

进入仓库后，可以按照仓库 README 里提供的 Pages 上传部署方式来操作。参考教程采用的是“上传 ZIP 文件到 Pages”的方式，因为对新手最友好，不需要先折腾 GitHub Actions 或构建脚本。

操作思路如下：

1. 打开 `cmliu/edgetunnel` 项目主页
2. 下载仓库中用于 Pages 部署的压缩包 `main.zip`
3. 进入 Cloudflare 的 `Workers & Pages`
4. 创建新的 Pages 项目
5. 选择上传资产或上传项目压缩包
6. 把 `main.zip` 上传并部署

部署完成后，Cloudflare 会先给你一个默认访问地址，通常是 `xxx.pages.dev` 这种形式。

这时候项目虽然已经跑起来了，但还不能直接用，因为后台密码和 KV 绑定还没有配。

## 第五步：配置后台密码 ADMIN

部署完成后，进入 Pages 项目设置，添加环境变量。

路径一般是：

`Settings -> Variables and Secrets`

新增一个变量：

- 变量名：`ADMIN`
- 变量值：你自己设置的后台登录密码

比如：

```text
ADMIN=MyStrongPass123
```

保存以后，重新部署一次项目，让这个变量真正生效。

这一项很关键，因为你后面访问 `/admin` 后台时，就是靠这个密码登录。如果不设置，后台通常无法正常进入。

## 第六步：绑定 KV 命名空间

接着进入项目设置中的 `Bindings` 页面，把前面创建的 KV 命名空间绑定进来。

绑定时这样填：

- 类型：`KV Namespace`
- 变量名：`KV`
- 绑定目标：你刚才创建的 KV 命名空间

保存以后，再重新部署一次。

这里最常见的坑有两个：

- 变量名写错，不是 `KV`
- 绑定完成后忘记重新部署

如果后台能打开，但保存配置失败，或者订阅链接生成异常，第一时间就先检查这一步。

## 第七步：给 Pages 绑定自定义域名

现在可以给 Pages 项目绑定你自己的域名了。

进入：

`Pages Project -> Custom domains`

建议不要直接绑定根域名，而是绑定一个子域名，例如：

- `vpn.example.ccwu.cc`
- `node.example.us.ci`

按照 Cloudflare 后台提示配置即可。参考教程和 `edgetunnel` 项目 README 中提到，如果域名 DNS 不在 Cloudflare，需要按提示手动添加一条 CNAME 记录，指向：

```text
edgetunnel.pages.dev
```

实际操作时，以你当前 Pages 项目控制台显示的目标记录为准。

DNS 生效后，你就可以通过自定义域名访问你的面板了。

## 第八步：登录后台并生成订阅

浏览器打开：

```text
https://你的域名/admin
```

输入刚才设置好的 `ADMIN` 密码，就可以进入后台。

进入后台后，通常可以完成这些操作：

- 配置节点参数
- 生成单节点链接
- 生成订阅地址
- 导出给 Clash、sing-box、Surge 等客户端使用

`edgetunnel` 支持的协议比较丰富，常见包括：

- VLESS
- Trojan
- Shadowsocks

对于大多数人来说，最省事的用法不是复制单条节点，而是直接复制订阅地址导入客户端。后续如果你在后台改了参数，客户端更新订阅就行，不需要每次手动改。

## 第九步：导入客户端使用

部署成功后，后台一般会给你两类内容：

- 单节点链接
- 订阅地址

推荐优先使用订阅地址。这样后面调整配置更方便。

常见客户端导入方式大致如下：

### v2rayN

- 选择“添加订阅”或“从剪贴板导入”
- 粘贴后台生成的订阅链接
- 更新订阅后选择节点使用

### Clash Verge / Clash Meta

- 添加远程订阅
- 粘贴订阅 URL
- 更新配置并启用代理

### sing-box

- 导入订阅
- 同步配置后选择可用节点

## 常见问题

### 1. 后台打不开怎么办？

优先检查下面几项：

- 自定义域名是否已经生效
- `ADMIN` 环境变量是否添加成功
- 环境变量添加后是否重新部署
- 域名是否确实绑定到了当前 Pages 项目

### 2. 后台能打开，但保存配置失败怎么办？

大多数情况下是 KV 绑定没配对。请重点检查：

- 是否已经创建 KV 命名空间
- 变量名是不是严格写成 `KV`
- 添加绑定后是否重新部署

### 3. 自定义域名访问失败怎么办？

通常是 DNS 问题。重点检查：

- CNAME 是否填写正确
- 域名是否已接入 Cloudflare
- DNS 记录是否还在传播中

### 4. 为什么面板部署成功了，但代理还是不好用？

这种情况通常不是 Pages 部署失败，而是节点参数、订阅格式或客户端配置有问题。建议先用仓库默认推荐参数跑通，再慢慢折腾高级配置，比如 ProxyIP、优选订阅或链式代理。

## 这套方案的优点和限制

### 优点

- 不需要购买 VPS
- 部署成本极低
- Cloudflare 平台可用性较好
- 有后台管理面板，维护方便
- 支持主流客户端订阅导入

### 限制

- 依赖第三方开源项目维护
- 免费域名稳定性一般
- 高级配置对新手不够友好
- Cloudflare 的平台策略变化，可能影响长期使用体验

## 总结

如果你只是想零成本搭一个自己的轻量代理面板，那么基于 Cloudflare Pages + Workers KV + `cmliu/edgetunnel` 的这套方案，确实是目前比较容易上手的一条路线。

它最大的价值，不是“白嫖一个公共 VPN”，而是让你用 Cloudflare 的免费基础设施，部署一个属于自己的可管理订阅系统。整个流程里，真正最容易出错的地方只有三个：

1. 域名 DNS 没配对
2. `ADMIN` 环境变量漏配
3. `KV` 绑定后忘记重新部署

把这三个点处理好，基本就能把整套面板跑起来。

## 参考链接

- 参考教程：<https://www.freedidi.com/23618.html>
- 开源项目 GitHub：<https://github.com/cmliu/edgetunnel>
- Cloudflare Pages 文档：<https://developers.cloudflare.com/pages/>
- Cloudflare Pages 自定义域名文档：<https://developers.cloudflare.com/pages/configuration/custom-domains/>
- Cloudflare Pages 绑定与环境变量文档：<https://developers.cloudflare.com/pages/functions/bindings/>
- Cloudflare Workers KV 文档：<https://developers.cloudflare.com/kv/>
