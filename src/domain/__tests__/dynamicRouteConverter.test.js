import { describe, it, expect } from 'vitest';
import { convertBackendNodes } from '../dynamicRouteConverter';

describe('convertBackendNodes', () => {
  it('converts a simple tree with componentCode correctly', () => {
    const data = [
      {
        menuCode: 'home',
        path: '/home',
        routeName: 'home',
        title: '首页',
        componentCode: 'normal-home',
        children: [
          {
            menuCode: 'sub',
            path: '/home/sub',
            routeName: 'homeSub',
            title: '子页面',
            componentCode: 'normal-sub',
          },
        ],
      },
    ];

    const mapComponent = (code) => {
      if (!code) return null;
      return () => code;
    };

    const records = convertBackendNodes(data, mapComponent);
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBe(2);
    const home = records.find((r) => r.name === 'home');
    const sub = records.find((r) => r.name === 'homeSub');
    expect(home.path).toBe('home');
    expect(home.meta.title).toBe('首页');
    expect(typeof home.component === 'function' || home.component).toBeTruthy();
    expect(sub.path).toBe('home/sub');
    expect(sub.meta.title).toBe('子页面');
  });

  it('falls back to RouterView when no componentCode for group nodes', () => {
    const data = [
      {
        menuCode: 'parent',
        path: '/parent',
        routeName: 'parent',
        title: 'Parent',
        // no componentCode
        children: [
          { menuCode: 'leaf', path: '/parent/leaf', routeName: 'leaf', title: 'Leaf', componentCode: 'leaf-comp' },
        ],
      },
    ];

    const mapComponent = (code) => (code ? () => code : null);
    const records = convertBackendNodes(data, mapComponent);
    expect(records.length).toBe(1);
    expect(records[0].name).toBe('leaf');
  });

  it('keeps absolute-like child paths from being prefixed by parent path', () => {
    const data = [
      {
        menuCode: 'scoringRoot',
        path: '/scoring',
        routeName: 'scoringRoot',
        title: '打分项目列表',
        children: [
          {
            menuCode: 'projectScoring',
            path: ':projectId',
            routeName: 'projectScoring',
            title: '项目打分',
            componentCode: 'normal-project-scoring',
          },
        ],
      },
      {
        menuCode: 'reviewerGroupList',
        path: '/admin/reviewer-group',
        routeName: 'reviewerGroupList',
        title: '评审队伍管理',
        children: [
          {
            menuCode: 'reviewerGroupAdd',
            path: 'admin/reviewer-groups/add',
            routeName: 'reviewerGroupAdd',
            title: '评审队伍添加',
            componentCode: 'admin-reviewer-group-upsert',
          },
        ],
      },
    ];

    const records = convertBackendNodes(data, (code) => (code ? () => code : null));
    const scoringDetail = records.find((r) => r.name === 'projectScoring');
    const reviewerAdd = records.find((r) => r.name === 'reviewerGroupAdd');
    expect(scoringDetail.path).toBe('scoring/:projectId');
    expect(reviewerAdd.path).toBe('admin/reviewer-groups/add');
  });
});
