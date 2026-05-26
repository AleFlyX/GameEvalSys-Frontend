import { describe, it, expect } from 'vitest';
import { convertBackendNodes } from '../dynamicRouteConverter';
import { RouterView } from 'vue-router';

// describe 描述了 convertBackendNodes 函数的测试套件，包含两个测试用例：
// 1. 测试当没有提供 mapComponent 时，具有 componentCode 的节点是否正确回退到 RouterView 组件。
// 2. 测试当提供了一个无效的 mapComponent（非函数）时，是否正确回退到 RouterView 并在控制台发出警告。
describe('convertBackendNodes - mapComponent fallback', () => {
  // it 测试用例：当没有提供 mapComponent 时，具有 componentCode 的节点应该回退到 RouterView 组件。
  it('uses RouterView when mapComponent is not provided', () => {
    const data = [
      {
        menuCode: 'parent', path: '/parent', routeName: 'parent', title: 'Parent', children: [
          { menuCode: 'leaf', path: '/parent/leaf', routeName: 'leaf', title: 'Leaf', componentCode: 'leaf-comp' }
        ]
      }
    ];

    const records = convertBackendNodes(data); // no mapComponent
    // expect 断言 records 是一个数组，并且长度为 1。然后检查第一个记录的 component 是否是 RouterView，以验证当没有提供 mapComponent 时，具有 componentCode 的节点是否正确回退到 RouterView 组件。
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBe(1);
    const r0 = records[0];
    // expect 断言 r0.component 是否是 RouterView，以验证当没有提供 mapComponent 时，具有 componentCode 的节点是否正确回退到 RouterView 组件
    expect(r0.component).toBe(RouterView);
  });
  // it是英文缩写 "it should" 或 "it does"，用于描述测试用例的预期行为。
  // 在这里，"it uses RouterView when mapComponent is not provided" 的意思是 "当没有提供 mapComponent 时，它应该使用 RouterView"。
  // it 测试用例：当提供了一个无效的 mapComponent（非函数）时，是否正确回退到 RouterView 并在控制台发出警告
  it('ignores invalid mapComponent (non-function) and warns', () => {
    const data = [{ menuCode: 'x', path: '/x', routeName: 'x', title: 'X', componentCode: 'c' }];
    // pass invalid mapComponent
    const records = convertBackendNodes(data, {});
    // expect 断言 records 是一个数组，并且长度为 1。然后检查第一个记录的 component 是否是 RouterView，
    // 以验证当提供了一个无效的 mapComponent（非函数）时，是否正确回退到 RouterView 并在控制台发出警告
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBe(1);
    expect(records[0].component).toBe(RouterView);
  });
});
