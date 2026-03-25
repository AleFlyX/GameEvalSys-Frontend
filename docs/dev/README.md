## 数据库设计文档

### 1. 系统用户表 (sys_user)

| 字段        | 类型         | 约束                                | 说明                                                           |
| ----------- | ------------ | ----------------------------------- | -------------------------------------------------------------- |
| id          | bigint       | PK, AUTO_INCREMENT                  | 用户ID                                                         |
| username    | varchar(50)  | NOT NULL, UNIQUE                    | 用户名（唯一）                                                 |
| password    | varchar(100) | NOT NULL                            | 密码（加密存储）                                               |
| name        | varchar(50)  | NOT NULL                            | 真实姓名                                                       |
| role        | varchar(20)  | NOT NULL                            | 角色：super_admin/管理员 admin/打分用户 scorer/普通用户 normal |
| is_enabled  | tinyint(1)   | DEFAULT 1                           | 是否启用：1-是 0-否                                            |
| create_time | datetime     | DEFAULT CURRENT_TIMESTAMP           | 创建时间                                                       |
| update_time | datetime     | DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间                                                       |

**用途**：存储系统所有用户的基本信息，包括登录凭证、角色和状态。

### 2. 打分标准主表 (scoring_standard)

| 字段        | 类型         | 约束                                | 说明                        |
| ----------- | ------------ | ----------------------------------- | --------------------------- |
| id          | bigint       | PK, AUTO_INCREMENT                  | 标准ID                      |
| creator_id  | bigint       | NOT NULL, FK                        | 创建人ID (关联 sys_user.id) |
| name        | varchar(100) | NOT NULL                            | 打分标准名称                |
| create_time | datetime     | DEFAULT CURRENT_TIMESTAMP           | 创建时间                    |
| update_time | datetime     | DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间                    |

**用途**：定义一套打分标准的整体信息，如“期末课题评分标准”。一个标准包含多个打分指标。

### 3. 打分指标表 (scoring_indicator)

| 字段        | 类型         | 约束                      | 说明                                  |
| ----------- | ------------ | ------------------------- | ------------------------------------- |
| id          | bigint       | PK, AUTO_INCREMENT        | 指标ID                                |
| standard_id | bigint       | NOT NULL, FK              | 关联标准ID (关联 scoring_standard.id) |
| name        | varchar(100) | NOT NULL                  | 指标名称                              |
| description | varchar(500) | DEFAULT ''                | 指标说明                              |
| min_score   | int          | NOT NULL                  | 分值最小值                            |
| max_score   | int          | NOT NULL                  | 分值最大值                            |
| sort        | int          | DEFAULT 0                 | 排序号                                |
| create_time | datetime     | DEFAULT CURRENT_TIMESTAMP | 创建时间                              |

**用途**：存储某个打分标准下的具体评分指标，如“创新性”、“可行性”，并定义其分数范围。

### 4. 课题项目表 (project)

| 字段        | 类型          | 约束                                | 说明                                      |
| ----------- | ------------- | ----------------------------------- | ----------------------------------------- |
| id          | bigint        | PK, AUTO_INCREMENT                  | 项目ID                                    |
| name        | varchar(200)  | NOT NULL                            | 项目名称                                  |
| description | varchar(1000) | DEFAULT ''                          | 项目描述                                  |
| start_date  | date          | NOT NULL                            | 起始日期                                  |
| end_date    | date          | NOT NULL                            | 结束日期                                  |
| status      | varchar(20)   | DEFAULT 'not_started'               | 项目状态：not_started/ongoing/ended       |
| is_enabled  | tinyint(1)    | DEFAULT 1                           | 是否启用：1-是 0-否                       |
| standard_id | bigint        | NOT NULL, FK                        | 关联打分标准ID (关联 scoring_standard.id) |
| creator_id  | bigint        | NOT NULL, FK                        | 创建人ID (关联 sys_user.id)               |
| create_time | datetime      | DEFAULT CURRENT_TIMESTAMP           | 创建时间                                  |
| update_time | datetime      | DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间                                  |

**用途**：存储需要进行打分的课题项目信息，每个项目关联一套打分标准。

### 5. 小组信息主表 (project_group_info)

| 字段        | 类型         | 约束                                | 说明                |
| ----------- | ------------ | ----------------------------------- | ------------------- |
| id          | bigint       | PK, AUTO_INCREMENT                  | 小组ID              |
| name        | varchar(100) | NOT NULL                            | 小组名称            |
| description | varchar(500) | DEFAULT ''                          | 小组描述            |
| is_enabled  | tinyint(1)   | DEFAULT 1                           | 是否启用：1-是 0-否 |
| create_time | datetime     | DEFAULT CURRENT_TIMESTAMP           | 创建时间            |
| update_time | datetime     | DEFAULT CURRENT_TIMESTAMP ON UPDATE | 更新时间            |

**用途**：独立存储所有可能参与项目的小组信息，如“第一组”、“第二组”。

### 6. 项目-小组关联表 (project_group)

| 字段          | 类型     | 约束                      | 说明                                    |
| ------------- | -------- | ------------------------- | --------------------------------------- |
| id            | bigint   | PK, AUTO_INCREMENT        | 关联ID                                  |
| project_id    | bigint   | NOT NULL, FK              | 项目ID (关联 project.id)                |
| group_info_id | bigint   | NOT NULL, FK              | 小组信息ID (关联 project_group_info.id) |
| create_time   | datetime | DEFAULT CURRENT_TIMESTAMP | 创建时间                                |

**用途**：定义哪些小组参与哪些项目，实现多对多关系。

### 7. 项目-打分用户关联表 (project_scorer)

| 字段        | 类型     | 约束                      | 说明                          |
| ----------- | -------- | ------------------------- | ----------------------------- |
| id          | bigint   | PK, AUTO_INCREMENT        | 关联ID                        |
| project_id  | bigint   | NOT NULL, FK              | 项目ID (关联 project.id)      |
| user_id     | bigint   | NOT NULL, FK              | 打分用户ID (关联 sys_user.id) |
| create_time | datetime | DEFAULT CURRENT_TIMESTAMP | 创建时间                      |

**用途**：定义哪些用户（打分者）有权对某个项目进行打分。

### 8. 打分记录主表 (scoring_record)

| 字段        | 类型          | 约束                      | 说明                               |
| ----------- | ------------- | ------------------------- | ---------------------------------- |
| id          | bigint        | PK, AUTO_INCREMENT        | 记录ID                             |
| project_id  | bigint        | NOT NULL, FK              | 项目ID (关联 project.id)           |
| group_id    | bigint        | NOT NULL, FK              | 被打分组ID (关联 project_group.id) |
| user_id     | bigint        | NOT NULL, FK              | 打分用户ID (关联 sys_user.id)      |
| total_score | decimal(10,2) | NOT NULL                  | 总分                               |
| create_time | datetime      | DEFAULT CURRENT_TIMESTAMP | 打分时间                           |

**用途**：存储一次完整的打分记录（主记录），记录某个用户为某个项目下的某个小组打的最终总分。

### 9. 打分记录明细表 (scoring_record_detail)

| 字段         | 类型          | 约束               | 说明                                    |
| ------------ | ------------- | ------------------ | --------------------------------------- |
| id           | bigint        | PK, AUTO_INCREMENT | 明细ID                                  |
| record_id    | bigint        | NOT NULL, FK       | 关联打分记录ID (关联 scoring_record.id) |
| indicator_id | bigint        | NOT NULL, FK       | 指标ID (关联 scoring_indicator.id)      |
| score        | decimal(10,2) | NOT NULL           | 该指标的打分值                          |

**用途**：存储一次打分记录中，各个具体指标的得分明细。

### 10. 评审组主表 (reviewer_group)

| 字段        | 类型         | 约束                      | 说明                        |
| ----------- | ------------ | ------------------------- | --------------------------- |
| id          | bigint       | PK, AUTO_INCREMENT        | 评审组ID                    |
| name        | varchar(100) | NOT NULL                  | 评审组名称                  |
| description | varchar(500) | DEFAULT ''                | 评审组描述                  |
| creator_id  | bigint       | NOT NULL, FK              | 创建人ID (关联 sys_user.id) |
| is_enabled  | tinyint(1)   | DEFAULT 1                 | 是否启用：1-是 0-否         |
| create_time | datetime     | DEFAULT CURRENT_TIMESTAMP | 创建时间                    |

**用途**：存储评审组信息，用于将打分用户分组管理。

### 11. 评审组成员关联表 (reviewer_group_member)

| 字段        | 类型     | 约束                      | 说明                              |
| ----------- | -------- | ------------------------- | --------------------------------- |
| id          | bigint   | PK, AUTO_INCREMENT        | 关联ID                            |
| group_id    | bigint   | NOT NULL, FK              | 评审组ID (关联 reviewer_group.id) |
| user_id     | bigint   | NOT NULL, FK              | 用户ID (关联 sys_user.id)         |
| create_time | datetime | DEFAULT CURRENT_TIMESTAMP | 加入时间                          |

**用途**：定义评审组的成员，实现多对多关系。

---

## 测试数据插入SQL

```sql
-- 先关闭外键检查，方便按需插入
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 插入系统用户 (密码示例为 123456 的BCrypt加密结果，仅用于测试)
INSERT INTO `sys_user` (`id`, `username`, `password`, `name`, `role`, `is_enabled`) VALUES
(1, 'admin', '$2a$10$Nk8l4qGj6hL6Qj7Z8yX9wOeFgHjKlQwErTyUiOpAsDfGhJkLzXcVbNm', '系统管理员', 'super_admin', 1),
(2, 'zhangwei', '$2a$10$Nk8l4qGj6hL6Qj7Z8yX9wOeFgHjKlQwErTyUiOpAsDfGhJkLzXcVbNm', '张伟', 'admin', 1),
(3, 'lili', '$2a$10$Nk8l4qGj6hL6Qj7Z8yX9wOeFgHjKlQwErTyUiOpAsDfGhJkLzXcVbNm', '李丽', 'scorer', 1),
(4, 'wangfang', '$2a$10$Nk8l4qGj6hL6Qj7Z8yX9wOeFgHjKlQwErTyUiOpAsDfGhJkLzXcVbNm', '王芳', 'scorer', 1),
(5, 'zhaogang', '$2a$10$Nk8l4qGj6hL6Qj7Z8yX9wOeFgHjKlQwErTyUiOpAsDfGhJkLzXcVbNm', '赵刚', 'normal', 1);

-- 2. 插入打分标准
INSERT INTO `scoring_standard` (`id`, `creator_id`, `name`) VALUES
(1, 1, '2024年秋季学期课题评分标准'),
(2, 2, '2025年春季学期创新项目评分标准');

-- 3. 插入打分指标
INSERT INTO `scoring_indicator` (`id`, `standard_id`, `name`, `description`, `min_score`, `max_score`, `sort`) VALUES
(1, 1, '创新性', '课题的创新程度', 0, 30, 1),
(2, 1, '完成度', '课题完成情况', 0, 40, 2),
(3, 1, '展示效果', '现场展示效果', 0, 30, 3),
(4, 2, '技术难度', '项目技术实现难度', 0, 20, 1),
(5, 2, '商业价值', '项目的市场潜力', 0, 30, 2),
(6, 2, '团队协作', '团队合作表现', 0, 30, 3),
(7, 2, '文档规范', '项目文档质量', 0, 20, 4);

-- 4. 插入课题项目
INSERT INTO `project` (`id`, `name`, `description`, `start_date`, `end_date`, `status`, `standard_id`, `creator_id`) VALUES
(1, '智慧校园管理系统', '基于物联网的校园管理平台', '2024-09-01', '2024-12-20', 'ongoing', 1, 2),
(2, 'AI辅助编程工具', '基于大模型的代码助手', '2025-03-01', '2025-06-30', 'not_started', 2, 2);

-- 5. 插入小组信息
INSERT INTO `project_group_info` (`id`, `name`, `description`) VALUES
(1, '创新先锋队', '专注于前沿技术探索'),
(2, '代码工匠组', '注重代码质量与架构设计'),
(3, '智联团队', '物联网与人工智能方向');

-- 6. 关联项目与小组
INSERT INTO `project_group` (`project_id`, `group_info_id`) VALUES
(1, 1),
(1, 2),
(2, 2),
(2, 3);

-- 7. 关联项目与打分用户
INSERT INTO `project_scorer` (`project_id`, `user_id`) VALUES
(1, 3),  -- 李丽为项目1打分
(1, 4),  -- 王芳为项目1打分
(2, 3);  -- 李丽为项目2打分

-- 8. 插入评审组
INSERT INTO `reviewer_group` (`id`, `name`, `description`, `creator_id`) VALUES
(1, '第一评审组', '主要负责技术类项目评审', 1),
(2, '第二评审组', '主要负责创新类项目评审', 2);

-- 9. 关联评审组成员
INSERT INTO `reviewer_group_member` (`group_id`, `user_id`) VALUES
(1, 3),  -- 李丽属于第一评审组
(1, 4),  -- 王芳属于第一评审组
(2, 3);  -- 李丽同时也属于第二评审组

-- 10. 插入打分记录主表 (注意：group_id 引用的是 project_group 表的 id)
-- 先查询 project_group 中的实际id，假设上面插入的对应关系为：
-- 项目1(智慧校园) -> 小组1(创新先锋队) -> project_group.id = 1
-- 项目1(智慧校园) -> 小组2(代码工匠组) -> project_group.id = 2
-- 项目2(AI工具) -> 小组2(代码工匠组) -> project_group.id = 3
-- 项目2(AI工具) -> 小组3(智联团队) -> project_group.id = 4
INSERT INTO `scoring_record` (`id`, `project_id`, `group_id`, `user_id`, `total_score`) VALUES
(1, 1, 1, 3, 85.00),  -- 李丽给项目1的创新先锋队打分 85
(2, 1, 1, 4, 78.00),  -- 王芳给项目1的创新先锋队打分 78
(3, 1, 2, 3, 92.00),  -- 李丽给项目1的代码工匠组打分 92
(4, 2, 3, 3, 88.00);  -- 李丽给项目2的代码工匠组打分 88

-- 11. 插入打分记录明细表
INSERT INTO `scoring_record_detail` (`record_id`, `indicator_id`, `score`) VALUES
-- 记录1: 李丽给项目1创新先锋队的打分明细 (标准1: 创新性30, 完成度40, 展示效果30)
(1, 1, 25),
(1, 2, 35),
(1, 3, 25),
-- 记录2: 王芳给项目1创新先锋队的打分明细
(2, 1, 22),
(2, 2, 32),
(2, 3, 24),
-- 记录3: 李丽给项目1代码工匠组的打分明细
(3, 1, 28),
(3, 2, 38),
(3, 3, 26),
-- 记录4: 李丽给项目2代码工匠组的打分明细 (标准2: 技术难度20, 商业价值30, 团队协作30, 文档规范20)
(4, 4, 18),
(4, 5, 25),
(4, 6, 27),
(4, 7, 18);

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;
```
