import { useMessage } from '@/composables/useMessage';
import { copyTextToClipboard } from '@/utils/copyText';

/**
 * Shared clipboard helper with message feedback.
 */
export function useClipboard() {
  const message = useMessage();

  /**
   * Copy text to clipboard and optionally show feedback messages.
   * @param {string} text
   * @param {Object} options
   * @param {string} [options.emptyMessage]
   * @param {string} [options.successMessage]
   * @param {string} [options.errorMessage]
   * @returns {Promise<boolean>}
   */
  const copy = async (text, options = {}) => {
    const content = `${text ?? ''}`.trim();
    const {
      emptyMessage = '',
      successMessage = '',
      errorMessage = '复制失败，请手动复制',
    } = options;

    if (!content) {
      if (emptyMessage) {
        message.warning(emptyMessage);
      }
      return false;
    }

    try {
      const copied = await copyTextToClipboard(content);
      if (copied) {
        if (successMessage) {
          message.success(successMessage);
        }
        return true;
      }
    } catch {
      // Fall through to unified error handling below.
    }

    if (errorMessage) {
      message.error(errorMessage);
    }
    return false;
  };

  return {
    copy,
  };
}
