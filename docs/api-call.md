# 课题项目打分系统 API 文档

## 文档说明

- 基础路径：`/api/v1`
- 数据格式：请求/响应均为 JSON
- 状态码：
  - 200：请求成功
  - 400：参数错误
  - 401：未授权/Token 失效
  - 403：权限不足
  - 404：资源不存在
  - 500：服务器内部错误
- 通用响应格式：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {}
  }
  ```

## 1. 认证模块

### 1.1 登录

- **接口地址**：`/auth/login`
- **请求方式**：POST
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | username | string | 是 | 用户名 |
  | password | string | 是 | 密码 |
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userInfo": {
        "id": 1,
        "username": "admin",
        "role": "super_admin",
        "name": "超级管理员"
      }
    }
  }
  ```

### 1.2 退出登录

- **接口地址**：`/auth/logout`
- **请求方式**：POST
- **请求头**：`Authorization: Bearer {token}`
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "退出成功",
    "data": null
  }
  ```

## 2. 用户管理模块（超级管理员/管理员）

### 2.1 创建用户

- **接口地址**：`/users`
- **请求方式**：POST
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | username | string | 是 | 用户名（唯一） |
  | password | string | 是 | 密码 |
  | name | string | 是 | 真实姓名 |
  | role | string | 是 | 角色（super_admin/admin/scorer/normal） |
  | isEnabled | boolean | 否 | 是否启用（默认true） |
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "创建成功",
    "data": {
      "id": 2,
      "username": "scorer01",
      "name": "打分员01",
      "role": "scorer",
      "isEnabled": true,
      "createTime": "2026-01-27 10:00:00"
    }
  }
  ```

### 2.2 编辑用户

- **接口地址**：`/users/{userId}`
- **请求方式**：PUT
- **请求头**：`Authorization: Bearer {token}`
- **路径参数**：`userId` - 用户ID
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | name | string | 否 | 真实姓名 |
  | role | string | 否 | 角色 |
  | isEnabled | boolean | 否 | 是否启用 |
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "编辑成功",
    "data": null
  }
  ```

### 2.3 删除用户

- **接口地址**：`/users/{userId}`
- **请求方式**：DELETE
- **请求头**：`Authorization: Bearer {token}`
- **路径参数**：`userId` - 用户ID
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "删除成功",
    "data": null
  }
  ```

### 2.4 获取用户列表

- **接口地址**：`/users`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**（Query）：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | page | number | 否 | 页码（默认1） |
  | size | number | 否 | 每页条数（默认10） |
  | role | string | 否 | 角色筛选 |
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "查询成功",
    "data": {
      "list": [
        {
          "id": 1,
          "username": "admin",
          "name": "超级管理员",
          "role": "super_admin",
          "isEnabled": true,
          "createTime": "2026-01-27 09:00:00"
        }
      ],
      "total": 1,
      "page": 1,
      "size": 10
    }
  }
  ```

## 3. 打分标准管理模块（管理员）

### 3.1 创建打分标准

- **接口地址**：`/scoring-standards`
- **请求方式**：POST
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | indicators | array | 是 | 指标列表 |
  | indicators[].name | string | 是 | 指标名称 |
  | indicators[].description | string | 否 | 指标说明 |
  | indicators[].minScore | number | 是 | 分值最小值 |
  | indicators[].maxScore | number | 是 | 分值最大值 |
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "创建成功",
    "data": {
      "id": 1,
      "indicators": [
        {
          "id": 1,
          "name": "复杂程度",
          "description": "课题的技术复杂程度",
          "minScore": 1,
          "maxScore": 5
        }
      ],
      "createTime": "2026-01-27 10:30:00"
    }
  }
  ```

### 3.2 获取打分标准列表

- **接口地址**：`/scoring-standards`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "查询成功",
    "data": [
      {
        "id": 1,
        "indicators": [
          {
            "id": 1,
            "name": "复杂程度",
            "description": "课题的技术复杂程度",
            "minScore": 1,
            "maxScore": 5
          }
        ],
        "createTime": "2026-01-27 10:30:00"
      }
    ]
  }
  ```

### 3.3 获取单个打分标准详情

- **接口地址**：`/scoring-standards/{standardId}`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **路径参数**：`standardId` - 标准ID
- **响应示例**：同上（单个标准详情）

## 4. 项目管理模块（管理员）

### 4.1 创建项目

- **接口地址**：`/projects`
- **请求方式**：POST
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | name | string | 是 | 项目名称 |
  | description | string | 否 | 项目描述 |
  | startDate | string | 是 | 起始日期（YYYY-MM-DD） |
  | endDate | string | 是 | 结束日期（YYYY-MM-DD） |
  | isEnabled | boolean | 否 | 是否启用（默认true） |
  | standardId | number | 是 | 关联打分标准ID |
  | groupIds | array | 是 | 关联小组ID列表 |
  | scorerIds | array | 是 | 可参与打分的用户ID列表 |
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "创建成功",
    "data": {
      "id": 1,
      "name": "2026中期答辩",
      "description": "2026年度中期答辩打分",
      "startDate": "2026-03-01",
      "endDate": "2026-03-15",
      "status": "not_started",
      "isEnabled": true,
      "standardId": 1,
      "groupId": [1, 2],
      "scorerIds": [2, 3],
      "creatorId": 1,
      "createTime": "2026-01-27 11:00:00"
    }
  }
  ```

### 4.2 编辑项目

- **接口地址**：`/projects/{projectId}`
- **请求方式**：PUT
- **请求头**：`Authorization: Bearer {token}`
- **路径参数**：`projectId` - 项目ID
- **请求参数**：同创建项目（非必填）
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "编辑成功",
    "data": null
  }
  ```

### 4.3 结束项目

- **接口地址**：`/projects/{projectId}/end`
- **请求方式**：POST
- **请求头**：`Authorization: Bearer {token}`
- **路径参数**：`projectId` - 项目ID
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "项目已结束",
    "data": null
  }
  ```

### 4.4 获取项目列表

- **接口地址**：`/projects`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**（Query）：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | page | number | 否 | 页码（默认1） |
  | size | number | 否 | 每页条数（默认10） |
  | status | string | 否 | 项目状态（not_started/ongoing/ended） |
  | isEnabled | boolean | 否 | 是否启用 |
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "查询成功",
    "data": {
      "list": [
        {
          "id": 1,
          "name": "2026中期答辩",
          "status": "not_started",
          "isEnabled": true,
          "startDate": "2026-03-01",
          "endDate": "2026-03-15"
        }
      ],
      "total": 1,
      "page": 1,
      "size": 10
    }
  }
  ```

### 4.5 获取单个项目详情

- **接口地址**：`/projects/{projectId}`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **路径参数**：`projectId` - 项目ID
- **响应示例**：同创建项目响应（完整详情）

### 4.6 获取当前用户授权的项目列表

- **接口地址**：`/projects/authorized`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **响应示例**：同上（列表格式）

## 5. 小组管理模块（管理员）

### 5.1 创建小组

- **接口地址**：`/groups`
- **请求方式**：POST
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | name | string | 是 | 小组名称 |
  | projectId | number | 是 | 关联项目ID |
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "创建成功",
    "data": {
      "id": 1,
      "name": "第一小组",
      "projectId": 1,
      "createTime": "2026-01-27 11:30:00"
    }
  }
  ```

### 5.2 获取项目关联的小组列表

- **接口地址**：`/projects/{projectId}/groups`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **路径参数**：`projectId` - 项目ID
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "查询成功",
    "data": [
      {
        "id": 1,
        "name": "第一小组",
        "projectId": 1
      }
    ]
  }
  ```

## 6. 打分模块（打分用户）

### 6.1 提交/修改打分

- **接口地址**：`/scoring/records`
- **请求方式**：POST
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | projectId | number | 是 | 项目ID |
  | groupId | number | 是 | 被打分组ID |
  | scores | array | 是 | 各指标打分 |
  | scores[].indicatorId | number | 是 | 指标ID |
  | scores[].score | number | 是 | 打分值 |
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "打分成功",
    "data": {
      "id": 1,
      "projectId": 1,
      "groupId": 1,
      "userId": 2,
      "scores": [
        {
          "indicatorId": 1,
          "score": 4
        },
        {
          "indicatorId": 2,
          "score": 2
        }
      ],
      "totalScore": 6,
      "createTime": "2026-01-27 14:00:00",
      "updateTime": "2026-01-27 14:00:00"
    }
  }
  ```

### 6.2 获取用户对指定小组的打分记录

- **接口地址**：`/scoring/records`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**（Query）：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | projectId | number | 是 | 项目ID |
  | groupId | number | 是 | 小组ID |
- **响应示例**：同上（单个打分记录）

## 7. 统计与导出模块

### 7.1 获取项目打分统计

- **接口地址**：`/projects/{projectId}/statistics`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **路径参数**：`projectId` - 项目ID
- **响应示例**：
  ```json
  {
    "code": 200,
    "message": "查询成功",
    "data": {
      "groupAverage": [
        {
          "groupId": 1,
          "groupName": "第一小组",
          "averageScore": 4.5
        }
      ],
      "indicatorAverage": [
        {
          "indicatorId": 1,
          "indicatorName": "复杂程度",
          "averageScore": 4.2
        }
      ],
      "scorerDistribution": [
        {
          "userId": 2,
          "userName": "打分员01",
          "scoreRange": "4-5分",
          "count": 3
        }
      ]
    }
  }
  ```

### 7.2 导出项目打分数据

- **接口地址**：`/projects/{projectId}/export`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **路径参数**：`projectId` - 项目ID
- **请求参数**（Query）：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | format | string | 否 | 导出格式（excel/csv，默认excel） |
- **响应**：文件流（直接下载）

## 总结

1. **权限控制**：接口权限严格区分超级管理员、管理员、打分用户、普通用户，核心操作需验证token和角色权限。
2. **核心流程**：管理员创建项目→配置打分标准→关联小组和打分用户→打分用户完成打分→管理员查看统计/导出数据。
3. **状态控制**：项目结束后禁止新增/修改打分记录，保证数据的最终性；通过`isEnabled`开关控制项目是否可用。
