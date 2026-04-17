const DEFAULT_CATEGORY_NAME = '默认分类';

const normalizeText = (text) => (typeof text === 'string' ? text.trim() : '');

/**
 * 打分标准数据结构映射工具函数
 * @param {number} rawId
 * @returns {number|null}
 */
const normalizePositiveId = (rawId) => {
  const normalized = Number(rawId);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
};

/**
 * 标准化指标数据结构
 * @description 将后端返回的指标数据结构标准化为前端使用的格式
 * @param {Object} indicator
 * @param {Object} options
 * @returns {Object}
 */
const normalizeIndicatorItem = (indicator = {}, options = {}) => {
  const {
    includeCategoryMeta = false,
    categoryId = null,
    categoryName = '',
    categoryDescription = '',
    fallbackDescription = '',
  } = options;
  const normalizedId = normalizePositiveId(indicator?.id);
  const indicatorDescription = normalizeText(indicator?.description);
  const normalized = {
    ...(normalizedId ? { id: normalizedId } : {}),
    name: indicator?.name || '',
    description: indicatorDescription || normalizeText(fallbackDescription),
    minScore: Number(indicator?.minScore ?? 0),
    maxScore: Number(indicator?.maxScore ?? 0),
  };

  if (includeCategoryMeta) {
    const normalizedCategoryId = normalizePositiveId(indicator?.categoryId) || normalizePositiveId(categoryId);
    if (normalizedCategoryId) {
      normalized.categoryId = normalizedCategoryId;
    }
    if (categoryName) {
      normalized.categoryName = categoryName;
    }
    if (normalizeText(categoryDescription)) {
      normalized.categoryDescription = normalizeText(categoryDescription);
    }
  }

  return normalized;
};

/**
 * 标准化分类数据结构
 * @description 将后端返回的分类数据结构标准化为前端使用的格式
 * @param {Object} category
 * @returns {Object}
 */
const normalizeCategoryItem = (category = {}) => {
  const normalizedId = normalizePositiveId(category?.id);
  const categoryName = category?.name || DEFAULT_CATEGORY_NAME;
  const indicators = Array.isArray(category?.indicators)
    ? category.indicators.map((indicator) => normalizeIndicatorItem(indicator))
    : [];

  return {
    ...(normalizedId ? { id: normalizedId } : {}),
    name: categoryName,
    description: category?.description || '',
    indicators,
  };
};

/**
 * 从打分标准详情中提取分类列表
 * @param {Object} standardDetail
 * @returns {Array}
 */
export const getCategoriesFromStandard = (standardDetail = {}) => {
  if (Array.isArray(standardDetail?.categories) && standardDetail.categories.length > 0) {
    return standardDetail.categories.map((category) => normalizeCategoryItem(category));
  }

  const flatIndicators = Array.isArray(standardDetail?.indicators)
    ? standardDetail.indicators.map((indicator) => normalizeIndicatorItem(indicator))
    : [];

  if (!flatIndicators.length) {
    return [];
  }

  return [
    {
      name: DEFAULT_CATEGORY_NAME,
      description: '',
      indicators: flatIndicators,
    },
  ];
};

/**
 * 从打分标准详情中提取指标列表
 * @param {Object} standardDetail
 * @returns {Array}
 */
export const getIndicatorsFromStandard = (standardDetail = {}) => {
  const legacyIndicators = Array.isArray(standardDetail?.indicators)
    ? standardDetail.indicators
    : [];

  const legacyDescriptionById = new Map();
  const legacyDescriptionByName = new Map();
  legacyIndicators.forEach((item) => {
    const legacyDescription = normalizeText(item?.description);
    if (!legacyDescription) return;

    const normalizedId = normalizePositiveId(item?.id);
    if (normalizedId) {
      legacyDescriptionById.set(normalizedId, legacyDescription);
    }

    const normalizedName = normalizeText(item?.name);
    if (normalizedName && !legacyDescriptionByName.has(normalizedName)) {
      legacyDescriptionByName.set(normalizedName, legacyDescription);
    }
  });

  if (Array.isArray(standardDetail?.categories) && standardDetail.categories.length > 0) {
    return standardDetail.categories.flatMap((category) => {
      const categoryName = category?.name || DEFAULT_CATEGORY_NAME;
      const categoryId = category?.id;
      const categoryDescription = normalizeText(category?.description);
      const indicators = Array.isArray(category?.indicators) ? category.indicators : [];

      return indicators.map((indicator) => {
        const normalizedIndicatorId = normalizePositiveId(indicator?.id);
        const normalizedIndicatorName = normalizeText(indicator?.name);

        const fallbackDescription =
          (normalizedIndicatorId ? legacyDescriptionById.get(normalizedIndicatorId) : '') ||
          (normalizedIndicatorName ? legacyDescriptionByName.get(normalizedIndicatorName) : '');

        return normalizeIndicatorItem(indicator, {
          includeCategoryMeta: true,
          categoryId,
          categoryName,
          categoryDescription,
          fallbackDescription,
        });
      });
    });
  }

  if (Array.isArray(standardDetail?.indicators)) {
    return standardDetail.indicators.map((indicator) =>
      normalizeIndicatorItem(indicator, {
        includeCategoryMeta: true,
      })
    );
  }

  return [];
};

/**
 * 构建打分标准提交数据
 * @param {Object} formData
 * @returns {Object}
 */
export const buildScoringStandardPayload = (formData = {}) => {
  return {
    name: (formData?.name || '').trim(),
    categories: getCategoriesFromStandard(formData),
  };
};

export { DEFAULT_CATEGORY_NAME };
