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

***

## 🔗 链接

- 在线站点：<https://hyperthreading.cn/>
- 主题来源（上游）：<https://github.com/CuteLeaf/Firefly>
- Astro 部署指南：<https://docs.astro.build/zh-cn/guides/deploy/>

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

说明：本项目在安装依赖前会执行 `npx only-allow pnpm`，如果你用 npm/yarn 安装会被拦截，见 [package.json](file:///e:/program/Hyper_Threading_Blog/package.json#L5-L18)。

## 🚀 快速开始（本地开发）

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

## ✅ 检查与代码规范（重点）

本仓库在 CI 中会跑三类检查：格式/风格（Biome）、类型与 Astro 校验（Astro Check/TypeScript）、构建（Astro Build）。为了避免“本地通过但 CI 挂掉”，`Biome` 版本在本地依赖与 CI 中已固定为同一版本。

### 一键复现 CI（推荐）

```bash
pnpm exec biome ci ./src
pnpm astro check
pnpm astro build
```

### 本地自动修复（会改文件）

```bash
pnpm run format
pnpm run lint
```

### 命令速查

| 目标                      | 命令                         | 是否改文件 |
| ----------------------- | -------------------------- | ----- |
| 开发服务                    | `pnpm dev`                 | 否     |
| 格式化（Biome）              | `pnpm run format`          | 是     |
| Lint + import 排序（Biome） | `pnpm run lint`            | 是     |
| 只检查不修改（Biome）           | `pnpm exec biome ci ./src` | 否     |
| Astro 语义/类型检查           | `pnpm astro check`         | 否     |
| TS 类型检查（更严格）            | `pnpm run type-check`      | 否     |
| 构建                      | `pnpm build`               | 否     |
| 预览构建结果                  | `pnpm preview`             | 否     |

### 修改后必跑哪些？哪些可选？

按你本次修改涉及的范围选择最小必跑集：

| 修改内容                                                                        | 必跑（最小）                                          | 建议加跑（更稳）           |
| --------------------------------------------------------------------------- | ----------------------------------------------- | ------------------ |
| 改了 `src/` 下的代码（.ts/.js/.astro/.svelte）                                      | `pnpm exec biome ci ./src`                      | `pnpm astro check` |
| 改了路由/布局/插件/构建链路（`src/pages`/`src/layouts`/`src/plugins`/`astro.config.mjs`） | `pnpm exec biome ci ./src` + `pnpm astro check` | `pnpm astro build` |
| 只改文章内容（`src/content/posts/*.md`）/页面内容（`src/content/spec/*.md`）              | `pnpm astro check`                              | `pnpm astro build` |
| 只改样式（`src/styles/*` 或 Tailwind 相关）                                          | `pnpm exec biome ci ./src`                      | `pnpm astro build` |
| 只改 `README.md`                                                              | 无                                               | 无                  |

说明：

- `pnpm run format` / `pnpm run lint` 是“修复命令”，一般在 `biome ci` 报错后再执行。
- `pnpm run type-check` 比 `pnpm astro check` 更严格，通常在大量改 TS 类型/工具函数后再跑一次即可。

对应的 GitHub Actions：

- 代码规范： [.github/workflows/biome.yml](file:///e:/program/Hyper_Threading_Blog/.github/workflows/biome.yml)
- Check/Build： [.github/workflows/build.yml](file:///e:/program/Hyper_Threading_Blog/.github/workflows/build.yml)
- Pages 部署： [.github/workflows/deploy.yml](file:///e:/program/Hyper_Threading_Blog/.github/workflows/deploy.yml)

## 🧭 目录结构（更详细）

```text
astro.config.mjs                 Astro 配置（集成、Markdown/rehype/remark、Swup 容器等）
biome.json                       Biome 规则配置
.github/workflows/               CI 工作流（格式检查/构建/部署）

src/
  pages/                         路由入口（文章页、列表页、功能页）
    posts/[...slug].astro        文章详情页入口（传递文章上下文给布局）
  layouts/                       页面布局骨架（Header/侧边栏/Footer/Swup 容器）
    Layout.astro                 全局布局（head、全局脚本与样式、过渡相关）
    MainGridLayout.astro         主栅格布局（左右侧栏、文章页上下文）
  components/
    layout/                      导航栏/侧边栏/Footer 等布局组件
    widget/                      小组件（Tags、RelatedPosts、TOC、Calendar 等）
    comment/                     评论系统（Giscus/Disqus/Waline/Twikoo 等）
  config/                        站点与功能配置（最常改）
  content/                       内容集合（文章 posts + 页面 spec）
    posts/                       博客文章（Markdown）
    spec/                        about/guestbook/friends 等页面内容
  utils/                         工具函数（内容处理、URL、TOC、setting、推荐文章等）
  plugins/                       remark/rehype 插件、Mermaid、邮件保护等
  styles/                        主题样式（布局、动画、Markdown、组件响应式）
  i18n/                          多语言配置
  integrations/                  构建期集成（例如搜索索引）

public/
  assets/
    images/              静态图片资源（例如壁纸、logo）
```

## ⚙️ 关键入口（配置/布局/逻辑）

### 配置入口（最常改）

- 站点信息、壁纸、主题色、页面开关： [siteConfig.ts](file:///e:/program/Hyper_Threading_Blog/src/config/siteConfig.ts)
- 个人资料： [profileConfig.ts](file:///e:/program/Hyper_Threading_Blog/src/config/profileConfig.ts)
- 导航栏： [navBarConfig.ts](file:///e:/program/Hyper_Threading_Blog/src/config/navBarConfig.ts)
- 侧边栏布局/组件顺序： [sidebarConfig.ts](file:///e:/program/Hyper_Threading_Blog/src/config/sidebarConfig.ts)
- 评论系统： [commentConfig.ts](file:///e:/program/Hyper_Threading_Blog/src/config/commentConfig.ts)
- 配置导出聚合： [index.ts](file:///e:/program/Hyper_Threading_Blog/src/config/index.ts)

### 页面结构与过渡（Swup）

- Swup 集成与替换容器配置： [astro.config.mjs](file:///e:/program/Hyper_Threading_Blog/astro.config.mjs#L33-L65)
- 布局骨架： [Layout.astro](file:///e:/program/Hyper_Threading_Blog/src/layouts/Layout.astro)、[MainGridLayout.astro](file:///e:/program/Hyper_Threading_Blog/src/layouts/MainGridLayout.astro)
- 侧边栏组件： [LeftSideBar.astro](file:///e:/program/Hyper_Threading_Blog/src/components/layout/LeftSideBar.astro)、[SideBar.astro](file:///e:/program/Hyper_Threading_Blog/src/components/layout/SideBar.astro)

### 内容与推荐逻辑

- 内容集合定义： [content.config.ts](file:///e:/program/Hyper_Threading_Blog/src/content.config.ts)
- 推荐文章算法： [getRelatedPosts](file:///e:/program/Hyper_Threading_Blog/src/utils/content-utils.ts)
- Tags 组件（文章页“本文标签”逻辑）： [Tags.astro](file:///e:/program/Hyper_Threading_Blog/src/components/widget/Tags.astro)
- 推荐文章组件： [RelatedPosts.astro](file:///e:/program/Hyper_Threading_Blog/src/components/widget/RelatedPosts.astro)

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

## 🚚 部署（GitHub Pages）

- 本仓库默认使用 Actions 构建后推送到 `pages` 分支： [.github/workflows/deploy.yml](file:///e:/program/Hyper_Threading_Blog/.github/workflows/deploy.yml)
- 如果你修改了默认分支名（如 `main/master`），需要同步调整 workflows 里的触发分支。

## ⚡ 性能建议（与本仓库配置匹配）

- 首屏横幅/壁纸优先使用 `.webp`（放在 `public/assets/images/`）
- 若不需要前台切换壁纸模式，可在 `siteConfig.ts` 中将 `backgroundWallpaper.switchable` 设为 `false`（减少渲染与脚本分支）
- 第三方统计脚本建议延迟加载，避免影响首屏指标

## 🙏 致谢

- 主题模板：Firefly（基于 Fuwari 二次开发）
- Astro / Tailwind CSS / Swup / Pagefind 等开源项目

