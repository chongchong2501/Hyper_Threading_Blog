# Hyper Threading Blog

> 个人技术博客，记录学习与生活。

<div align="center">

![Node.js >= 22](https://img.shields.io/badge/node.js-%3E%3D22-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro](https://img.shields.io/badge/Astro-6.x-orange)

[在线访问](https://hyperthreading.cn/) · [GitHub](https://github.com/chongchong2501/Hyper-Threading-Blog)

</div>

## 简介

基于 [Firefly](https://github.com/CuteLeaf/Firefly) 主题构建的个人博客，使用 Astro + TypeScript + Tailwind CSS 技术栈。

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/chongchong2501/Hyper-Threading-Blog.git
cd Hyper-Threading-Blog

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 `http://localhost:4321`

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览构建结果 |
| `pnpm check` | 代码质量检查 |
| `pnpm format` | 格式化代码 |
| `pnpm lint` | 检查并自动修复 |

## 配置

站点配置位于 `src/config/`：

- `siteConfig.ts` - 站点基础设置
- `profileConfig.ts` - 个人资料
- `navBarConfig.ts` - 导航栏
- `commentConfig.ts` - 评论系统
- `musicConfig.ts` - 音乐播放器

## 部署

构建命令：

```bash
pnpm build
```

将 `dist/` 目录部署到任意静态托管平台：

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

## 致谢

- 主题：[CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)
- 原始模板：[saicaca/fuwari](https://github.com/saicaca/fuwari)
- 构建工具：[Astro](https://astro.build/)

## 许可

MIT License
