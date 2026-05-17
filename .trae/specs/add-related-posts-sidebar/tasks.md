# Tasks

- [x] Task 1: 扩展侧边栏配置与类型，使左侧边栏支持推荐文章组件。
  - [x] SubTask 1.1: 为侧边栏组件类型新增推荐文章组件标识。
  - [x] SubTask 1.2: 在侧边栏配置中将推荐文章组件放在标签栏下方。
  - [x] SubTask 1.3: 保持非文章页不渲染该组件。

- [x] Task 2: 实现推荐文章数据获取与排序逻辑。
  - [x] SubTask 2.1: 基于当前文章构建候选文章集合，排除当前文章与草稿。
  - [x] SubTask 2.2: 实现基于共同标签、同分类、发布时间的排序规则。
  - [x] SubTask 2.3: 控制返回数量为 3-5 篇，默认最多 5 篇。

- [x] Task 3: 实现推荐文章侧边栏组件并接入文章页。
  - [x] SubTask 3.1: 新增推荐文章小组件，展示标题与必要元信息。
  - [x] SubTask 3.2: 从文章详情页将当前文章数据透传到左侧边栏。
  - [x] SubTask 3.3: 在文章页标签栏下方渲染推荐文章列表。

- [x] Task 4: 验证推荐栏展示与排序符合预期。
  - [x] SubTask 4.1: 检查文章页显示位置是否正确。
  - [x] SubTask 4.2: 检查非文章页是否不显示。
  - [x] SubTask 4.3: 检查推荐顺序、数量限制与排除规则是否正确。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1] and [Task 2]
- [Task 4] depends on [Task 3]
