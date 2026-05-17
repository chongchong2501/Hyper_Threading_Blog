# 文章页侧边栏推荐文章 Spec

## Why
当前文章详情页左侧已有“本文标签”，但缺少进一步引导用户继续阅读的入口。增加一个推荐栏可以在不大幅改动布局的前提下，提升相关文章的曝光和站内停留时间。

## What Changes
- 在文章详情页左侧 `tag` 栏下方新增“推荐文章”组件。
- 组件展示 `3-5` 篇推荐文章，默认目标数量为 `5`，不足时按实际数量展示。
- 推荐结果按与当前文章的关联性排序，关联性最高的文章优先展示。
- 关联性计算优先使用共同标签，其次使用同分类和发布时间等简单信号进行补充排序。
- 非文章详情页不显示该推荐栏。

## Impact
- Affected specs: 文章详情页侧边栏、推荐文章排序逻辑
- Affected code: `src/config/sidebarConfig.ts`, `src/components/layout/LeftSideBar.astro`, `src/components/widget/*`, `src/pages/posts/[...slug].astro`, `src/utils/content-utils.ts`, `src/types/config.ts`

## ADDED Requirements
### Requirement: 文章页侧边栏推荐栏
系统 SHALL 在文章详情页左侧标签栏下方展示推荐文章组件。

#### Scenario: 文章页显示推荐栏
- **WHEN** 用户进入一篇文章详情页
- **THEN** 左侧侧边栏在“本文标签”下方显示“推荐文章”组件
- **AND** 组件最多展示 5 篇文章

#### Scenario: 非文章页不显示推荐栏
- **WHEN** 用户进入首页、归档页或其他非文章详情页
- **THEN** 不显示“推荐文章”组件

### Requirement: 推荐结果排序
系统 SHALL 根据当前文章与候选文章的关联性对推荐结果进行排序。

#### Scenario: 按关联性优先展示
- **WHEN** 当前文章存在多个可推荐候选
- **THEN** 共同标签更多的文章排在更前面
- **AND** 在共同标签数相同的情况下，同分类文章优先
- **AND** 在前述条件仍相同的情况下，较新的文章优先

#### Scenario: 排除当前文章与草稿
- **WHEN** 系统生成推荐列表
- **THEN** 当前文章自身不得出现在列表中
- **AND** 草稿文章不得出现在列表中

### Requirement: 推荐数量回退
系统 SHALL 在候选文章不足时优雅降级。

#### Scenario: 候选不足 5 篇
- **WHEN** 可推荐文章少于 5 篇
- **THEN** 组件展示全部可推荐文章
- **AND** 不补充空白占位

## MODIFIED Requirements
### Requirement: 文章详情页左侧信息流
文章详情页左侧侧边栏在保留“本文标签”的基础上，新增一个位于其下方的“推荐文章”组件，形成“标签 + 推荐阅读”的组合信息区。

## REMOVED Requirements
- 无
