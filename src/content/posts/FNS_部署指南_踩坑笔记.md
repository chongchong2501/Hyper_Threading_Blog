---
title: FNS 部署指南与踩坑笔记
published: 2026-04-28
description: 记录 Fast Note Sync Service 在 Ubuntu 服务器上的部署流程、Nginx Proxy Manager 反代配置，以及 Cloudflare、Obsidian 插件接入中的常见踩坑与解决方案。
tags: [Fast Note Sync, Obsidian, 部署指南]
category: 部署运维
draft: false
image: server
---
# Fast Note Sync Service (FNS) 部署指南 & 踩坑笔记

> 基于 [haierkeys/fast-note-sync-service](https://github.com/haierkeys/fast-note-sync-service) 官方仓库 + 真实部署踩坑记录整理  
> 环境：百度云 VPS / Ubuntu / Nginx Proxy Manager (Docker) / Cloudflare CDN

---

## 一、快速安装

### 方式 1：一键脚本（推荐）

```bash
# 海外服务器
bash <(curl -fsSL https://raw.githubusercontent.com/haierkeys/fast-note-sync-service/master/scripts/quest_install.sh)

# 国内服务器（腾讯云 CNB 镜像，速度快）
bash <(curl -fsSL https://cnb.cool/haierkeys/fast-note-sync-service/-/git/raw/master/scripts/quest_install.sh) --cnb
```

脚本会自动完成：
- 下载对应系统的二进制文件到 `/opt/fast-note`
- 创建全局快捷命令 `fns`（位于 `/usr/local/bin/fns`）
- 注册 Systemd 服务并设置开机自启
- 进入交互式菜单，支持安装/升级/启停/切换镜像源

常用管理命令：
```bash
fns status    # 查看服务状态
fns start     # 启动服务
fns stop      # 停止服务
fns update    # 升级版本
fns menu      # 进入交互菜单
```

---

## 二、首次启动必做检查

### 1. 放行本地防火墙（ufw）

安装脚本**不会自动放行 ufw**，这是最常见的"服务启动但端口不通"原因：

```bash
ufw allow 9000/tcp
ufw reload
```

### 2. 放行云服务器安全组

登录云厂商控制台（阿里云/腾讯云/百度云/AWS），在**安全组入方向**添加：
- 协议：TCP
- 端口：`9000`
- 源地址：`0.0.0.0/0`

### 3. 修改默认 Token 密钥（安全警告）

启动日志会提示：
```
WARN  Using default secret key - please change security.auth-token-key
```

生成安全密钥并修改配置：
```bash
openssl rand -base64 32
```

编辑 `/opt/fast-note/config/config.yaml`：
```yaml
security:
    auth-token-key: "你生成的密钥"
```

**重启服务生效**（见下方"服务重启步骤"）。

---

## 三、服务重启步骤

⚠️ `systemctl restart fast-note` **不适用于此安装方式**。

正确步骤：
```bash
fns        # 唤起交互面板
# 然后输入 3 停止服务
# 再输入 2 启动服务
```

或直接使用：
```bash
fns stop   # 停止
fns start  # 启动
```

---

## 四、配置域名 + HTTPS（Nginx Proxy Manager）

### 前置条件

- 已安装 [Nginx Proxy Manager](https://nginxproxymanager.com/)（Docker 部署）
- 域名 DNS 已解析到服务器公网 IP
- 如使用 Cloudflare CDN，代理状态（橙色云）可开可关

### NPM 配置步骤

1. **登录 NPM 后台**（默认 `http://服务器IP:81`）
2. **Proxy Hosts → Add Proxy Host**

| 字段 | 值 |
|------|-----|
| Domain Names | `notesync.yourdomain.com` |
| Scheme | `http` |
| Forward Hostname / IP | `172.17.0.1`（Docker 网关地址，NPM 容器访问宿主机）|
| Forward Port | `9000` |
| Websockets Support | **✅ 必须勾选**（同步接口 `/api/user/sync` 使用 WS）|
| Block Common Exploits | 建议勾选 |

3. **SSL 选项卡**
   - SSL Certificate: `Request a new SSL Certificate`
   - Force SSL: **按需勾选**（见下方踩坑 #4）
   - HTTP/2 Support: 勾选
   - 如 Cloudflare 代理开启，建议用 **DNS Challenge** 申请证书，Provider 选 Cloudflare

4. **Advanced 自定义配置**（必须加，来自官方示例）

进入 Advanced → Custom Nginx Configuration，粘贴：

```nginx
client_max_body_size 50m;
proxy_buffering off;
proxy_max_temp_file_size 0;
proxy_read_timeout 86400;
proxy_send_timeout 86400;
```

> 说明：`client_max_body_size` 控制附件上传大小；`proxy_buffering off` 保证 WebSocket/大文件实时传输不缓冲。

5. **保存并测试**

浏览器访问 `https://notesync.yourdomain.com/webgui`

---

## 五、配置 ext-api-url（关键）

编辑 `/opt/fast-note/config/config.yaml`：

```yaml
server:
    # 如果你只用域名访问，填域名
    ext-api-url: "https://notesync.yourdomain.com"
    share-base-url: "https://notesync.yourdomain.com"

    # 如果你需要 IP 和域名同时可用，留空让前端自适应
    # ext-api-url: ""
    # share-base-url: ""
```

按"服务重启步骤"重启生效。

---

## 六、Obsidian 插件使用方法

### 1. 安装插件

在 Obsidian 中：
- **方式 A**：通过 Obsidian 社区插件市场搜索 `Fast Note Sync` 直接安装
- **方式 B**：手动下载 [obsidian-fast-note-sync](https://github.com/haierkeys/obsidian-fast-note-sync) 最新 Release，解压到 `.obsidian/plugins/obsidian-fast-note-sync/` 目录

安装后在 Obsidian 设置 → 第三方插件中启用 `Fast Note Sync`。

### 2. 获取服务器 API 配置

1. 浏览器打开 FNS WebGUI：`https://notesync.yourdomain.com/webgui`
2. 首次使用需**注册账号**（管理员账号，默认 UID 为 1）
3. 登录后，点击页面上的 **"复制 API 配置"**（或类似按钮）
4. 配置内容会自动复制到剪贴板，格式类似：
```json
{
  "serverUrl": "https://notesync.yourdomain.com",
  "token": "Bearer xxxxxxxx",
  "vault": "defaultVault"
}
```

### 3. 粘贴到 Obsidian 插件设置

1. 打开 Obsidian → 设置 → 第三方插件 → Fast Note Sync
2. 将复制的 API 配置**完整粘贴**到插件的配置输入框中
3. 插件会自动解析 `serverUrl`、`token`、`vault` 等字段
4. 保存设置

### 4. 首次同步

1. 在 Obsidian 中打开命令面板（Ctrl/Cmd + P）
2. 搜索 `Fast Note Sync: 同步全部` 或点击左侧栏的同步图标
3. 插件会自动创建 Vault（如 `defaultVault`）并开始双向同步
4. 后续编辑会自动实时同步到服务器和其他设备

### 5. 多设备同步

在其他设备的 Obsidian 中：
1. 同样安装并启用插件
2. 粘贴**同一套 API 配置**
3. 首次同步会把服务器上的笔记拉取到本地
4. 之后任意设备的编辑都会实时同步到所有在线设备

---

## 七、踩坑笔记（Troubleshooting）

### 坑 1：服务启动但 9000 端口无法访问

**现象**：`fns status` 显示运行中，但浏览器/ curl 访问超时。  
**原因**：`ufw` 或云安全组未放行 9000。  
**解决**：
```bash
ufw allow 9000/tcp
# 同时检查云控制台安全组
```

---

### 坑 2：GitHub 支持文档下载超时

**现象**：日志反复出现：
```
WARN  Failed to fetch support records ... context deadline exceeded
```
**原因**：服务器无法访问 `raw.githubusercontent.com`（国内常见）。  
**影响**：仅影响 WebGUI 的帮助文档加载，**不影响核心同步功能**。  
**解决**（可选）：
- 给服务器配置代理访问 GitHub
- 或忽略该警告

---

### 坑 3：修改 ext-api-url 后，IP 访问出现 "Failed to fetch"

**现象**：把 `ext-api-url` 改成域名后，用 `http://IP:9000/webgui` 打开报错。  
**原因**：前端页面会强制向 `ext-api-url` 指定的域名发起 API 请求，跨域或协议不匹配导致失败。  
**解决**：
- **方案 A（推荐生产环境）**：统一使用域名访问，不再直接用 IP
- **方案 B（IP/域名共存）**：把 `ext-api-url` 和 `share-base-url` 留空 `""`，让前端自适应当前浏览器地址

---

### 坑 4：Cloudflare + NPM 导致 ERR_TOO_MANY_REDIRECTS

**现象**：浏览器提示"重定向次数过多"。  
**原因**：Cloudflare SSL/TLS 加密模式为 **Flexible** 时，回源使用 HTTP；而 NPM 开启了 **Force SSL**，检测到 HTTP 就 301 跳 HTTPS，形成死循环。

**解决**（二选一）：

| 方案 | 操作 |
|------|------|
| **推荐** | Cloudflare 后台 → SSL/TLS → Overview → 加密模式改为 **Full (strict)** |
| 备选 | NPM 中关闭 **Force SSL**，让 Cloudflare 自行处理 HTTPS 跳转 |

---

### 坑 5：NPM 中 Forward IP 填 127.0.0.1 不通

**现象**：NPM 返回 502 Bad Gateway。  
**原因**：NPM 是 Docker 容器，`127.0.0.1` 指向的是容器自身，不是宿主机。  
**解决**：填写 Docker 网关地址 `172.17.0.1`，或宿主机的内网 IP（如 `192.168.x.x`）。

---

### 坑 6：SSL 证书申请失败（Cloudflare 代理开启时）

**现象**：NPM 申请 Let's Encrypt 证书报错或超时。  
**原因**：Cloudflare 橙色云（代理开启）会拦截 HTTP-01 验证请求。  
**解决**：
- **方案 A**：申请证书时临时关闭 Cloudflare 代理（灰色云），申请完再打开
- **方案 B（推荐）**：NPM 中使用 **DNS Challenge**，Provider 选 Cloudflare，填入 API Token（需 Zone:Read + DNS:Edit 权限）

---

### 坑 7：大文件/附件同步失败或超时

**现象**：上传大图片/附件时中断。  
**原因**：NPM 默认 `client_max_body_size` 太小，或 `proxy_buffering` 开启导致内存缓冲。  
**解决**：在 NPM Advanced 中加上官方推荐的配置：
```nginx
client_max_body_size 50m;
proxy_buffering off;
proxy_max_temp_file_size 0;
```

---

### 坑 8：Obsidian 插件连接不上

**检查清单**：
1. 服务器 9000 端口是否放行（ufw + 安全组）
2. 如使用域名，确认 `ext-api-url` 配置正确
3. 如使用 HTTPS，确认证书有效（不是自签）
4. 如使用 Cloudflare，确认加密模式为 Full (strict)
5. 在 WebGUI 中点击"复制 API 配置"，完整粘贴到 Obsidian 插件设置中
6. 确认插件中的 `serverUrl` 与浏览器访问的地址一致（不要混用 IP 和域名）

---

## 八、官方参考链接

- FNS 仓库主页：https://github.com/haierkeys/fast-note-sync-service
- 国内镜像：https://cnb.cool/haierkeys/fast-note-sync-service
- 官方 Nginx 配置示例：https://github.com/haierkeys/fast-note-sync-service/blob/master/scripts/https-nginx-example.conf
- 完整配置示例：https://github.com/haierkeys/fast-note-sync-service/blob/master/config/config.yaml
- Obsidian 插件仓库：https://github.com/haierkeys/obsidian-fast-note-sync
