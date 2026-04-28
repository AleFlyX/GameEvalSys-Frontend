import { defineMock } from "vite-plugin-mock-dev-server"

export default defineMock({
  url: '/api/v1/projects/:projectId/statistics',
  method: 'GET',
  body: {
    "code": 200,
    "message": "查询成功",
    "data": {
      "groupAverage": [
        {
          "groupId": 14,
          "groupName": "小组12",
          "averageScore": 11.40,
          "rawAverageScore": 11.40,
          "normalizedAverageScore": 11.40,
          "processedAverageScore": 11.40,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 10,
          "groupName": "小组8",
          "averageScore": 11.38,
          "rawAverageScore": 11.38,
          "normalizedAverageScore": 11.38,
          "processedAverageScore": 11.38,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 15,
          "groupName": "小组13",
          "averageScore": 11.36,
          "rawAverageScore": 11.35,
          "normalizedAverageScore": 11.36,
          "processedAverageScore": 11.36,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 8,
          "groupName": "小组5",
          "averageScore": 11.35,
          "rawAverageScore": 11.35,
          "normalizedAverageScore": 11.35,
          "processedAverageScore": 11.35,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 7,
          "groupName": "小组4",
          "averageScore": 11.34,
          "rawAverageScore": 11.33,
          "normalizedAverageScore": 11.34,
          "processedAverageScore": 11.34,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 18,
          "groupName": "小组16",
          "averageScore": 11.34,
          "rawAverageScore": 11.34,
          "normalizedAverageScore": 11.34,
          "processedAverageScore": 11.34,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 1,
          "groupName": "小组1",
          "averageScore": 11.33,
          "rawAverageScore": 11.35,
          "normalizedAverageScore": 11.33,
          "processedAverageScore": 11.33,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 12,
          "groupName": "小组10",
          "averageScore": 11.33,
          "rawAverageScore": 11.33,
          "normalizedAverageScore": 11.33,
          "processedAverageScore": 11.33,
          "abnormalCount": 0,
          "sampleSize": 89,
          "validSampleSize": 89
        },
        {
          "groupId": 17,
          "groupName": "小组15",
          "averageScore": 11.33,
          "rawAverageScore": 11.32,
          "normalizedAverageScore": 11.33,
          "processedAverageScore": 11.33,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 19,
          "groupName": "小组17",
          "averageScore": 11.33,
          "rawAverageScore": 11.33,
          "normalizedAverageScore": 11.33,
          "processedAverageScore": 11.33,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 23,
          "groupName": "小组6",
          "averageScore": 11.32,
          "rawAverageScore": 11.32,
          "normalizedAverageScore": 11.32,
          "processedAverageScore": 11.32,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 28,
          "groupName": "小组25",
          "averageScore": 11.32,
          "rawAverageScore": 11.31,
          "normalizedAverageScore": 11.32,
          "processedAverageScore": 11.32,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 29,
          "groupName": "小组26",
          "averageScore": 11.32,
          "rawAverageScore": 11.31,
          "normalizedAverageScore": 11.32,
          "processedAverageScore": 11.32,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 6,
          "groupName": "小组3",
          "averageScore": 11.31,
          "rawAverageScore": 11.31,
          "normalizedAverageScore": 11.31,
          "processedAverageScore": 11.31,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 9,
          "groupName": "小组7",
          "averageScore": 11.30,
          "rawAverageScore": 11.29,
          "normalizedAverageScore": 11.30,
          "processedAverageScore": 11.30,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 22,
          "groupName": "小组20",
          "averageScore": 11.29,
          "rawAverageScore": 11.30,
          "normalizedAverageScore": 11.29,
          "processedAverageScore": 11.29,
          "abnormalCount": 0,
          "sampleSize": 89,
          "validSampleSize": 89
        },
        {
          "groupId": 27,
          "groupName": "小组24",
          "averageScore": 11.29,
          "rawAverageScore": 11.29,
          "normalizedAverageScore": 11.29,
          "processedAverageScore": 11.29,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 2,
          "groupName": "小组2",
          "averageScore": 11.23,
          "rawAverageScore": 11.22,
          "normalizedAverageScore": 11.23,
          "processedAverageScore": 11.23,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 11,
          "groupName": "小组9",
          "averageScore": 11.23,
          "rawAverageScore": 11.23,
          "normalizedAverageScore": 11.23,
          "processedAverageScore": 11.23,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 20,
          "groupName": "小组18",
          "averageScore": 11.21,
          "rawAverageScore": 11.22,
          "normalizedAverageScore": 11.21,
          "processedAverageScore": 11.21,
          "abnormalCount": 0,
          "sampleSize": 89,
          "validSampleSize": 89
        },
        {
          "groupId": 26,
          "groupName": "小组23",
          "averageScore": 11.19,
          "rawAverageScore": 11.19,
          "normalizedAverageScore": 11.19,
          "processedAverageScore": 11.19,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 30,
          "groupName": "小组27",
          "averageScore": 11.17,
          "rawAverageScore": 11.16,
          "normalizedAverageScore": 11.17,
          "processedAverageScore": 11.17,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 13,
          "groupName": "小组11",
          "averageScore": 11.15,
          "rawAverageScore": 11.15,
          "normalizedAverageScore": 11.15,
          "processedAverageScore": 11.15,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 25,
          "groupName": "小组22",
          "averageScore": 11.15,
          "rawAverageScore": 11.14,
          "normalizedAverageScore": 11.15,
          "processedAverageScore": 11.15,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 24,
          "groupName": "小组21",
          "averageScore": 11.14,
          "rawAverageScore": 11.14,
          "normalizedAverageScore": 11.14,
          "processedAverageScore": 11.14,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 16,
          "groupName": "小组14",
          "averageScore": 11.09,
          "rawAverageScore": 11.09,
          "normalizedAverageScore": 11.09,
          "processedAverageScore": 11.09,
          "abnormalCount": 0,
          "sampleSize": 88,
          "validSampleSize": 88
        },
        {
          "groupId": 21,
          "groupName": "小组19",
          "averageScore": 11.02,
          "rawAverageScore": 11.03,
          "normalizedAverageScore": 11.02,
          "processedAverageScore": 11.02,
          "abnormalCount": 0,
          "sampleSize": 89,
          "validSampleSize": 89
        }
      ],
      "indicatorAverage": [
        {
          "indicatorId": 8,
          "indicatorName": "工作量",
          "averageScore": 1.76,
          "rawAverageScore": 1.76,
          "normalizedAverageScore": 1.76,
          "processedAverageScore": 1.76,
          "abnormalCount": 0,
          "sampleSize": 2380,
          "validSampleSize": 2380
        },
        {
          "indicatorId": 9,
          "indicatorName": "难度",
          "averageScore": 1.73,
          "rawAverageScore": 1.73,
          "normalizedAverageScore": 1.73,
          "processedAverageScore": 1.73,
          "abnormalCount": 0,
          "sampleSize": 2380,
          "validSampleSize": 2380
        },
        {
          "indicatorId": 10,
          "indicatorName": "重点和难点",
          "averageScore": 1.71,
          "rawAverageScore": 1.71,
          "normalizedAverageScore": 1.71,
          "processedAverageScore": 1.71,
          "abnormalCount": 0,
          "sampleSize": 2380,
          "validSampleSize": 2380
        },
        {
          "indicatorId": 14,
          "indicatorName": "准备程度",
          "averageScore": 1.71,
          "rawAverageScore": 1.71,
          "normalizedAverageScore": 1.71,
          "processedAverageScore": 1.71,
          "abnormalCount": 0,
          "sampleSize": 2380,
          "validSampleSize": 2380
        },
        {
          "indicatorId": 11,
          "indicatorName": "展示材料",
          "averageScore": 1.69,
          "rawAverageScore": 1.69,
          "normalizedAverageScore": 1.69,
          "processedAverageScore": 1.69,
          "abnormalCount": 0,
          "sampleSize": 2380,
          "validSampleSize": 2380
        },
        {
          "indicatorId": 13,
          "indicatorName": "准确性",
          "averageScore": 1.69,
          "rawAverageScore": 1.69,
          "normalizedAverageScore": 1.69,
          "processedAverageScore": 1.69,
          "abnormalCount": 0,
          "sampleSize": 2380,
          "validSampleSize": 2380
        },
        {
          "indicatorId": 12,
          "indicatorName": "表达能力",
          "averageScore": 0.98,
          "rawAverageScore": 0.98,
          "normalizedAverageScore": 0.98,
          "processedAverageScore": 0.98,
          "abnormalCount": 0,
          "sampleSize": 2380,
          "validSampleSize": 2380
        }
      ],
      "scorerDistribution": [
        { "userId": 1, "userName": 'user1', "scoreRange": '其他', "count": 13 },
        { "userId": 2, "userName": 'user2', "scoreRange": '其他', "count": 11 },
        { "userId": 3, "userName": 'user3', "scoreRange": '其他', "count": 9 },
        { "userId": 4, "userName": 'user4', "scoreRange": '其他', "count": 10 },
        { "userId": 5, "userName": 'user5', "scoreRange": '其他', "count": 7 },
        { "userId": 6, "userName": 'user6', "scoreRange": '其他', "count": 5 },
        { "userId": 7, "userName": 'user7', "scoreRange": '其他', "count": 13 },
        { "userId": 8, "userName": 'user8', "scoreRange": '其他', "count": 7 },
        { "userId": 9, "userName": 'user9', "scoreRange": '其他', "count": 13 },
        { "userId": 10, "userName": 'user10', "scoreRange": '其他', "count": 14},
        { "userId": 11, "userName": 'user11', "scoreRange": '其他', "count": 6 },
        { "userId": 12, "userName": 'user12', "scoreRange": '其他', "count": 14 },
        { "userId": 13, "userName": 'user13', "scoreRange": '其他', "count": 11 },
        { "userId": 14, "userName": 'user14', "scoreRange": '其他', "count": 12 },
        { "userId": 15, "userName": 'user15', "scoreRange": '其他', "count": 8 },
        { "userId": 16, "userName": 'user16', "scoreRange": '其他', "count": 14 },
        { "userId": 17, "userName": 'user17', "scoreRange": '其他', "count": 9 },
        { "userId": 18, "userName": 'user18', "scoreRange": '其他', "count": 10 },
        { "userId": 19, "userName": 'user19', "scoreRange": '其他', "count": 5 },
        { "userId": 20, "userName": 'user20', "scoreRange": '其他', "count": 5 },
        { "userId": 21, "userName": 'user21', "scoreRange": '其他', "count": 9 },
        { "userId": 22, "userName": 'user22', "scoreRange": '其他', "count": 11 },
        { "userId": 23, "userName": 'user23', "scoreRange": '其他', "count": 14 },
        { "userId": 24, "userName": 'user24', "scoreRange": '其他', "count": 8 },
        { "userId": 25, "userName": 'user25', "scoreRange": '其他', "count": 10 },
        { "userId": 26, "userName": 'user26', "scoreRange": '其他', "count": 7 },
        { "userId": 27, "userName": 'user27', "scoreRange": '其他', "count": 11 },
        { "userId": 28, "userName": 'user28', "scoreRange": '其他', "count": 10 },
        { "userId": 29, "userName": 'user29', "scoreRange": '其他', "count": 10 },
      ]
    }
  }
})


