# 课题项目打分系统 SQL 建表语句

以下建表语句基于 **MySQL 8.0+** 编写，包含完整的字段定义、主键、外键约束、索引和注释，严格匹配你之前定义的业务模型。

## 注意事项

1. 所有表统一使用 `utf8mb4` 字符集（支持emoji等特殊字符），`InnoDB` 引擎（支持事务和外键）
2. 外键约束添加了 `ON DELETE RESTRICT`，防止误删关联数据
3. 核心字段添加了索引，提升查询性能
4. 所有时间字段默认值为当前时间，便于数据追踪

---

## 1. 用户表（sys_user）

存储系统所有用户信息，包含角色和启用状态

```sql
CREATE TABLE `sys_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名（唯一）',
  `password` varchar(100) NOT NULL COMMENT '密码（加密存储）',
  `name` varchar(50) NOT NULL COMMENT '真实姓名',
  `role` varchar(20) NOT NULL COMMENT '角色：super_admin/管理员 admin/打分用户 scorer/普通用户 normal',
  `is_enabled` tinyint(1) DEFAULT 1 COMMENT '是否启用：1-是 0-否',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';
```

## 2. 打分标准表（scoring_standard）

存储打分标准的主信息

```sql
CREATE TABLE `scoring_standard` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '标准ID',
  `creator_id` bigint NOT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_creator_id` (`creator_id`),
  CONSTRAINT `fk_standard_creator` FOREIGN KEY (`creator_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打分标准主表';
```

## 3. 打分指标表（scoring_indicator）

存储每个打分标准下的具体指标

```sql
CREATE TABLE `scoring_indicator` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '指标ID',
  `standard_id` bigint NOT NULL COMMENT '关联标准ID',
  `name` varchar(100) NOT NULL COMMENT '指标名称',
  `description` varchar(500) DEFAULT '' COMMENT '指标说明',
  `min_score` int NOT NULL COMMENT '分值最小值',
  `max_score` int NOT NULL COMMENT '分值最大值',
  `sort` int DEFAULT 0 COMMENT '排序号',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_standard_id` (`standard_id`),
  CONSTRAINT `fk_indicator_standard` FOREIGN KEY (`standard_id`) REFERENCES `scoring_standard` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打分指标表';
```

## 4. 项目表（project）

存储课题项目的核心信息

```sql
CREATE TABLE `project` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '项目ID',
  `name` varchar(200) NOT NULL COMMENT '项目名称',
  `description` varchar(1000) DEFAULT '' COMMENT '项目描述',
  `start_date` date NOT NULL COMMENT '起始日期',
  `end_date` date NOT NULL COMMENT '结束日期',
  `status` varchar(20) DEFAULT 'not_started' COMMENT '项目状态：not_started-未开始/ongoing-进行中/ended-已结束',
  `is_enabled` tinyint(1) DEFAULT 1 COMMENT '是否启用：1-是 0-否',
  `standard_id` bigint NOT NULL COMMENT '关联打分标准ID',
  `creator_id` bigint NOT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_standard_id` (`standard_id`),
  KEY `idx_creator_id` (`creator_id`),
  CONSTRAINT `fk_project_standard` FOREIGN KEY (`standard_id`) REFERENCES `scoring_standard` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_project_creator` FOREIGN KEY (`creator_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课题项目表';
```

## 5. 项目小组表（project_group）

存储参与项目的小组信息

```sql
CREATE TABLE `project_group` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '小组ID',
  `project_id` bigint NOT NULL COMMENT '关联项目ID',
  `name` varchar(100) NOT NULL COMMENT '小组名称',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  CONSTRAINT `fk_group_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目参与小组表';
```

## 6. 项目打分用户关联表（project_scorer）

存储项目可参与打分的用户关联关系

```sql
CREATE TABLE `project_scorer` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  `project_id` bigint NOT NULL COMMENT '项目ID',
  `user_id` bigint NOT NULL COMMENT '打分用户ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_user` (`project_id`,`user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_scorer_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scorer_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目-打分用户关联表';
```

## 7. 打分记录表（scoring_record）

存储打分的主记录（包含总分）

```sql
CREATE TABLE `scoring_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `project_id` bigint NOT NULL COMMENT '项目ID',
  `group_id` bigint NOT NULL COMMENT '被打分组ID',
  `user_id` bigint NOT NULL COMMENT '打分用户ID',
  `total_score` decimal(10,2) NOT NULL COMMENT '总分',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '打分时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_group_user` (`project_id`,`group_id`,`user_id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_record_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_record_group` FOREIGN KEY (`group_id`) REFERENCES `project_group` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_record_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打分记录主表';
```

## 8. 打分明细记录表（scoring_record_detail）

存储每个指标的具体打分值

```sql
CREATE TABLE `scoring_record_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `record_id` bigint NOT NULL COMMENT '关联打分记录ID',
  `indicator_id` bigint NOT NULL COMMENT '指标ID',
  `score` decimal(10,2) NOT NULL COMMENT '该指标的打分值',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_indicator` (`record_id`,`indicator_id`),
  KEY `idx_indicator_id` (`indicator_id`),
  CONSTRAINT `fk_detail_record` FOREIGN KEY (`record_id`) REFERENCES `scoring_record` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detail_indicator` FOREIGN KEY (`indicator_id`) REFERENCES `scoring_indicator` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打分记录明细表';
```

---

# 测试数据

```sql
-- ----------------------------
-- 1. 插入系统用户表数据 (sys_user)
-- ----------------------------
INSERT INTO `sys_user` (`username`, `password`, `name`, `role`, `is_enabled`) VALUES
('super_admin', '123456', '超级管理员', 'super_admin', 1),
('admin_01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', 'admin', 1),
('scorer_01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '打分员张三', 'scorer', 1),
('scorer_02', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '打分员李四', 'scorer', 1),
('normal_01', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '普通用户王五', 'normal', 1);

-- ----------------------------
-- 2. 插入打分标准表数据 (scoring_standard)
-- ----------------------------
INSERT INTO `scoring_standard` (`creator_id`) VALUES
(1),  -- 超级管理员创建的打分标准1
(2);  -- 系统管理员创建的打分标准2

-- ----------------------------
-- 3. 插入打分指标表数据 (scoring_indicator)
-- ----------------------------
-- 标准1的指标（项目评审通用指标）
INSERT INTO `scoring_indicator` (`standard_id`, `name`, `description`, `min_score`, `max_score`, `sort`) VALUES
(1, '创新性', '项目方案的创新程度和技术突破点', 0, 30, 1),
(1, '可行性', '技术和落地执行的可行性分析', 0, 25, 2),
(1, '实用性', '项目成果的实际应用价值', 0, 25, 3),
(1, '完整性', '申报材料和方案的完整度', 0, 20, 4);

-- 标准2的指标（简化版打分指标）
INSERT INTO `scoring_indicator` (`standard_id`, `name`, `description`, `min_score`, `max_score`, `sort`) VALUES
(2, '完成度', '项目任务的完成情况', 0, 50, 1),
(2, '质量', '项目成果的质量水平', 0, 50, 2);

-- ----------------------------
-- 4. 插入项目表数据 (project)
-- ----------------------------
INSERT INTO `project` (`name`, `description`, `start_date`, `end_date`, `status`, `is_enabled`, `standard_id`, `creator_id`) VALUES
('2026年度科技创新项目评审', '针对2026年申报的科技创新项目进行综合评审打分', '2026-01-01', '2026-06-30', 'ongoing', 1, 1, 1),
('2026季度项目验收', '2026年第一季度项目完成情况验收', '2026-01-01', '2026-03-31', 'ended', 1, 2, 2);

-- ----------------------------
-- 5. 插入项目小组表数据 (project_group)
-- ----------------------------
-- 项目1的参与小组
INSERT INTO `project_group` (`project_id`, `name`) VALUES
(1, 'AI技术研发组'),
(1, '大数据应用组'),
(1, '物联网开发组');

-- 项目2的参与小组
INSERT INTO `project_group` (`project_id`, `name`) VALUES
(2, '前端开发组'),
(2, '后端研发组');

-- ----------------------------
-- 6. 插入项目打分用户关联表数据 (project_scorer)
-- ----------------------------
-- 项目1关联的打分用户
INSERT INTO `project_scorer` (`project_id`, `user_id`) VALUES
(1, 3),  -- 打分员张三
(1, 4);  -- 打分员李四

-- 项目2关联的打分用户
INSERT INTO `project_scorer` (`project_id`, `user_id`) VALUES
(2, 3);  -- 打分员张三

-- ----------------------------
-- 7. 插入打分记录表数据 (scoring_record)
-- ----------------------------
-- 项目1的打分记录
INSERT INTO `scoring_record` (`project_id`, `group_id`, `user_id`, `total_score`) VALUES
(1, 1, 3, 88.50),  -- 张三给AI技术研发组打分88.5
(1, 2, 3, 92.00),  -- 张三给大数据应用组打分92
(1, 1, 4, 85.00);  -- 李四给AI技术研发组打分85

-- 项目2的打分记录
INSERT INTO `scoring_record` (`project_id`, `group_id`, `user_id`, `total_score`) VALUES
(2, 4, 3, 95.00),  -- 张三给前端开发组打分95
(2, 5, 3, 88.00);  -- 张三给后端研发组打分88

-- ----------------------------
-- 8. 插入打分明细记录表数据 (scoring_record_detail)
-- ----------------------------
-- 张三给AI技术研发组（记录ID=1）的打分明细（对应标准1的4个指标）
INSERT INTO `scoring_record_detail` (`record_id`, `indicator_id`, `score`) VALUES
(1, 1, 28.00),  -- 创新性28分
(1, 2, 22.00),  -- 可行性22分
(1, 3, 20.00),  -- 实用性20分
(1, 4, 18.50);  -- 完整性18.5分 (总分88.5)

-- 张三给大数据应用组（记录ID=2）的打分明细
INSERT INTO `scoring_record_detail` (`record_id`, `indicator_id`, `score`) VALUES
(2, 1, 29.00),
(2, 2, 23.00),
(2, 3, 21.00),
(2, 4, 19.00);  -- 总分92

-- 李四给AI技术研发组（记录ID=3）的打分明细
INSERT INTO `scoring_record_detail` (`record_id`, `indicator_id`, `score`) VALUES
(3, 1, 25.00),
(3, 2, 20.00),
(3, 3, 20.00),
(3, 4, 20.00);  -- 总分85

-- 张三给前端开发组（记录ID=4）的打分明细（对应标准2的2个指标）
INSERT INTO `scoring_record_detail` (`record_id`, `indicator_id`, `score`) VALUES
(4, 5, 48.00),  -- 完成度48分
(4, 6, 47.00);  -- 质量47分 (总分95)

-- 张三给后端研发组（记录ID=5）的打分明细
INSERT INTO `scoring_record_detail` (`record_id`, `indicator_id`, `score`) VALUES
(5, 5, 45.00),
(5, 6, 43.00);  -- 总分88
```

### 总结

1. **表结构设计**：采用分表设计，将打分标准拆分为主表+指标表，打分记录拆分为主表+明细表，符合数据库规范化设计原则。
2. **约束与索引**：
   - 外键约束保证数据关联性和一致性
   - 唯一索引防止重复数据（如同一用户对同一小组的重复打分）
   - 普通索引提升关联查询效率
3. **业务适配**：
   - 项目状态字段控制打分权限（结束后禁止修改）
   - 启用状态开关支持临时禁用项目/用户
   - 总分自动计算存储，避免统计时重复计算
4. **扩展预留**：
   - 排序字段支持指标自定义排序
   - 备注/描述字段预留扩展空间
   - 所有表都包含创建/更新时间，便于数据审计
