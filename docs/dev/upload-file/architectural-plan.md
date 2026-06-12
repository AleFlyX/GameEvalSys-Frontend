# 作业提交 + AI 辅助评分 — 细化实施方案

> 基于 spec 及项目现有架构的分析，本文件细化所有实现环节。
> **核心定位变化**：作业提交不是简单的"提交→审核"审批流，而是 **"提交→评分"打分流**。
> 后期将接入 AI Agent 根据教师上传的打分标准（Rubric）对提交的代码自动评分。

> 进度对齐（2026-06-12）
> - 第一阶段前端闭环已落地：项目编辑页作业配置、学生按项目提交、学生端结果回显、正式路由与首页 normal 入口。
> - 本阶段仅完成占位入口：`GradingStandardManager.vue`、`admin-submission`、`scoring-submission`。
> - 后端数据层、BFF 上传网关、动态菜单节点、教师评分台、管理员作业管理页仍待后续阶段实现。

---

## 1. 数据模型与后端 API

### 1.1 项目表扩展字段

> 在现有 `project` 表上增加作业提交相关字段

| 字段名                    | 类型           | 默认值           | 说明                                                 |
| ------------------------- | -------------- | ---------------- | ---------------------------------------------------- |
| `allow_submission`        | `boolean`      | `false`          | 是否开启该项目的作业提交功能                         |
| `submission_start_date`   | `datetime`     | `null`           | 提交开始时间（可选，默认跟随项目开始时间）           |
| `submission_end_date`     | `datetime`     | `null`           | 提交截止时间（可选，默认跟随项目结束时间）           |
| `submission_file_types`   | `varchar(255)` | `'zip,rar,7z'`   | 允许提交的项目文件类型                               |
| `submission_ppt_types`    | `varchar(255)` | `'ppt,pptx,pdf'` | 允许提交的 PPT 文件类型                              |
| `submission_max_size`     | `bigint`       | `524288000`      | 项目文件最大字节数（默认 500MB）                     |
| `submission_ppt_max_size` | `bigint`       | `104857600`      | PPT 最大字节数（默认 100MB）                         |
| `submission_required`     | `boolean`      | `false`          | 提交是否为必填（设为 true 时，该项目的学生必须提交） |
| `enable_ai_scoring`       | `boolean`      | `false`          | 是否启用 AI 自动评分                                 |
| `enable_resubmit`         | `boolean`      | `true`           | 截止前是否允许学生覆盖重新提交                       |

### 1.2 评分标准表 `submission_grading_standard`

> **新增**。教师为项目上传的评分标准（Rubric），供 AI Agent 和教师评分的依据。

| 字段名               | 类型           | 说明                                                       |
| -------------------- | -------------- | ---------------------------------------------------------- |
| `id`                 | `bigint PK`    | 主键                                                       |
| `project_id`         | `bigint FK`    | 关联项目 ID                                                |
| `title`              | `varchar(200)` | 评分标准标题，如"C++ 游戏作品评分标准 v1"                  |
| `description`        | `text`         | 评分标准说明文字（可选）                                   |
| `file_path`          | `varchar(500)` | 评分标准文件路径（PDF/DOCX/MD，教师上传的原始文件）        |
| `file_hash`          | `varchar(128)` | 文件哈希                                                   |
| `file_original_name` | `varchar(255)` | 原始文件名                                                 |
| `dimensions`         | `json`         | **结构化评分维度**（前端可视化编辑，见下方 JSON 结构详解） |
| `is_active`          | `boolean`      | 是否为当前生效的评分标准                                   |
| `version`            | `int`          | 版本号（支持迭代更新）                                     |
| `created_by`         | `bigint FK`    | 创建人 ID（教师/管理员）                                   |
| `created_at`         | `datetime`     | 创建时间                                                   |
| `updated_at`         | `datetime`     | 更新时间                                                   |

**`dimensions` JSON 结构**（前端可视化配置 + AI 解析用）：

```json
[
  {
    "id": "code_quality",
    "name": "代码质量",
    "description": "代码结构、命名规范、注释、可读性",
    "maxScore": 30,
    "weight": 0.3,
    "aiPrompt": "检查代码是否遵循 C++ 最佳实践：命名规范、模块化、注释充分、无重复代码"
  },
  {
    "id": "functionality",
    "name": "功能完整性",
    "description": "游戏核心功能是否完整实现",
    "maxScore": 35,
    "weight": 0.35,
    "aiPrompt": "评估游戏是否包含所有核心玩法功能，边界情况处理是否完善"
  },
  {
    "id": "innovation",
    "name": "创新性",
    "description": "玩法、实现方式是否有创新",
    "maxScore": 15,
    "weight": 0.15,
    "aiPrompt": "分析项目的创新点：独特的游戏机制、优秀的技术方案或创意设计"
  },
  {
    "id": "presentation",
    "name": "答辩表现",
    "description": "PPT 质量、答辩逻辑",
    "maxScore": 20,
    "weight": 0.2,
    "aiPrompt": "评估 PPT 结构清晰度、逻辑完整性、技术表达准确度"
  }
]
```

> ⚡ 设计说明：`dimensions` 中的 `aiPrompt` 字段是给 AI Agent 的指令提示词，不要展示在学生端。

### 1.3 提交记录表 `submission_record`

> **新增**。存储每次提交。状态改为评分工作流，而非审批流。

| 字段名                | 类型                                            | 说明                                                                              |
| --------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------- |
| `id`                  | `bigint PK`                                     | 主键                                                                              |
| `project_id`          | `bigint FK`                                     | 关联的项目 ID（不可为空）                                                         |
| `user_id`             | `bigint FK`                                     | 提交人 ID                                                                         |
| `project_name`        | `varchar(200)`                                  | 项目名称（冗余，方便列表展示）                                                    |
| `description`         | `text`                                          | 项目描述                                                                          |
| `file_path`           | `varchar(500)`                                  | 项目文件在 BFF/OSS 上的路径                                                       |
| `file_hash`           | `varchar(128)`                                  | 项目文件哈希                                                                      |
| `file_size`           | `bigint`                                        | 项目文件大小                                                                      |
| `file_original_name`  | `varchar(255)`                                  | 项目文件原始文件名                                                                |
| `ppt_path`            | `varchar(500)`                                  | PPT 文件路径                                                                      |
| `ppt_hash`            | `varchar(128)`                                  | PPT 文件哈希                                                                      |
| `ppt_size`            | `bigint`                                        | PPT 文件大小                                                                      |
| `ppt_original_name`   | `varchar(255)`                                  | PPT 文件原始文件名                                                                |
| `status`              | `enum('pending','scoring','scored','returned')` | `pending` 待分配评分 / `scoring` 评分中 / `scored` 已完成 / `returned` 已打回修改 |
| `grading_standard_id` | `bigint FK`                                     | 使用的评分标准 ID（可选，从项目自动关联）                                         |
| `final_score`         | `decimal(5,2)`                                  | 最终得分（教师确认后的分数）                                                      |
| `total_score`         | `decimal(5,2)`                                  | 满分（冗余，从评分标准获取）                                                      |
| `review_comment`      | `text`                                          | 教师评语                                                                          |
| `reviewer_id`         | `bigint FK`                                     | 评分人 ID（教师）                                                                 |
| `reviewed_at`         | `datetime`                                      | 评分完成时间                                                                      |
| `submit_count`        | `int`                                           | 该记录的提交次数（允许覆盖提交时递增）                                            |
| `created_at`          | `datetime`                                      | 提交时间                                                                          |
| `updated_at`          | `datetime`                                      | 更新时间                                                                          |

**唯一约束**：`(project_id, user_id)` — 同一项目每人只能有一条活跃记录（覆盖提交时更新）。

### 1.4 评分结果表 `submission_score`

> **新增**。存储每个提交的评分详情，支持 AI 评分 + 教师评分双轨。

| 字段名                | 类型                   | 说明                                          |
| --------------------- | ---------------------- | --------------------------------------------- |
| `id`                  | `bigint PK`            | 主键                                          |
| `submission_id`       | `bigint FK`            | 关联提交记录 ID                               |
| `grading_standard_id` | `bigint FK`            | 使用的评分标准 ID                             |
| `scorer_type`         | `enum('ai','teacher')` | 评分来源：AI 自动 / 教师人工                  |
| `scorer_id`           | `bigint FK`            | 评分人 ID（AI 评分时可为空或用特殊标记）      |
| `dimension_scores`    | `json`                 | 各维度得分详情（JSON）                        |
| `total_score`         | `decimal(5,2)`         | 该次评分总分                                  |
| `max_score`           | `decimal(5,2)`         | 满分                                          |
| `comment`             | `text`                 | 评分评语                                      |
| `ai_confidence`       | `decimal(3,2)`         | AI 评分置信度（0.00~1.00，人工评分时为 null） |
| `ai_reasoning`        | `text`                 | AI 评分的推理过程/依据（人工评分时为 null）   |
| `overridden_by`       | `bigint FK`            | 若教师覆盖了 AI 评分，记录覆盖人 ID           |
| `overridden_at`       | `datetime`             | 覆盖时间                                      |
| `overridden_reason`   | `varchar(500)`         | 覆盖原因                                      |
| `is_final`            | `boolean`              | 是否为最终确定的分数（`default false`）       |
| `created_at`          | `datetime`             | 评分时间                                      |

**`dimension_scores` JSON 结构**：

```json
[
  {
    "dimensionId": "code_quality",
    "dimensionName": "代码质量",
    "score": 25,
    "maxScore": 30,
    "comment": "命名规范良好，但缺少注释，部分函数过长",
    "aiEvidence": "检测到 3 个函数超过 50 行，2 个类缺少 Javadoc 风格注释"
  },
  {
    "dimensionId": "functionality",
    "dimensionName": "功能完整性",
    "score": 32,
    "maxScore": 35,
    "comment": "核心功能完整，边界情况处理良好",
    "aiEvidence": "通过了 8/10 的功能测试用例，2 个边缘用例失败"
  }
]
```

**评分流程规则**：

```
学生提交 → 触发 AI 评分（如开启）→ teacher 登录查看 AI 评分结果
         → teacher 确认/调整 → 保存最终分
         → 或 teacher 手动从头评分（AI 评分作为参考）
```

### 1.5 后端 API 清单

#### 学生端（Normal）

| 方法   | 路径                                             | 说明                                                                          |
| ------ | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| `GET`  | `/api/v1/submissions/my?projectId={id}`          | 获取当前用户对某项目的提交记录                                                |
| `POST` | `/api/v1/submissions`                            | 创建/覆盖提交（body 传文件路径等元数据，文件已由 BFF 上传完成）               |
| `GET`  | `/api/v1/submissions/my/history?page=&size=`     | 获取当前用户的所有历史提交（分页）                                            |
| `GET`  | `/api/v1/submissions/my/projects`                | 获取当前用户可提交作业的项目列表（allow_submission=true 且当前用户为 normal） |
| `GET`  | `/api/v1/submissions/my/score?submissionId={id}` | 查看自己的评分结果（仅显示最终分数，隐藏 AI 原始推理）                        |

#### 教师端（Teacher / Admin / Scorer）

> 教师/评分员角色负责评分，需要专门的评分工作台。

| 方法   | 路径                                                        | 说明                                                             |
| ------ | ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `GET`  | `/api/v1/submissions/grading-list?projectId=&status=&page=` | 获取待评分/已评分的提交列表                                      |
| `GET`  | `/api/v1/submissions/{id}`                                  | 获取提交详情（包含文件下载链接）                                 |
| `GET`  | `/api/v1/submissions/{id}/ai-score`                         | 获取 AI 对该提交的评分结果（如已生成）                           |
| `POST` | `/api/v1/submissions/{id}/score`                            | 提交教师评分（body: `{ dimensionScores, totalScore, comment }`） |
| `PUT`  | `/api/v1/submissions/{id}/score/finalize`                   | 确认最终分数（教师确认后学生端才能看到）                         |
| `POST` | `/api/v1/submissions/{id}/return`                           | 打回要求学生修改（body: `{ comment }`）                          |
| `GET`  | `/api/v1/submissions/grading-stats?projectId=`              | 评分统计（待评分数、已评分数、平均分、分数分布）                 |

#### 管理端（Admin / Super Admin）

| 方法  | 路径                                                          | 说明                                         |
| ----- | ------------------------------------------------------------- | -------------------------------------------- |
| `GET` | `/api/v1/submissions?projectId=&status=&keyword=&page=&size=` | 获取提交列表（支持按项目、状态、关键词筛选） |
| `GET` | `/api/v1/submissions/stats?projectId=`                        | 提交统计（总数、已评分、待评分、打回数）     |
| `GET` | `/api/v1/submissions/export?projectId=&status=`               | 导出提交列表 + 评分结果（CSV/Excel）         |

#### 评分标准管理

| 方法     | 路径                                       | 说明                               |
| -------- | ------------------------------------------ | ---------------------------------- |
| `GET`    | `/api/v1/grading-standards?projectId={id}` | 获取项目的评分标准列表             |
| `POST`   | `/api/v1/grading-standards`                | 创建评分标准（含 dimensions JSON） |
| `PUT`    | `/api/v1/grading-standards/{id}`           | 更新评分标准                       |
| `POST`   | `/api/v1/grading-standards/{id}/activate`  | 设为当前生效的评分标准             |
| `DELETE` | `/api/v1/grading-standards/{id}`           | 删除评分标准                       |

#### BFF → 后端回调

| 方法   | 路径                           | 说明                                                       |
| ------ | ------------------------------ | ---------------------------------------------------------- |
| `POST` | `/api/v1/submissions/callback` | BFF 文件落地后调用，携带文件元数据（BFF 内部调用，需鉴权） |

#### AI 评分触发（内部/异步）

| 方法   | 路径                                          | 说明                                                    |
| ------ | --------------------------------------------- | ------------------------------------------------------- |
| `POST` | `/api/v1/submissions/{id}/trigger-ai-scoring` | 触发 AI 评分（可提交后自动调用，或管理员手动触发）      |
| `GET`  | `/api/v1/submissions/{id}/ai-scoring-status`  | 查询 AI 评分状态（queued / processing / done / failed） |

> AI 评分设计为异步流程：提交完成后 → 后端发送消息到队列 → AI Agent 消费 → 回调写入 `submission_score`。

---

## 2. 前端组件与页面

### 2.1 作业配置 Tab（项目编辑页）

**文件**：`src/pages/admin/project/edit/index.vue` — 已有 `el-tab-pane name="submission"` 占位

**子组件**：`src/pages/admin/project/edit/components/SubmissionConfigForm.vue`（新建）

```
src/pages/admin/project/edit/components/
├── ProjectGroups.vue                   # 现有
├── ProjectReviewGroups.vue             # 现有
├── SubmissionConfigForm.vue            # 【新增】作业基本配置表单
└── GradingStandardManager.vue          # 【新增】评分标准管理组件
```

**SubmissionConfigForm.vue 表单字段**：

| 字段                   | 组件类型          | 说明                 |
| ---------------------- | ----------------- | -------------------- |
| `allowSubmission`      | `el-switch`       | 是否开启作业提交     |
| `submissionRequired`   | `el-switch`       | 作业是否为必交       |
| `submissionStartDate`  | `el-date-picker`  | 提交开始时间         |
| `submissionEndDate`    | `el-date-picker`  | 提交截止时间         |
| `submissionFileTypes`  | `el-input`        | 允许的项目文件类型   |
| `submissionPptTypes`   | `el-input`        | 允许的 PPT 文件类型  |
| `submissionMaxSize`    | `el-input-number` | 项目文件大小上限(MB) |
| `submissionPptMaxSize` | `el-input-number` | PPT 文件大小上限(MB) |
| `enableAiScoring`      | `el-switch`       | 是否启用 AI 自动评分 |
| `enableResubmit`       | `el-switch`       | 学生是否可覆盖提交   |

**UI 布局**：两列卡片式布局，左侧基本开关 + 日期，右侧文件限制。

**GradingStandardManager.vue** — 评分标准管理：

```
┌──────────────────────────────────────────────────────┐
│  [评分标准管理]                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  当前生效标准: C++ 游戏评分标准 v2   [切换版本]    │ │
│  ├──────────────────────────────────────────────────┤ │
│  │  评分维度:                                       │ │
│  │  ┌────────────┬──────┬──────┬────────────────┐  │ │
│  │  │ 维度名     │ 分值 │ 权重 │ 操作            │  │ │
│  │  ├────────────┼──────┼──────┼────────────────┤  │ │
│  │  │ 代码质量   │ 30   │ 30%  │ [编辑] [删除]   │  │ │
│  │  │ 功能完整性 │ 35   │ 35%  │ [编辑] [删除]   │  │ │
│  │  │ 创新性     │ 15   │ 15%  │ [编辑] [删除]   │  │ │
│  │  │ 答辩表现   │ 20   │ 20%  │ [编辑] [删除]   │  │ │
│  │  └────────────┴──────┴──────┴────────────────┘  │ │
│  │  [+ 添加维度]        总分: 100                   │ │
│  ├──────────────────────────────────────────────────┤ │
│  │  [上传评分标准文件]  支持 PDF/DOCX/MD             │ │
│  │  [保存为当前版本]                                  │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

> 每个维度都有一个隐藏的 `aiPrompt` 字段，编辑时可选填，专门用于指导 AI Agent 如何针对该维度评分。

### 2.2 管理员作业管理页面

**路由**：`/admin/submission`
**componentCode**：`admin-submission`
**目录**：`src/pages/admin/submission/`

```
src/pages/admin/submission/
├── index.vue                # 主页面
├── components/
│   ├── SubmissionTable.vue  # 提交列表表格
│   ├── SubmissionFilter.vue # 筛选栏（项目选择、状态、日期范围、关键词）
│   ├── SubmissionDetail.vue # 提交详情抽屉/对话框
│   └── SubmissionStats.vue  # 顶部统计卡片
```

**页面功能**：

```
┌──────────────────────────────────────────────────────┐
│  [统计卡片] 总提交 | 待评分 | 已评分 | 平均分         │
├──────────────────────────────────────────────────────┤
│  [筛选栏]  项目下拉 | 状态下拉 | 关键词搜索           │
├──────────────────────────────────────────────────────┤
│  [表格]                                              │
│  ┌────┬──────┬────────┬────────┬──────┬──────┬────┐  │
│  │ #  │ 提交人│ 项目名 │ 提交时间│ 状态 │ 分数 │操作│  │
│  ├────┼──────┼────────┼────────┼──────┼──────┼────┤  │
│  │ 1  │ 张三 │ 项目A  │ 06-10  │已评分│ 85.5 │查看│  │
│  │ 2  │ 李四 │ 项目A  │ 06-09  │评分中│  -   │评分│  │
│  └────┴──────┴────────┴────────┴──────┴──────┴────┘  │
├──────────────────────────────────────────────────────┤
│  [分页]                                               │
└──────────────────────────────────────────────────────┘
```

**操作**：

- 点击"查看" → 打开 `SubmissionDetail.vue` 抽屉，展示文件信息 + 评分详情
- 点击"评分" → 跳转/打开教师评分面板
- 支持批量导出评分结果

### 2.3 教师评分工作台（新增）

**角色**：`scorer`、`admin`、`super_admin` 角色的评分员
**路由**：`/scoring/submissions`
**componentCode**：`scoring-submission`
**目录**：`src/pages/scoring/submission/`

```
src/pages/scoring/submission/
├── index.vue                    # 评分工作台主页（提交列表）
├── components/
│   ├── SubmissionGradingCard.vue # 单个提交的评分卡片
│   ├── ScorePanel.vue           # 评分面板（维度评分滑块 + 评语）
│   ├── AiScoreReference.vue     # AI 评分参考面板（折叠，展示 AI 评分详情）
│   └── SubmissionPreview.vue    # 文件预览（代码在线查看 / PPT 预览）
```

**页面流程**：

```
┌─────────────────────────────────────────────────────────┐
│  项目: [项目A ▼]   状态: [全部 ▼]                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  提交人: 张三   提交时间: 2026-06-10              │  │
│  │  项目文件: game_project.zip (25MB) [下载]         │  │
│  │  PPT: defense.pptx (3MB) [下载]                   │  │
│  │  项目描述: 一款基于 C++ 的迷宫逃脱游戏...          │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  ┌─ AI 评分参考（点击展开）────────────────────┐  │  │
│  │  │  代码质量: 25/30  │ 功能完整性: 30/35       │  │  │
│  │  │  创新性: 12/15    │ 答辩表现: 16/20         │  │  │
│  │  │  AI 推荐总分: 83/100  置信度: 0.85          │  │  │
│  │  │  [采纳AI评分]                                │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  [评分面板]                                       │  │
│  │  代码质量:  ═══●═══════════ 25/30                │  │
│  │  功能完整性: ═══════●═══════ 32/35                │  │
│  │  创新性:    ═══●═══════════ 12/15                │  │
│  │  答辩表现:  ═══════●═══════ 17/20                │  │
│  │  评语: [请输入评语...]                            │  │
│  │                                                   │  │
│  │  [暂存]  [提交评分]                               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**关键交互**：

- 页面顶部选择项目后，下方展示该项目的所有待评分提交
- 每个提交是一张卡片，教师逐份评分
- AI 评分参考面板默认折叠，点击展开查看 AI 的详细评分
- 点击"采纳AI评分" → 自动填充 AI 的分数到评分面板，教师可微调
- 提交评分后状态变为 `scored`，学生端可见最终分数

### 2.4 学生提交页面改进

**现有文件**：`src/pages/normal/submission/index.vue`（已由 spec 创建）

**需要增加的逻辑**：

1. **项目选择器**：页面顶部增加一个项目下拉选择框，列出当前用户可提交作业的项目（`allow_submission=true` 且角色为 `normal` 且当前时间在提交窗口内的项目）

```
┌──────────────────────────────────┐
│  [项目选择] ▼ 请选择答辩项目     │
├──────────────────────────────────┤
│  选择项目后，下方显示提交表单     │
└──────────────────────────────────┘
```

2. **提交限制提示**：
   - 若已提交过且项目不允许覆盖 → 显示"已提交，等待评分"
   - 若已过截止日期 → 显示"提交已截止"
   - 若项目未开启提交 → 显示"当前项目未开启作业提交"

3. **评分结果查看**：若提交状态为 `scored`，表单下方展示评分结果卡片

```
┌──────────────────────────────────────────────┐
│  ✅ 评分已完成                               │
│  代码质量: 25/30   功能完整性: 32/35          │
│  创新性: 12/15     答辩表现: 17/20            │
│  ────────────────────────────                 │
│  总分: 86/100                                 │
│  教师评语: 项目功能完整，代码规范良好...       │
└──────────────────────────────────────────────┘
```

4. **提交成功后刷新**：历史记录列表需根据选中的项目过滤

### 2.5 提交记录表增加项目信息和分数显示

> `index.vue` 内的历史记录区 / `SubmitHistory.vue`

- 每条记录增加"所属项目"列
- 已评分记录显示分数
- 支持分页时按项目过滤

---

## 3. 入口配置

### 3.1 侧边栏动态菜单

后端返回菜单节点时，新增以下记录：

| menuCode                  | parentCode      | title    | path                   | componentCode        | roles                      | sort   |
| ------------------------- | --------------- | -------- | ---------------------- | -------------------- | -------------------------- | ------ |
| `menu-normal-submission`  | (normal 父菜单) | 提交作业 | `/normal/submission`   | `normal-submission`  | `normal`                   | (按需) |
| `menu-admin-submission`   | (admin 父菜单)  | 作业管理 | `/admin/submission`    | `admin-submission`   | `admin,super_admin`        | (按需) |
| `menu-scoring-submission` | (评分父菜单)    | 作业评分 | `/scoring/submissions` | `scoring-submission` | `scorer,admin,super_admin` | (按需) |

### 3.2 前端 routeMap 注册

在 `src/router/routeMap.js` 中新增：

```javascript
'normal-submission': () => import('@/pages/normal/submission/index.vue'),
'admin-submission': () => import('@/pages/admin/submission/index.vue'),
```

### 3.3 首页快捷入口

在 `HomePage.vue` 的 `shortcutList` 中新增：

```javascript
{
  id: 'submission',
  name: '提交作业',
  path: '/normal/submission',
  icon: 'Upload',
  color: '#667eea',
  roles: ['normal'],
}
```

> 注意：此快捷入口仅在选定项目后才展示，或者始终展示。

---

## 4. 执行清单

### Phase 1：后端数据层（2-3 天）

- [ ] `project` 表增加 `allow_submission`、`enable_ai_scoring`、`enable_resubmit` 等作业配置字段
- [ ] 创建 `submission_grading_standard` 表（含 `dimensions` JSON 字段）
- [ ] 创建 `submission_record` 表（状态改为评分工作流：pending/scoring/scored/returned）
- [ ] 创建 `submission_score` 表（含 AI 评分专用字段）
- [ ] 实现学生端 API：提交创建/查询/已评分项目列表
- [ ] 实现教师端 API：评分列表/评分提交/AI 评分参考查询
- [ ] 实现管理端 API：提交列表/统计/导出
- [ ] 实现评分标准 CRUD API
- [ ] 实现 BFF 回调接口
- [ ] 实现 AI 评分触发/状态查询接口

### Phase 2：BFF 上传网关（1-2 天）

- [ ] 参考 spec 搭建 `upload-bff/` 服务
- [ ] 实现分片上传/校验/合并/回调
- [ ] 对接 Java 后端的回调接口

### Phase 3：前端 — 项目管理 Tab 扩展（2 天）

- [x] 创建 `SubmissionConfigForm.vue` 组件（基本开关 + 文件限制 + AI 开关）
- [x] 创建 `GradingStandardManager.vue` 组件（本阶段完成占位壳和接口入口，完整维度编辑器与文件上传待下一阶段）
- [x] 在项目编辑页作业配置 Tab 中接入这两个组件

### Phase 4：前端 — 教师评分工作台（2-3 天）

- [ ] 创建 `src/pages/scoring/submission/` 目录
- [ ] `index.vue`：评分工作台主页，顶部项目选择 + 提交卡片列表
- [ ] `SubmissionGradingCard.vue`：单个提交评分卡片
- [ ] `ScorePanel.vue`：维度评分面板（滑块 + 评语）
- [ ] `AiScoreReference.vue`：AI 评分参考面板（可折叠 + 一键采纳）
- [ ] `SubmissionPreview.vue`：文件预览
- [ ] 路由注册 + 侧边栏配置

### Phase 5：前端 — 管理员作业管理（2 天）

- [ ] 创建 `src/pages/admin/submission/` 目录及页面
- [ ] `SubmissionStats.vue`：统计卡片（改为评分统计）
- [ ] `SubmissionFilter.vue`：筛选栏
- [ ] `SubmissionTable.vue`：表格列表（状态改为评分状态，增加分数列）
- [ ] `SubmissionDetail.vue`：详情抽屉 + 评分详情展示
- [ ] 路由注册 + 侧边栏配置

### Phase 6：前端 — 学生端改进（1.5 天）

- [x] `index.vue` 增加项目选择器
- [x] 提交逻辑绑定到选中的项目 ID
- [x] 已评分提交展示评分结果卡片
- [x] 历史记录按项目过滤 + 显示分数

### Phase 7：入口配置（0.5 天）

- [ ] 后端动态路由菜单添加三个菜单节点（学生/教师/管理员）
- [x] `routeMap.js` 注册三个页面组件（其中 `admin-submission`、`scoring-submission` 当前为占位页面）
- [ ] 首页快捷入口增加"提交作业"（normal）和"作业评分"（scorer）（当前已完成 normal 角色“提交作业”入口）

---

## 5. 关键设计决策

### 5.1 作业为什么要绑定项目？

| 方式                      | 优点                                             | 缺点                         |
| ------------------------- | ------------------------------------------------ | ---------------------------- |
| **绑定项目（推荐）**      | 复用项目的时间、评审团、打分标准；管理端统一查看 | 项目多了需要筛选             |
| **独立提交（当前 spec）** | 简单直接                                         | 无法与评分体系关联；管理散乱 |

**结论**：作业绑定项目，项目自带评分标准（Grading Standard），提交的作业通过该标准评分。

### 5.2 覆盖提交策略

- **允许覆盖**：学生可在截止日期前重新提交，覆盖旧记录（`enable_resubmit=true`）
- 覆盖时保留历史版本（通过 `submit_count` 递增跟踪）
- 覆盖后之前 AI/教师的评分自动失效，重新进入 `pending` 状态

### 5.3 文件存储

- 小型文件（≤10MB）：直接通过 Java 后端上传
- 大型文件（>10MB）：走 BFF 分片上传
- 文件落地后，BFF 回调 Java 后端通知文件元数据
- 文件路径存储在 `submission_record` 表中

### 5.4 评分标准为什么设计为 JSON 维度 + 文件双轨？

| 方式     | 目的                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| **JSON** | 前端可视化编辑、AI Agent 结构化解析、逐维度评分展示                                         |
| **文件** | 教师上传原始评分标准 PDF/DOCX，作为人工参考依据，也可在 AI 评分时作为额外上下文注入给 Agent |

**结论**：双轨并存。JSON 是结构化数据供系统和 AI 使用，文件是原始文档供人工查阅。

### 5.5 AI 评分 vs 教师评分的关系

```
提交完成
  ├─ (如开启 AI) → 异步触发 AI 评分 → 写入 submission_score (scorer_type=ai)
  │                  → 教师登录看到 AI 评分参考
  │                  → 教师可选择：
  │                    a) 采纳 AI 评分 → 一键填充 → 可微调 → 确认
  │                    b) 完全自己评 → AI 分仅作参考
  │                    c) 部分采纳 → 手动调整某些维度
  └─ (未开启 AI) → 教师直接评分
```

- AI 评分始终以 `is_final=false` 存储
- 教师提交评分后，一条新的 `submission_score`（`scorer_type=teacher`, `is_final=true`）写入
- 若教师覆盖了 AI 分数，`overridden_by` 和 `overridden_reason` 记录覆盖链路

---

## 6. AI Agent 自动评分设计（后期实现）

### 6.1 整体架构

```
学生提交完成
     │
     ▼
Java 后端收到 BFF 回调 → submission_record 创建完成
     │
     ▼
提交异步消息到 AI 评分队列（RabbitMQ / Redis Stream）
     │
     ▼
AI Scoring Worker（独立服务或线程）
  ├ 1. 从 submission_record 获取 file_path
  ├ 2. 从 submission_grading_standard 获取 dimensions（含 aiPrompt）
  ├ 3. 下载/读取学生提交的代码文件
  ├ 4. 构造评分 Prompt（包含评分标准 + 代码内容）
  ├ 5. 调用 LLM API 进行评分
  ├ 6. 解析 LLM 返回的结构化结果
  └ 7. 写入 submission_score（scorer_type=ai, is_final=false）
     │
     ▼
教师登录 → 看到 AI 评分参考 → 确认/调整 → 最终评分
```

### 6.2 AI 评分 Prompt 模板（示意）

```
你是 C++ 课程作业评分助手。请根据以下评分标准对学生提交的代码进行评分。

## 评分标准
{grading_standard.description}

## 评分维度
{dimensions JSON 中每个维度的 name + description + maxScore + aiPrompt}

## 学生提交的项目描述
{submission.description}

## 学生代码摘要
{从提交的代码文件中提取的关键结构、函数列表、主要实现}

请严格按照以下 JSON 格式返回评分结果：
{
  "dimensionScores": [
    { "dimensionId": "code_quality", "score": 25, "comment": "...", "evidence": "..." },
    ...
  ],
  "totalScore": 86,
  "summary": "整体评价...",
  "confidence": 0.85,
  "reasoning": "评分推理过程..."
}
```

### 6.3 AI 评分队列设计

| 组件     | 技术选型（建议） | 说明                                  |
| -------- | ---------------- | ------------------------------------- |
| 消息队列 | Redis Stream     | 轻量，与现有 Redis 复用               |
| Worker   | Java + Spring    | 与后端同语言，便于代码复用            |
| LLM 调用 | 可插拔接口       | 支持 OpenAI / Azure OpenAI / 本地模型 |
| 代码解析 | tree-sitter      | 提取代码结构、函数签名、AST 概要      |
| 文件读取 | 直接读磁盘/OSS   | worker 需有 BFF 存储目录的读权限      |

### 6.4 查询 AI 评分状态

学生端和管理端可通过 `GET /api/v1/submissions/{id}/ai-scoring-status` 查询：

```json
{
  "status": "processing", // queued | processing | done | failed
  "queuedAt": "2026-06-10T10:00:00",
  "startedAt": "2026-06-10T10:00:05",
  "completedAt": null,
  "error": null
}
```

---

## 7. 与现有评分体系打通（后续扩展）

一旦作业与项目绑定，后续可自然扩展：

1. **评分打通**：评分工作台（`/scoring`）中增加"作业评分"选项卡，评审员可以在同一界面看到小组答辩打分和作业评分
2. **成绩关联**：作业分 + 答辩分按权重计算最终成绩
3. **通知机制**：学生提交作业后，通知评审团有新提交待评分；AI 评分完成后通知教师确认
4. **查重功能**：对提交的项目文件进行相似度检测（可与 AI 评分流程合并）
5. **通知机制**：提交作业后通知评审员有新提交待审核
6. **查重功能**：对提交的项目文件进行相似度检测
