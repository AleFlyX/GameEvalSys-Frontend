import { defineMock } from "vite-plugin-mock-dev-server";

let roleMap = ['super_admin', 'admin', 'scorer', 'normal'];
let devices = ["Windows/Chrome", "null"]
const generateData = () => {
  let tmpList = [];
  for (let i = 0; i <= 10; i++) {
    tmpList.push({
      "id": i,
      "username": "user_" + i,
      "name": "user" + i,
      "role": roleMap[i % 4],
      "isEnabled": true,
      "onlineCount": 2,
      "device": devices[i % 2],
      "loginLocation": "CN/Guangdong/Shenzhen",
      "lastActiveAt": "2026-04-29T08:12:00Z",
      "lastLoginAt": "2026-04-29T08:00:00Z"
    },
    )
  }
  return tmpList;
}

export default defineMock({
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
    }
  }
})
