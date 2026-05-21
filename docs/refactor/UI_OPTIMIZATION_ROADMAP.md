# UI 优化路线图

## 1. 目标

这份文档用于盘点当前前端项目中适合优先优化的页面和通用组件，并给出一套可执行的 UI 重构顺序。

目标不是一次性全部重做，而是：

- 先统一体验最割裂、曝光最高的页面
- 再收口通用容器、弹窗、搜索栏、按钮这些基础组件
- 最后推动后台列表页和配置页形成统一设计语言

## 1.1 进度记录

下面这部分用于持续记录 UI 重构推进情况，建议每完成一项就更新一次。

### 已完成

- [x] 普通用户评分列表页改造成卡片数据型工作台
- [x] 普通用户项目打分页改造成任务流卡片列表
- [x] 评分页核心卡片容器尽量收口到 `BaseCard`
- [x] 完成项目级 UI 盘点文档初版
- [x] 完成第一轮通用壳层升级：
  - [x] `PagePanel.vue`
  - [x] `BaseModal.vue`
  - [x] `BaseFormModal.vue`
  - [x] `BaseDialogModal.vue`
  - [x] `SearchInput.vue`
  - [x] `MyBtn.vue`
- [x] 建立“二级大弹窗使用 Teleport”的稳定规则，并落地到高风险选择器弹窗
- [x] 收口卡片体系的第一轮升级：统一 `BaseCard` 与 `StatCard` 的结构和视觉变量
- [x] 推进页面级统一模板第一步：`PagePanel` 增加明确的 toolbar 区域
- [x] 用户管理页切换到统一的 `PagePanel` toolbar + table 结构
- [x] 项目管理页切换到统一的 `PagePanel` toolbar + table 结构
- [x] 项目小组管理页切换到统一的 `PagePanel` toolbar + table 结构
- [x] 评审组管理页切换到统一的 `PagePanel` toolbar + table 结构
- [x] 评分标准管理页切换到统一的 `PagePanel` toolbar + table 结构
- [x] 评分详情弹窗完成第一轮视觉收口
- [x] 项目详情和项目小组详情弹窗完成第一轮视觉收口
- [x] `SearchInput` 切换到统一按钮组件并补齐工具栏分层
- [x] 项目小组选择弹窗完成第一轮视觉收口
- [x] 评审成员选择弹窗完成第一轮视觉收口
- [x] 评分模块业务弹窗统一基础头部与任务上下文块
- [x] 重构登录页 `public/login`，统一首页设计语言与样式
- [x] 统一首页 `normal/home` 与新版评分页的设计语言
- [x] 在线用户页 `super-admin/monitor/online` 切换到统一的 `PagePanel` 监控列表模板
- [x] 服务器监控页 `super-admin/monitor/server` 切换到统一的 `PagePanel` 监控仪表板模板
 - [x] 项目打分统计页 `src/pages/admin/project/statistic/index.vue` 迁移到统一的 `PagePanel` 模板（已完成：2026-05-21）
- [x] 评分模块业务弹窗第二轮样式统一（2026-05-20）：
  - [x] ScoringForm.vue 指标卡片化、间距优化
  - [x] BaseFormModal.vue 和 BaseDialogModal.vue 操作区域改进
  - [x] ScoreProject.vue 任务上下文面板视觉加强
  - [x] ScoringDetails.vue 打分详情显示优化
  - [x] ScoringIndicatorRow.vue 指标行样式加强
  - [x] ScoringModalHeader.vue 头部层级加强

### 进行中

- [ ] 继续把后台列表页迁移到统一的 `PagePanel` 页面模板结构（进行中：优先页面：`src/pages/admin/project/statistic/index.vue` - 项目打分统计）
- [x] 继续统一评分模块里的业务弹窗样式 (已完成：2026-05-20)
- [ ] 继续统一超级管理员监控页与在线用户页的页面模板和信息层级

### TODO

#### P1

- [ ] 统一后台列表页模板：
  - [ ] 项目管理
  - [ ] 用户管理
  - [ ] 项目小组管理
  - [ ] 评审组管理
  - [ ] 评分标准管理
- [ ] 统一后台复杂配置页模板：
  - [x] 项目编辑页
  - [ ] 评分标准编辑弹窗
  - [x] 评审组创建/编辑页
- [ ] 统一选择器型大弹窗：
  - [ ] 项目小组选择弹窗
  - [ ] 评审成员选择弹窗
  - [ ] 用户选择类弹窗

#### P2

- [ ] 优化项目统计页与统计详情页
- [ ] 优化超级管理员监控页与在线用户页
- [ ] 优化 403 / 404 / about 等公共页面

### 建议记录规则

- 新开任务放到 `TODO`
- 开始做时移到 `进行中`
- 合并完成后移到 `已完成`
- 如果后面要继续拆分，可以在每个页面后面补日期和负责人

### Modal 使用规则

这条规则用于避免“大弹窗显示不居中、相对内容区偏移、被页面容器影响”这类问题。

#### 规则一：页面级主弹窗

适用场景：

- 页面通过 `PagePanel` 的 `#modals` 插槽直接挂出的一级弹窗
- 普通详情弹窗、普通表单弹窗、确认弹窗

建议：

- 可以继续直接使用 `BaseModal / BaseDialogModal / BaseFormModal`
- 不强制要求 `Teleport`

#### 规则二：表单内部再打开的大选择器弹窗

适用场景：

- 一个页面里先打开表单，再从表单里打开第二层大弹窗
- 弹窗内容包含表格、分页、批量操作、搜索工具栏
- 弹窗宽度通常大于 `60%` 或者高度较高

典型例子：

- `ReviewerMemberSelectionModal.vue`
- `ProjectGroupSelectionModal.vue`

要求：

- 必须使用 `Teleport to="body"`

原因：

- 这类弹窗如果作为表单子节点渲染，容易受到 `PagePanel`、卡片容器、模糊背景、transform、overflow` 等祖先样式影响
- 最常见表现就是“视觉中心不在整个视口正中，而偏向内容区”

#### 规则三：如果是可复用的大表格选择器

建议：

- 默认按“需要 Teleport”的组件来实现
- 除非它明确只会作为页面级一级弹窗使用

## 2. 本次盘点范围

本次主要基于以下目录和组件进行评估：

- 页面目录：`src/pages/admin`、`src/pages/normal`、`src/pages/public`、`src/pages/super-admin`
- 页面容器：`src/layouts/PagePanel.vue`
- 通用数据组件：
  - `src/components/common/data/BaseCard.vue`
  - `src/components/common/data/StatCard.vue`
  - `src/components/common/data/SearchInput.vue`
- 通用弹窗组件：
  - `src/components/common/modal/BaseModal.vue`
  - `src/components/common/modal/BaseDialogModal.vue`
  - `src/components/common/modal/BaseFormModal.vue`
  - `src/components/common/modal/BaseConfirmModal.vue`
- 典型业务弹窗：
  - `src/components/business/project/project-detail/index.vue`
  - `src/pages/admin/user/components/UserFormModal.vue`
  - `src/pages/admin/project/components/ProjectGroupSelectionModal.vue`

## 3. 当前共性问题

### 3.1 页面层

- 后台大部分列表页都沿用同一套“4 个统计卡 + 搜索条 + 表格 + 分页”结构，但视觉没有被系统化，主要靠页面内联样式拼出来。
- 多个页面统计卡写法重复，卡片尺寸、间距、图标风格不完全一致。
- 搜索区和筛选区布局不统一，有的用 `SearchInput`，有的直接写 `el-input` / `el-select`，页面之间切换时感受割裂。
- 一些复杂页已经开始形成较强视觉方向，例如首页、评分页、监控页，但后台 CRUD 页还明显偏旧。
- 页面里存在较多内联样式，后续要统一设计时成本高。

### 3.2 组件层

- `PagePanel.vue` 已经是后台页的事实标准容器，但能力还比较基础，缺少“页面标题区 / 工具栏区 / 卡片区 / 密度模式”等上层约束。
- `SearchInput.vue` 视觉偏早期，按钮和输入框阴影风格较重，且和现在新做的卡片化页面不完全一致。
- `BaseModal.vue`、`BaseDialogModal.vue`、`BaseFormModal.vue` 已承担项目大部分弹窗，但排版和交互还偏原始。
- 弹窗底部操作按钮目前大量依赖 `:deep(.operation button)` 注入样式，可维护性一般。
- 业务弹窗宽高策略不统一，很多页面通过 `width="78%"`、`min-height="72%"` 这种方式单独调。

### 3.3 代码结构信号

- 项目中存在较多内联样式，例如统计卡 margin、表格宽度、输入宽度、按钮间距等。
- `BaseCard.vue` 与 `BaseDialogModal.vue` 内使用了 `<body>` 标签作为内部容器，这不是推荐写法，建议替换为普通 `div` 或语义类名容器。
- 一些页面已经使用 `BaseCard`，但大多数后台列表页仍主要依赖 `PagePanel + el-table`，缺少真正的卡片层级。

## 4. 页面优化优先级

下面按“用户曝光频率 + 业务价值 + 当前割裂程度 + 带动效应”排序。

### P0：第一优先级，先做最值得的页面

#### 1. 普通用户评分模块

涉及页面：

- `src/pages/normal/scoring/list/index.vue`
- `src/pages/normal/scoring/groups/index.vue`

原因：

- 这是打分系统的核心任务流，业务价值最高。
- 评分列表和打分页已经开始往卡片工作台方向演进，适合作为后续全站视觉母板。
- 一旦这里风格稳定，可以反向指导后台项目管理、统计页和弹窗系统。

建议方向：

- 固化“任务工作台”风格
- 收口卡片间距、色板、状态标签、进度条样式
- 将评分弹窗 `ScoreProject`、`ScoringDetails` 继续接入统一 modal 视觉

#### 2. 登录页

涉及页面：

- `src/pages/public/login/LoginPage.vue`
- `src/pages/public/login/components/loginForm.vue`
- `src/pages/public/login/components/slideBlock.vue`
- `src/pages/public/login/components/rememberMeCheckbox.vue`

原因：

- 是整个系统的第一印象页面。
- 已经有主题切换、记住我、滑块验证，说明交互丰富，但整体品牌感还可以再提升。
- 如果登录页风格和内部页面脱节，系统整体感会被拉低。

建议方向：

- 做成更完整的品牌入口页
- 登录卡、滑块验证弹窗、记住我历史记录统一视觉语言
- 统一亮暗主题下的弹窗、输入框、按钮状态

#### 3. 首页仪表盘

涉及页面：

- `src/pages/normal/home/HomePage.vue`
- `src/pages/normal/home/components/*`

原因：

- 访问频率高，能代表系统“现代感”。
- 当前首页方向是对的，但和后台页、评分页之间仍缺少统一规则。
- 首页里的卡片、趋势、任务、快捷入口可以反哺为通用信息卡模板。

建议方向：

- 把首页沉淀成“轻工作台”基线
- 统一 `StatCard`、`BaseCard`、二级信息块的风格
- 提炼出“hero + stats + dashboard panels”的标准布局范式

### P1：第二优先级，后台高频 CRUD 页统一升级

#### 4. 项目管理

涉及页面：

- `src/pages/admin/project/list/index.vue`
- `src/pages/admin/project/edit/index.vue`
- `src/pages/admin/project/components/*`

原因：

- 管理端核心入口，使用频率高。
- 既有列表，也有配置编辑和多种选择弹窗，适合做后台标准页模板。
- 项目编辑页是典型“多 tab 配置页”，非常值得统一。

建议方向：

- 项目列表页升级为“管理工作台 + 表格”
- 项目编辑页升级为“步骤感/配置中心式布局”
- 抽象出适用于复杂配置页的头部、tab、操作区规范

#### 5. 用户管理

涉及页面：

- `src/pages/admin/user/index.vue`
- `src/pages/admin/user/components/UserFormModal.vue`
- `src/pages/admin/user/components/UserMultiAddForm.vue`

原因：

- 批量操作、角色筛选、启禁用等都已经较完整，是典型高频后台管理页。
- 目前功能强于视觉，优化后会很明显提升管理端质感。

建议方向：

- 搜索筛选区收敛为统一 toolbar
- 批量操作区做成更清晰的 secondary action bar
- 新增/编辑/批量导入弹窗做成统一的 form modal 模式

#### 6. 小组与评审组管理

涉及页面：

- `src/pages/admin/project-group/index.vue`
- `src/pages/admin/reviewer-group/ReviewerGroupList.vue`
- `src/pages/admin/reviewer-group/upsert/index.vue`

原因：

- 页面结构高度相似，最适合成组优化。
- 一次抽象可以同时提升多个页面。

建议方向：

- 统一统计卡布局
- 统一列表页 toolbar、表格、操作列
- 把“详情弹窗 / 操作弹窗 / upsert 页面”拉齐成同一套样式

#### 7. 评分标准管理

涉及页面：

- `src/pages/admin/scoring-std/index.vue`
- `src/pages/admin/scoring-std/components/ScoringStdOperation.vue`
- `src/pages/admin/scoring-std/components/ScoringStdForm.vue`

原因：

- 属于配置型页面，内容密度高。
- 指标标签、规则项、动态表单很适合做成更强的信息组织。

建议方向：

- 列表页做成“标准卡预览 + 表格切换”或“增强型表格”
- 编辑弹窗做成更强的分组式表单
- 提供指标块、分类块、启用状态的可视化层级

### P2：第三优先级，强化专业模块与系统页

#### 8. 项目统计与统计详情

涉及页面：

- `src/pages/admin/project/statistic/index.vue`
- `src/pages/admin/project/statistic/detail/index.vue`
- `src/pages/admin/project/statistic/detail/components/*`

原因：

- 信息价值高，但偏分析型，设计难度也更高。
- 当前已经有卡片和指标组件，但整体还没完全形成统一分析页规范。

建议方向：

- 形成“分析首页 + 项目详情 + 组详情弹窗”的分析产品语言
- 加强筛选、摘要、导出区的层级
- 将组卡、指标卡和弹窗信息整合为更清晰的数据讲述结构

#### 9. 超级管理员监控页

涉及页面：

- `src/pages/super-admin/monitor/server/index.vue`
- `src/pages/super-admin/monitor/online/index.vue`
- `src/pages/super-admin/monitor/logs-info/*`

原因：

- 监控页本身已经比多数后台页更现代。
- 但 server、online、logs 三者仍可再统一。

建议方向：

- 保留当前偏专业的监控视觉
- 统一 page hero、过滤区、列表区和详情弹窗
- 日志、在线会话、服务摘要形成同一监控设计系统

#### 10. 公共说明页 / 异常页

涉及页面：

- `src/pages/public/about/index.vue`
- `src/pages/public/403/ForbiddenPage.vue`
- `src/pages/public/404/NotFound.vue`

原因：

- 曝光不高，但属于品牌边角页。
- 可放在主流程完成后统一补齐。

建议方向：

- 统一品牌色、插画/图形语言、按钮和返回路径

## 5. 最值得优先优化的通用组件

### A. `PagePanel.vue`

优先级：`P0`

为什么先做：

- 后台页面几乎都在用它。
- 只要它升级，项目管理、用户管理、评分标准、小组管理都会直接受益。

建议升级方向：

- 增加页面标题区、说明区、工具栏区插槽
- 增加密度模式：`comfortable / compact`
- 增加 `header` 区自动换行与响应式策略
- 支持“卡片列表页”和“表格页”两种主模式
- 统一主内容白卡容器、内边距和底部分页间距

### B. `BaseModal.vue` 及其衍生组件

优先级：`P0`

涉及：

- `BaseModal.vue`
- `BaseDialogModal.vue`
- `BaseFormModal.vue`
- `BaseConfirmModal.vue`

当前问题：

- 遮罩、圆角、阴影、标题区、按钮区还比较基础。
- 操作按钮样式主要靠 `:deep(.operation button)` 注入，不够组件化。
- 宽高控制方式偏散。
- `BaseDialogModal.vue` 的 body 区只有基础滚动，没有更明确的 header/body/footer 结构约束。

建议升级方向：

- 统一 modal 结构：`header / content / footer`
- 支持尺寸枚举：`sm / md / lg / xl / fullscreen`
- 支持标题、副标题、说明文本、状态色
- 统一关闭按钮、遮罩透明度、进入动画和滚动阴影
- 底部操作按钮直接支持变体，而不是依赖外部 class
- 大选择器类弹窗支持固定头部和固定底部

### C. `BaseCard.vue`

优先级：`P1`

当前问题：

- 已经很好用，但能力仍偏基础。
- 需要更多变体来承接业务卡片，而不是每页再写一层皮。

建议升级方向：

- 增加 `variant`：`default / soft / outline / highlight`
- 增加 `padding`、`radius`、`interactive`、`bordered`
- 规范 header/body/footer 的间距
- 删除内部 `<body>` 标签，改为普通容器

### D. `SearchInput.vue`

优先级：`P1`

当前问题：

- 输入框、搜索按钮、添加按钮风格较旧。
- 阴影和 focus 态偏重，与当前新页面的轻卡片风格不一致。
- 工具栏能力不足，很多页面只把它当作“输入框 + 两个按钮”，导致复杂筛选还是自己写。

建议升级方向：

- 改造成 `ToolbarSearch` 风格
- 输入框更轻、更平、更现代
- 增加左 icon、右清空、筛选插槽的布局规范
- 支持 `compact / default` 两种高度
- 添加按钮建议支持插槽图标和语义文案

### E. `MyBtn.vue`

优先级：`P1`

当前问题：

- `default / primary / danger / link / pro` 风格跨度较大，不够系统。
- `pro` 风格和多数后台页面不在同一体系。

建议升级方向：

- 收敛为更明确的按钮体系：
  - `primary`
  - `secondary`
  - `tertiary`
  - `danger`
  - `link`
- 统一圆角、字号、hover、focus、loading
- 给 modal footer、toolbar action、inline action 明确尺寸规范

## 6. 推荐实施顺序

### 第一阶段：先做基础壳层

1. 优化 `PagePanel.vue`
2. 优化 `BaseModal.vue` 系列
3. 优化 `BaseCard.vue`
4. 优化 `SearchInput.vue`
5. 优化 `MyBtn.vue`

目标：

- 先把“容器、弹窗、卡片、搜索、按钮”统一
- 后续页面改造时能直接复用

### 第二阶段：重构核心体验页

1. `normal/scoring`
2. `public/login`
3. `normal/home`

目标：

- 先统一用户侧核心路径
- 形成整站新视觉样板

### 第三阶段：批量推进后台管理页

1. `admin/project`
2. `admin/user`
3. `admin/project-group`
4. `admin/reviewer-group`
5. `admin/scoring-std`

目标：

- 复用第二阶段沉淀的页面语言
- 把后台列表页和表单页统一到一个成熟模式

### 第四阶段：增强专业分析与监控

1. `admin/project/statistic`
2. `super-admin/monitor/*`
3. 公共说明页和异常页

目标：

- 完善高复杂度模块
- 做出整站一致但有专业分区特征的系统感

## 7. 页面级改造策略建议

### 后台列表页统一模板

适用页面：

- 用户管理
- 项目管理
- 项目小组管理
- 评审组管理
- 评分标准管理

推荐结构：

- 页面标题区
- 统计卡区
- 工具栏区
- 表格主区
- 分页区
- 弹窗区

统一规则：

- 顶部统计卡 2 到 4 个，使用统一尺寸
- 工具栏左侧搜索，右侧筛选/批量操作
- 表格卡片外层统一圆角与边距
- 操作列只保留主动作 + 次动作，避免按钮堆积

### 配置页统一模板

适用页面：

- 项目编辑
- 评分标准编辑
- 评审组 upsert

推荐结构：

- 返回区 + 页面说明
- 主配置卡
- tab / step 区
- 底部固定操作区

统一规则：

- 表单按信息组分段
- 复杂选择器弹窗走大尺寸 modal
- 保存/取消操作区位置固定

### 选择器类大弹窗模板

适用页面：

- `ProjectGroupSelectionModal.vue`
- `ReviewerMemberSelectionModal.vue`
- 用户选择类弹窗

推荐结构：

- 标题 + 说明
- 搜索和批量操作区
- 已选预览区
- 表格区
- 固定底部确认区

统一规则：

- 大弹窗优先固定 footer
- 已选标签区使用统一 tag 样式
- 搜索和批量动作做成一体式 toolbar

## 8. 具体建议清单

### 可以立即做的低风险优化

- 清理各页面统计卡上的重复内联样式
- 将列表页操作列标题、表格宽度、按钮间距改为 class 控制
- 替换 `BaseCard.vue`、`BaseDialogModal.vue` 内部的 `<body>` 标签
- 给 `PagePanel.vue` 加上标准 title / toolbar 插槽
- 给 `BaseModal.vue` 增加统一的头部和底部间距

### 值得做成规范的内容

- 页面标题文案风格规范
- 状态色规范
- 统计卡图标规范
- 弹窗尺寸规范
- 按钮层级规范
- 搜索工具栏规范

## 9. 推荐产出物

如果按这份路线图继续推进，建议后续补齐以下文档或资产：

- `UI tokens` 文档：颜色、圆角、阴影、间距、字体
- `Page templates` 文档：列表页、配置页、工作台页、分析页
- `Modal spec` 文档：普通弹窗、表单弹窗、确认弹窗、大选择器弹窗
- `Component usage` 文档：`PagePanel`、`BaseCard`、`SearchInput`、`MyBtn`

## 10. 结论

从投入产出比看，最推荐的路线不是“按页面一个个修”，而是：

1. 先升级 `PagePanel + BaseModal + BaseCard + SearchInput + MyBtn`
2. 再优先完成 `评分模块 + 登录页 + 首页`
3. 然后批量统一后台 CRUD 页

这样能用最少的重复劳动，把这个项目从“功能完成型后台”推进到“有统一视觉语言的产品化系统”。
