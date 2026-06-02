import { describe, expect, it } from 'vitest';

import { createDefaultMenuFormModel } from '../menu/menuConstants';
import { normalizeMenuType, normalizeRoleCodes } from '../menu/menuNormalizer';
import { buildMenuPayload, buildMenuSql, extractSqlText } from '../menu/menuSql';
import { collectBranchExpandableIds, collectDescendantIds, flattenMenus } from '../menu/menuTree';
import {
  buildDeleteMenuPrompt,
  buildMenuDebugInfo,
  buildMenuStats,
  buildMenuSubmitMessage,
  buildSaveMenuSqlMetaItems,
  extractMenuTreeResponse,
} from '../menu/menuView';

describe('menu domain', () => {
  it('normalizes menu type and role codes', () => {
    expect(normalizeMenuType('catalog')).toBe('dir');
    expect(normalizeMenuType('button')).toBe('button');
    expect(normalizeRoleCodes(['admin', 'admin', ''])).toEqual(['admin']);
  });

  it('builds menu payload and sql from form data', () => {
    const formData = {
      ...createDefaultMenuFormModel(),
      menuCode: 'sqlDir',
      menuType: 'dir',
      title: '测试sqlDir',
      path: '/sqlDir',
      routeName: 'sqlDir',
      roleCodes: ['super_admin'],
    };

    const payload = buildMenuPayload(formData, normalizeMenuType);
    const sql = buildMenuSql(formData, normalizeMenuType);

    expect(payload.menuType).toBe('dir');
    expect(payload.componentCode).toBeUndefined();
    expect(sql.fullSql).toContain('INSERT INTO `sys_menu`');
    expect(sql.fullSql).toContain('INSERT INTO `sys_role_menu`');
    expect(extractSqlText({ data: { fullSql: sql.fullSql } })).toBe(sql.fullSql);
  });

  it('handles tree helpers', () => {
    const tree = [
      {
        id: 1,
        title: 'root',
        children: [
          { id: 2, title: 'child', children: [] },
        ],
      },
    ];

    expect(flattenMenus(tree).length).toBe(2);
    expect(collectDescendantIds(tree, 1)).toEqual([2]);
    expect(collectBranchExpandableIds(tree)).toEqual([1]);
  });

  it('handles menu view helpers', () => {
    const tree = [
      {
        id: 1,
        title: 'root',
        isEnabled: true,
        hidden: false,
        children: [
          { id: 2, title: 'child', isEnabled: false, hidden: true, children: [] },
        ],
      },
    ];

    expect(extractMenuTreeResponse({ data: tree })).toEqual(tree);
    expect(buildMenuStats(tree)).toEqual({
      total: 2,
      enabled: 1,
      hidden: 1,
      leaf: 1,
    });
    expect(buildMenuDebugInfo({
      menuTree: tree,
      visibleMenus: tree,
      renderedMenus: [{ id: 1 }, { id: 2 }],
      expandedMenuIds: new Set([1]),
    })).toMatchObject({
      rootCount: 1,
      visibleCount: 2,
      renderedCount: 2,
      expandedCount: 1,
    });
    expect(buildSaveMenuSqlMetaItems({ menuId: 1, menuCode: 'sqlDir' })).toEqual([
      { label: '菜单ID', value: 1 },
      { label: '菜单编码', value: 'sqlDir' },
    ]);
    expect(buildMenuSubmitMessage({ isEditing: false, hasSql: true })).toBe('菜单已创建，后端已返回标准 SQL');
    expect(buildDeleteMenuPrompt({ title: 'root', children: [{ id: 2 }] })).toMatchObject({
      title: '删除菜单',
      hasChildren: true,
    });
  });
});
