---
title: FNS 部署指南与踩坑笔记
published: 2026-04-28
description: 记录 Fast Note Sync Service 在 Ubuntu 服务器上的部署流程、Nginx Proxy Manager 反代配置，以及 Cloudflare、Obsidian 插件接入中的常见踩坑与解决方案。
tags: [Fast Note Sync, Obsidian, 部署指南]
category: 部署运维
draft: false
---
# Fast Note Sync Service (FNS) 部署指南 & 踩坑笔记

> 基于 [haierkeys/fast-note-sync-service](https://github.com/haierkeys/fast-note-sync-service) 官方仓库 + 真实部署踩坑记录整理  
> 环境：百度云 VPS / Ubuntu / Nginx Proxy Manager (Docker) / Cloudflare CDN  
> 仓库当前版本：v3.0.3（2026-05）

---

## 一、部署方式选择

官方提供两种部署方式，按需选择：

| 方式 | 适用场景 | 维护复杂度 |
|------|----------|-----------|
| **一键脚本（推荐）** | 单机部署、快速上手 | 低 |
| **Docker** | 已有 Docker 环境、需要容器化隔离 | 低 |

---

### 方式 1：一键脚本安装（推荐）

```bash
# 海外服务器
bash <(curl -fsSL https://raw.githubusercontent.com/haierkeys/fast-note-sync-service/master/scripts/quest_install.sh)

# 国内服务器（腾讯云 CNB 镜像，速度快）
bash <(curl -fsSL https://cnb.cool/haierkeys/fast-note-sync-service/-/git/raw/master/scripts/quest_install.sh) --cnb
```

脚本自动完成：
- 下载对应系统的二进制文件到 `/opt/fast-note`
- 创建全局快捷命令 `fns`（位于 `/usr/local/bin/fns`）
- 注册 Systemd/Linux 或 Launchd/macOS 服务并设置开机自启
- 进入交互式菜单，支持安装/升级/启停/切换镜像源

---

### 方式 2：Docker 部署

```bash
# 拉取镜像
docker pull haierkeys/fast-note-sync-service:latest

# 启动容器
docker run -tid --name fast-note-sync-service \
    -p 9000:9000 \
    -v /data/fast-note-sync/storage/:/fast-note-sync/storage/ \
    -v /data/fast-note-sync/config/:/fast-note-sync/config/ \
    haierkeys/fast-note-sync-service:latest
```

或用 docker-compose：

```yaml
version: '3'
services:
  fast-note-sync-service:
    image: haierkeys/fast-note-sync-service:latest
    container_name: fast-note-sync-service
    restart: always
    ports:
      - "9000:9000"
    volumes:
      - ./storage:/fast-note-sync/storage
      - ./config:/fast-note-sync/config
```

```bash
docker compose up -d
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

### 3. 修改默认 Token 密钥

启动日志会提示：
```
WARN  Using default secret key - please change security.auth-token-key
```

生成安全密钥并修改配置：
```bash
openssl rand -base64 32
```

编辑 `/opt/fast-note/config/config.yaml`（一键脚本）或挂载的 `./config/config.yaml`（Docker）：

```yaml
security:
    auth-token-key: "你生成的64位密钥"
```

**重启服务生效。**

---

## 三、服务管理

### 常用命令

```bash
fns status    # 查看服务状态
fns start     # 启动
fns stop      # 停止
fns update    # 升级到最新版
fns menu      # 进入交互式菜单（安装/升级/启停/切换镜像）
```

### 关于 systemctl

新版本 `fns` 脚本安装时会自动注册 Systemd 服务，因此也可以用 systemctl 管理：

```bash
systemctl status fast-note
systemctl start fast-note
systemctl stop fast-note
```

> 旧版本（v2.x 及之前）依赖交互菜单重启，当前版本已支持 systemctl 直接管理。

---

## 四、配置域名 + HTTPS（Nginx Proxy Manager）

### 前置条件

- 已安装 [Nginx Proxy Manager](https://nginxproxymanager.com/)（Docker 部署）
- 域名 DNS 已解析到服务器公网 IP
- NPM 容器与 FNS 在同一 Docker 网络或能访问宿主机

### NPM 配置步骤

1. 登录 NPM 后台（默认 `http://服务器IP:81`）
2. **Proxy Hosts → Add Proxy Host**

| 字段 | 值 |
|------|-----|
| Domain Names | `notesync.yourdomain.com` |
| Scheme | `http` |
| Forward Hostname / IP | `172.17.0.1`（Docker 网关地址）或宿主机内网 IP |
| Forward Port | `9000` |
| Websockets Support | **✅ 必须勾选**（同步接口使用 WS）|
| Block Common Exploits | 建议勾选 |

3. **SSL 选项卡**
   - SSL Certificate: `Request a new SSL Certificate`
   - Force SSL: 建议勾选（配合 Cloudflare Full 模式）
   - HTTP/2 Support: 勾选

4. **Advanced 自定义配置**

进入 Advanced → Custom Nginx Configuration，粘贴：

```nginx
client_max_body_size 50m;
proxy_buffering off;
proxy_max_temp_file_size 0;
proxy_read_timeout 86400;
proxy_send_timeout 86400;
```

> `client_max_body_size` 控制附件上传大小；`proxy_buffering off` 保证 WebSocket/大文件实时传输不缓冲。

5. **保存并测试**

浏览器访问 `https://notesync.yourdomain.com/webgui`

---

## 五、核心配置（ext-api-url）

编辑 `/opt/fast-note/config/config.yaml`（或 Docker 挂载的 `./config/config.yaml`）：

```yaml
server:
    # 仅用域名访问时，填域名
    ext-api-url: "https://notesync.yourdomain.com"
    share-base-url: "https://notesync.yourdomain.com"

    # IP/域名共存时，留空让前端自适应
    # ext-api-url: ""
    # share-base-url: ""
```

修改后重启服务：`fns restart` 或 `systemctl restart fast-note`。

---

## 六、MCP（Model Context Protocol）配置

FNS v3.0+ 原生支持 MCP，可作为 MCP Server 接入 Cherry Studio、Cursor、Claude Code 等 AI 客户端，让 AI 直接读写私人笔记。

### 通用请求头

| 头字段 | 说明 |
|--------|------|
| `Authorization: Bearer <Token>` | 从 WebGUI "复制 API 配置" 获取的 Token |
| `X-Default-Vault-Name: <VaultName>` | 默认 Vault 名称（可选） |

### 方式 A：StreamableHTTP（推荐）

所有 MCP 客户端通用：

```json
{
  "mcpServers": {
    "fns": {
      "url": "http://<IP>:9000/api/mcp",
      "type": "http",
      "headers": {
        "Authorization": "Bearer <Token>",
        "X-Default-Vault-Name": "<VaultName>"
      }
    }
  }
}
```

### 方式 B：SSE（向后兼容，适用于 Cherry Studio 等）

```json
{
  "mcpServers": {
    "fns": {
      "url": "http://<IP>:9000/api/mcp/sse",
      "type": "sse",
      "headers": {
        "Authorization": "Bearer <Token>",
        "X-Default-Vault-Name": "<VaultName>"
      }
    }
  }
}
```

---

## 七、Obsidian 插件使用方法

### 1. 安装插件

- **方式 A**：Obsidian 社区插件市场搜索 `Fast Note Sync`
- **方式 B**：手动下载 [obsidian-fast-note-sync](https://github.com/haierkeys/obsidian-fast-note-sync) 最新 Release，解压到 `.obsidian/plugins/obsidian-fast-note-sync/`

### 2. 获取 API 配置

1. 浏览器打开 FNS WebGUI：`https://notesync.yourdomain.com/webgui`
2. 首次使用需**注册账号**（第一个注册的账号即为管理员，UID 为 1）
3. 登录后，点击页面上的 **"复制 API 配置"**
4. 配置内容会自动复制到剪贴板：

```json
{
  "serverUrl": "https://notesync.yourdomain.com",
  "token": "Bearer xxxxxxxx",
  "vault": "defaultVault"
}
```

### 3. 粘贴到 Obsidian 插件设置

1. 打开 Obsidian → 设置 → 第三方插件 → Fast Note Sync
2. 将复制的 API 配置**完整粘贴**到输入框中
3. 插件自动解析 `serverUrl`、`token`、`vault`
4. 保存设置

### 4. 首次同步

1. 在 Obsidian 中打开命令面板（Ctrl/Cmd + P）
2. 搜索 `Fast Note Sync: 同步全部` 或点击左侧栏的同步图标
3. 插件自动创建 Vault 并开始双向同步

### 5. 多设备同步

在其他设备的 Obsidian 中重复上述步骤，使用**同一套 API 配置**即可。

---

## 八、进阶配置

### 数据库

默认使用 SQLite，适合个人使用。如需 MySQL/PostgreSQL，修改 `config.yaml`：

```yaml
database:
  type: mysql          # mysql | postgres | sqlite
  host: 127.0.0.1
  port: 3306
  username: fns
  password: "your-password"
  name: fast_note_sync
```

### 存储后端

支持本地文件系统、阿里云 OSS、AWS S3、Cloudflare R2、MinIO、WebDAV：

```yaml
storage:
  local-fs:
    is-enable: true
    httpfs-is-enable: true
    save-path: "storage/uploads"
  aliyun-oss:
    is-enable: false     # 设为 true 并配置 AccessKey 等
```

### 内网穿透

FNS 原生支持 ngrok 和 Cloudflare Tunnel：

```yaml
ngrok:
  enabled: true
  auth-token: "your-token"
  domain: "your-domain.ngrok.io"

cloudflare:
  enabled: true
  token: "your-tunnel-token"
```

### Git 自动提交

```yaml
git:
  name: "FNS Service"
  email: "fns@email.com"
```

### 关闭注册（多用户场景）

```yaml
user:
  register-is-enable: false
  admin-uid: 1    # 指定管理员 UID
```

---

## 九、踩坑笔记（Troubleshooting）

### 坑 1：服务启动但 9000 端口无法访问

**现象**：`fns status` 显示运行中，但浏览器/curl 访问超时。  
**原因**：`ufw` 或云安全组未放行 9000。  
**解决**：
```bash
ufw allow 9000/tcp
# 同时检查云控制台安全组
```

---

### 坑 2：GitHub 支持文档下载超时

**现象**：日志出现 `Failed to fetch support records ... context deadline exceeded`。  
**原因**：服务器无法访问 `raw.githubusercontent.com`（国内常见）。  
**影响**：仅影响 WebGUI 帮助文档加载，**不影响核心同步功能**。  
**解决**：忽略或配置代理。

---

### 坑 3：修改 ext-api-url 后 IP 访问报错

**现象**：`ext-api-url` 设为域名后，`http://IP:9000/webgui` 打开报错。  
**原因**：前端强制向域名发起 API 请求，跨域或协议不匹配。  
**解决**：
- **推荐（生产）**：统一使用域名访问
- **IP/域名共存**：`ext-api-url` 和 `share-base-url` 留空 `""`

---

### 坑 4：Cloudflare + NPM 导致 ERR_TOO_MANY_REDIRECTS

**现象**：浏览器提示"重定向次数过多"。  
**原因**：Cloudflare SSL 加密模式为 **Flexible**，回源 HTTP；NPM 开启 **Force SSL** 后检测到 HTTP 就 301 跳 HTTPS，死循环。  
**解决**（二选一）：

| 方案 | 操作 |
|------|------|
| **推荐** | Cloudflare → SSL/TLS → 加密模式改为 **Full (strict)** |
| 备选 | NPM 中关闭 **Force SSL** |

---

### 坑 5：NPM 中 Forward IP 填 127.0.0.1 不通

**现象**：NPM 返回 502 Bad Gateway。  
**原因**：NPM 是 Docker 容器，`127.0.0.1` 指向容器自身。  
**解决**：填写 Docker 网关 `172.17.0.1`，或宿主机内网 IP。

---

### 坑 6：SSL 证书申请失败（Cloudflare 代理开启时）

**原因**：Cloudflare 橙色云拦截 HTTP-01 验证请求。  
**解决**：
- **方案 A**：申请证书时临时关闭 Cloudflare 代理（灰色云），申请完再开启
- **方案 B（推荐）**：NPM 中用 **DNS Challenge**，Provider 选 Cloudflare，API Token 需 `Zone:Read + DNS:Edit` 权限

---

### 坑 7：大文件/附件同步失败或超时

**原因**：NPM 默认 `client_max_body_size` 太小，或 `proxy_buffering` 开启。  
**解决**：在 NPM Advanced 中加上：
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
3. 如使用 HTTPS，确认证书有效（非自签）
4. 如使用 Cloudflare，确认加密模式为 Full (strict)
5. 在 WebGUI 点击"复制 API 配置"，完整粘贴到插件设置
6. 确认 `serverUrl` 与浏览器访问地址一致（不混用 IP 和域名）

---

### 坑 9：Docker 部署的数据持久化

**现象**：容器重启后数据丢失。  
**原因**：未挂载 `storage` 和 `config` 卷。  
**解决**：启动时务必通过 `-v` 或 `volumes` 挂载宿主机目录。

---

### 坑 10：国内服务器拉取 Docker 镜像慢

**解决**：配置 Docker 镜像加速器（如阿里云加速器、中科大源）：

```bash
# /etc/docker/daemon.json
{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]
}
```

---

## 十、官方参考链接

- FNS 仓库主页：https://github.com/haierkeys/fast-note-sync-service
- 国内镜像：https://cnb.cool/haierkeys/fast-note-sync-service
- 官方 Nginx 配置示例：https://github.com/haierkeys/fast-note-sync-service/blob/master/scripts/https-nginx-example.conf
- 完整配置示例：https://github.com/haierkeys/fast-note-sync-service/blob/master/config/config.yaml
- Obsidian 插件仓库：https://github.com/haierkeys/obsidian-fast-note-sync
