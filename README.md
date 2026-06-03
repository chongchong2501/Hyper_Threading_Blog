# Hyper Threading / Firefly

> 一个基于 Astro 的高可配置个人博客主题，适合搭建内容型站点、技术博客和个人主页。

<div align="center">

![Node.js >= 22](https://img.shields.io/badge/node.js-%3E%3D22-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro](https://img.shields.io/badge/Astro-6.4.2-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![License](https://img.shields.io/github/license/CuteLeaf/Firefly)

[在线预览](https://firefly.cuteleaf.cn/) · [使用文档](https://docs-firefly.cuteleaf.cn/) · [我的博客](https://blog.cuteleaf.cn) · [GitHub](https://github.com/chongchong2501/Hyper-Threading-Blog)

</div>

## 简介

Firefly 是一个基于 Astro 和 Fuwari 二次开发的博客主题模板，强调易配置、易扩展和较好的阅读体验。它保留了原版主题的结构，同时加入了更多适合个人博客的布局和组件。

如果你喜欢更清爽的首页、更灵活的壁纸切换、文章列表布局和丰富的侧边栏组件，这套主题会比较适合你。

## 特性

- Astro + Tailwind CSS + TypeScript 技术栈
- 响应式布局，兼容桌面端和移动端
- i18n 多语言支持
- 页面过渡动画和较完整的站点交互体验
- 全文搜索、文章目录、相关文章、随机文章
- 壁纸模式、导航栏样式、主题色、字体等均可配置
- 评论、音乐、友链、相册、赞助等模块可按需开启
- 支持文章封面、海报分享、代码高亮、Admonitions 等扩展能力

## 当前默认配置

当前仓库里的示例配置已经按你的站点做过一轮调整：

- 评论系统：`Twikoo`
- 音乐播放器：`local`
- 头像：`src/assets/images/hyper.jpg`
- Logo：`/assets/images/logo.jpg`
- 赞助页：已关闭
- 导航栏：已切换到你的 GitHub 和 B 站链接

这些都可以继续在 `src/config/` 下按需修改。

## 快速开始

### 环境要求

- Node.js 22 或更高
- pnpm 9 或更高

### 安装与运行

```bash
git clone https://github.com/chongchong2501/Hyper-Threading-Blog.git
cd Hyper-Threading-Blog
pnpm install
pnpm dev
```

打开 `http://localhost:4321` 就能看到站点。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 本地预览构建结果 |
| `pnpm check` | 执行 Astro 代码质量检查 |
| `pnpm format` | 使用 Biome 格式化源码 |
| `pnpm lint` | 使用 Biome 进行检查并自动修复 |
| `pnpm new-post <filename>` | 新建文章 |
| `pnpm astro ...` | 运行 Astro CLI 命令 |

## 配置入口

主要配置都放在 `src/config/` 目录下：

- `siteConfig.ts`：站点标题、Logo、页面开关、基础设置
- `backgroundWallpaper.ts`：壁纸模式与背景图
- `profileConfig.ts`：头像、昵称、简介与个人链接
- `commentConfig.ts`：评论系统配置
- `musicConfig.ts`：音乐播放器配置
- `navBarConfig.ts`：导航栏链接
- `sponsorConfig.ts`：赞助页配置

如果你主要想改外观和个人信息，优先看这几份配置文件就够了。

## 目录结构

```text
src/
├── assets/        # 源码内静态资源
├── components/    # 页面组件
├── config/        # 站点配置
├── content/       # 文章与内容数据
├── layouts/       # 布局模板
├── pages/         # 路由页面
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 部署

项目可以部署到常见的静态托管平台，例如：

- Vercel
- Netlify
- Cloudflare Pages
- EdgeOne Pages

如果你用自己的服务器，也可以先执行 `pnpm build`，再把 `dist/` 目录部署出去。

## 贡献与致谢

- 感谢 [saicaca/fuwari](https://github.com/saicaca/fuwari) 提供的原始模板
- 感谢所有参与该项目维护和改进的贡献者
- 如果你参考了本项目中某些布局或组件设计，欢迎注明来源

## 许可

本项目采用 MIT License。

更多细节请查看 [LICENSE](./LICENSE) 文件。
