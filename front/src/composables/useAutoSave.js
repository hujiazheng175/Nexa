import { ref, computed, watch, onUnmounted } from 'vue'

/**
 * Document save status
 */
export const SAVE_STATUS = {
  LOADING: 'loading',
  EDITING: 'editing',
  UNSAVED: 'unsaved',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
  EMPTY: 'empty'
}

/**
 * Auto-save composable for note editor.
 *
 * Manages debounced auto-save, save status, and flush-on-leave.
 * Decoupled from page logic for reuse and testability.
 *
 * @param {object} options
 * @param {import('vue').Ref} options.note - ref to current note object { id, title, content }
 * @param {Function} options.saveFn - async (id, { title, content }) => void
 * @param {number} [options.debounceMs=800] - debounce delay
 * @param {number} [options.flushTimeout=300] - max wait time on flush
 * @returns {object} save status and controls
 */
export function useAutoSave({ note, saveFn, debounceMs = 800, flushTimeout = 300 }) {
  const status = ref(SAVE_STATUS.LOADING)
  const lastSavedAt = ref(null)
  const lastError = ref(null)

  // Track the content/title that was last successfully saved
  let lastSavedTitle = ''
  let lastSavedContent = ''
  let saveTimer = null
  let hasUnsavedChanges = false

  /**
   * Check if current note differs from last saved state
   */
  const hasChanges = computed(() => {
    if (!note.value) return false
    return note.value.title !== lastSavedTitle || note.value.content !== lastSavedContent
  })

  /**
   * Determine current status label for display
   */
  const statusLabel = computed(() => {
    if (!note.value) return ''
    const title = note.value.title || ''
    const content = note.value.content || ''
    const isTrulyEmpty = !title.trim() && !content.trim() && status.value !== SAVE_STATUS.SAVED

    switch (status.value) {
      case SAVE_STATUS.LOADING:
        return '加载中...'
      case SAVE_STATUS.SAVING:
        return '保存中...'
      case SAVE_STATUS.SAVED:
        if (isTrulyEmpty) return '未保存'
        return formatLastSaved(lastSavedAt.value)
      case SAVE_STATUS.ERROR:
        return `保存失败：${lastError.value || '未知错误'}`
      case SAVE_STATUS.UNSAVED:
        return '未保存'
      case SAVE_STATUS.EDITING:
        return ''
      default:
        return ''
    }
  })

  /**
   * Perform the actual save
   */
  const doSave = async () => {
    if (!note.value || !note.value.id) return false

    status.value = SAVE_STATUS.SAVING
    lastError.value = null

    try {
      await saveFn(note.value.id, {
        title: note.value.title || '无标题',
        content: note.value.content || ''
      })
      // Record what was saved
      lastSavedTitle = note.value.title || ''
      lastSavedContent = note.value.content || ''
      lastSavedAt.value = new Date()
      hasUnsavedChanges = false
      status.value = SAVE_STATUS.SAVED
      return true
    } catch (error) {
      lastError.value = error?.message || '网络错误'
      status.value = SAVE_STATUS.ERROR
      return false
    }
  }

  /**
   * Debounced trigger for auto-save
   */
  const triggerSave = () => {
    clearTimeout(saveTimer)
    hasUnsavedChanges = true
    // Show unsaved state immediately while debouncing
    if (status.value === SAVE_STATUS.SAVED) {
      status.value = SAVE_STATUS.UNSAVED
    }

    saveTimer = setTimeout(async () => {
      await doSave()
    }, debounceMs)
  }

  /**
   * Immediate save (bypasses debounce).
   * Waits up to flushTimeout ms for pending debounce.
   * @returns {Promise<boolean>} true if saved successfully
   */
  const flush = async () => {
    clearTimeout(saveTimer)
    if (!hasUnsavedChanges) return true
    return await doSave()
  }

  /**
   * Reset state when switching to a different note
   */
  const reset = () => {
    clearTimeout(saveTimer)
    saveTimer = null
    hasUnsavedChanges = false
    lastSavedTitle = note.value?.title || ''
    lastSavedContent = note.value?.content || ''
    lastSavedAt.value = null
    lastError.value = null
    status.value = SAVE_STATUS.LOADING
  }

  /**
   * Mark as saved (e.g., after initial load)
   */
  const markSaved = () => {
    lastSavedTitle = note.value?.title || ''
    lastSavedContent = note.value?.content || ''
    lastSavedAt.value = new Date()
    hasUnsavedChanges = false
    status.value = SAVE_STATUS.SAVED
  }

  /**
   * Mark as error (e.g., after load failure)
   */
  const markError = (msg) => {
    lastError.value = msg
    status.value = SAVE_STATUS.ERROR
  }

  /**
   * Watch for title changes
   */
  watch(() => note.value?.title, () => {
    if (note.value && status.value !== SAVE_STATUS.LOADING) {
      triggerSave()
    }
  })

  /**
   * Watch for content changes
   */
  watch(() => note.value?.content, () => {
    if (note.value && status.value !== SAVE_STATUS.LOADING) {
      triggerSave()
    }
  })

  /**
   * Cleanup on unmount
   */
  onUnmounted(() => {
    clearTimeout(saveTimer)
  })

  return {
    status,
    statusLabel,
    lastSavedAt,
    lastError,
    hasChanges,
    triggerSave,
    flush,
    reset,
    markSaved,
    markError
  }
}

/**
 * Format "last saved" time for display
 */
function formatLastSaved(date) {
  if (!date) return '未保存'
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 10) return '刚刚保存'
  if (seconds < 60) return `${seconds} 秒前保存`
  if (minutes < 60) return `${minutes} 分钟前保存`
  if (hours < 24) return `${hours} 小时前保存`
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
