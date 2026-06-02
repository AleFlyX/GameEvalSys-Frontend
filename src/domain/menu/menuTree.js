const flattenMenus = (nodes = [], depth = 0, collector = [], blockedParentIds = new Set()) => {
  nodes.forEach((node) => {
    collector.push({
      id: node.id,
      label: `${'　'.repeat(depth)}${node.title || node.menuCode || `菜单 ${node.id}`}`,
      disabled: blockedParentIds.has(node.id),
    });

    if (Array.isArray(node.children) && node.children.length) {
      flattenMenus(node.children, depth + 1, collector, blockedParentIds);
    }
  });

  return collector;
};

const collectDescendantIds = (nodes = [], targetId) => {
  const foundIds = [];

  const visit = (list = []) => {
    for (const node of list) {
      if (node.id === targetId) {
        const walkChildren = (children = []) => {
          for (const child of children) {
            foundIds.push(child.id);
            if (Array.isArray(child.children) && child.children.length) {
              walkChildren(child.children);
            }
          }
        };

        walkChildren(node.children || []);
        return true;
      }

      if (Array.isArray(node.children) && node.children.length && visit(node.children)) {
        return true;
      }
    }

    return false;
  };

  visit(nodes);
  return foundIds;
};

const flattenRenderedMenus = (nodes = [], expandedMenuIds = new Set(), depth = 0, collector = []) => {
  nodes.forEach((node) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    collector.push({
      ...node,
      depth,
      hasChildren,
    });

    if (hasChildren && expandedMenuIds.has(node.id)) {
      flattenRenderedMenus(node.children, expandedMenuIds, depth + 1, collector);
    }
  });

  return collector;
};

const collectBranchExpandableIds = (nodes = [], collector = []) => {
  nodes.forEach((node) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    if (hasChildren) {
      collector.push(node.id);
      collectBranchExpandableIds(node.children, collector);
    }
  });

  return collector;
};

const applyStatusFilter = (nodes = [], filterState = { isEnabled: '', hidden: '' }) => {
  return nodes.reduce((acc, node) => {
    const children = applyStatusFilter(node.children || [], filterState);
    const matchesEnabled = filterState.isEnabled === '' || node.isEnabled === filterState.isEnabled;
    const matchesHidden = filterState.hidden === '' || node.hidden === filterState.hidden;

    if (matchesEnabled && matchesHidden) {
      acc.push({ ...node, children });
      return acc;
    }

    if (children.length > 0) {
      acc.push({ ...node, children });
    }

    return acc;
  }, []);
};

const applyKeywordFilter = (nodes = [], keyword = '') => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return nodes;
  }

  const isMatched = (node) => {
    const searchableText = [
      node.title,
      node.menuCode,
      node.path,
      node.routeName,
      node.componentCode,
      node.icon,
      ...(Array.isArray(node.roleCodes) ? node.roleCodes : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedKeyword);
  };

  const walk = (list = []) => {
    return list.reduce((acc, node) => {
      const nextChildren = walk(node.children || []);

      if (isMatched(node)) {
        acc.push({ ...node, children: node.children || [] });
        return acc;
      }

      if (nextChildren.length > 0) {
        acc.push({ ...node, children: nextChildren });
      }

      return acc;
    }, []);
  };

  return walk(nodes);
};

export {
  applyKeywordFilter,
  applyStatusFilter,
  collectBranchExpandableIds,
  collectDescendantIds,
  flattenMenus,
  flattenRenderedMenus,
};

