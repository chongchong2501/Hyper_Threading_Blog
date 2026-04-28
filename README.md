<!--
  项目文档：Hyper Threading Blog
  说明：本仓库为我的个人博客源码，基于 Firefly（Astro）主题进行二次配置与内容维护。
-->

<div align="center">

# Hyper Threading Blog

> 超线程的个人博客（Astro 静态站点）

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro](https://img.shields.io/badge/Astro-5.16.3-orange)

</div>

---

## 🔗 链接

- 在线站点：https://hyperthreading.cn/
- 主题来源（上游）：https://github.com/CuteLeaf/Firefly
- Astro 部署指南：https://docs.astro.build/zh-cn/guides/deploy/

## ✨ 功能概览

- 静态站点生成：Astro + Tailwind CSS
- 页面切换动画：Swup（可配置）
- 响应式布局：桌面 / 平板 / 移动端适配
- 全文搜索：Pagefind（构建时生成索引）
- 壁纸模式：横幅 / 全屏叠加 / 纯色背景（可切换）
- RSS / Sitemap：构建时自动生成

## 📦 环境要求

- Node.js：>= 20（建议 20/22）
- pnpm：>= 9（本项目强制使用 pnpm）

## 🚀 本地开发

```bash
pnpm install
pnpm dev
```

启动后访问：`http://localhost:4321`

## 🏗️ 构建与预览

```bash
pnpm build
pnpm preview
```

构建产物默认输出到 `dist/`。

## 🧭 目录结构（常用）

```text
src/
  config/                站点与功能配置
  content/
    posts/               博客文章（Markdown）
    spec/                about/guestbook/friends 等页面内容
public/
  assets/
    images/              静态图片资源（例如壁纸、logo）
```

## ⚙️ 关键配置入口

- 站点信息、壁纸、主题色等：`src/config/siteConfig.ts`
- 个人资料：`src/config/profileConfig.ts`
- 导航栏：`src/config/navBarConfig.ts`
- 侧边栏布局：`src/config/sidebarConfig.ts`
- 评论系统：`src/config/commentConfig.ts`

## 📝 写文章

文章内容位于 `src/content/posts/`，支持 Frontmatter，例如：

```yaml
---
title: My First Post
published: 2025-12-01
description: 文章摘要
tags: [Astro, Blog]
category: Dev
draft: false
---
```

也可以使用脚本创建新文章：

```bash
pnpm new-post my-post
```

## ⚡ 性能建议（与本仓库配置匹配）

- 首屏横幅/壁纸优先使用 `.webp`（放在 `public/assets/images/`）
- 若不需要前台切换壁纸模式，可在 `siteConfig.ts` 中将 `backgroundWallpaper.switchable` 设为 `false`（减少渲染与脚本分支）
- 第三方统计脚本建议延迟加载，避免影响首屏指标

## 🙏 致谢

- 主题模板：Firefly（基于 Fuwari 二次开发）
- Astro / Tailwind CSS / Swup / Pagefind 等开源项目
