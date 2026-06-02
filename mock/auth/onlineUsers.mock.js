import { defineMock } from "vite-plugin-mock-dev-server";

let roleMap = ['super_admin', 'admin', 'scorer', 'normal'];
let devices = ["Windows/Chrome", "null"];

const generateData = () => {
  let tmpList = [];
  for (let i = 0; i <= 10; i++) {
    tmpList.push({
      "id": i,
      "username": "user_" + i,
      "name": "user" + i,
      "role": roleMap[i % 4],
      "isEnabled": i % 5 === 0 ? false : true,          // 每 5 个中 1 个禁用，用于验证 overview 统计
      "onlineCount": i % 3 === 0 ? 0 : (i % 2 === 0 ? 1 : 2), // 模拟不同在线状态
      "device": devices[i % 2],
      "loginLocation": "CN/Guangdong/Shenzhen",
      "lastActiveAt": "2026-04-29T08:12:00Z",
      "lastLoginAt": "2026-04-29T08:00:00Z"
    });
  }
  return tmpList;
};

/**
 * 根据生成的 mock 数据计算全量概览统计
 * 仅在 mock 层使用，生产环境由后端 SQL 聚合
 */
const computeOverview = (role, isEnabled, onlineOnly) => {
  const all = generateData(); // 实际项目中应模拟全量数据，此处仅作结构示例
  const filtered = all.filter((row) => {
    if (role && row.role !== role) return false;
    if (isEnabled !== undefined && isEnabled !== null && row.isEnabled !== isEnabled) return false;
    if (onlineOnly && row.onlineCount <= 0) return false;
    return true;
  });
  return {
    totalUsers: filtered.length,
    onlineUserCount: filtered.filter((r) => r.onlineCount > 0).length,
    activeSessionCount: filtered.reduce((sum, r) => sum + r.onlineCount, 0),
    disabledUserCount: filtered.filter((r) => !r.isEnabled).length,
  };
};

export default defineMock([
  {
    url: '/api/v1/admin/online-users',
    method: 'GET',
    body: () => {
      return {
        "code": 200,
        "message": "查询成功",
        "data": {
          "list": generateData(),
          "total": 20,
          "page": 1,
          "size": 10
        }
      };
    }
  },
  {
    url: '/api/v1/admin/online-users/overview',
    method: 'GET',
    body: ({ query }) => {
      const role = query?.role || undefined;
      const isEnabled = query?.isEnabled !== undefined ? query.isEnabled === 'true' : undefined;
      const onlineOnly = query?.onlineOnly !== undefined ? query.onlineOnly === 'true' : true;
      const overview = computeOverview(role, isEnabled, onlineOnly);
      return {
        "code": 200,
        "message": "查询成功",
        "data": overview
      };
    }
  }
]);
