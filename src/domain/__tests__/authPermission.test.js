import { describe, expect, it } from 'vitest';

import {
  canAccessRouteByPermissions,
  canAccessRouteByRoles,
  hasAnyIntersection,
  normalizeStringList,
} from '../auth/permission';

describe('auth permission domain', () => {
  it('normalizes string lists', () => {
    expect(normalizeStringList([' admin ', 'admin', null, ''])).toEqual(['admin']);
  });

  it('checks route access by roles and permissions', () => {
    expect(canAccessRouteByRoles(['super_admin'], 'admin')).toBe(false);
    expect(canAccessRouteByRoles([], 'admin')).toBe(true);
    expect(canAccessRouteByPermissions(['menu:sqlDir:view'], ['menu:sqlDir:view', 'menu:home:view'])).toBe(true);
    expect(hasAnyIntersection(['a'], ['b'])).toBe(false);
  });
});

