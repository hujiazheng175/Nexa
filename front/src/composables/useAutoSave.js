/**
 * Auto-save composable for notes
 * Provides debounced auto-save with status tracking
 */
import { ref, computed, watch } from 'vue'

export const SAVE_STATUS = {
  SAVED: 'saved',
  SAVING: 'saving',
  UNSAVED: 'unsaved',
  ERROR: 'error'
}

export function useAutoSave(options = {}) {
  const {
    note = ref(null),
    saveFn = async () => {},
    debounceMs = 800
  } = options

  const status = ref(SAVE_STATUS.SAVED)
  const statusLabel = computed(() => {
    switch (status.value) {
      case SAVE_STATUS.SAVED:
        return '已保存'
      case SAVE_STATUS.SAVING:
        return '保存中...'
      case SAVE_STATUS.UNSAVED:
        return '未保存'
      case SAVE_STATUS.ERROR:
        return '保存失败'
      default:
        return ''
    }
  })

  const lastSavedAt = ref(null)
  const hasChanges = computed(() => {
    return status.value !== SAVE_STATUS.SAVED && status.value !== SAVE_STATUS.SAVING
  })

  let debounceTimer = null

  function markSaved() {
    status.value = SAVE_STATUS.SAVED
    lastSavedAt.value = new Date()
    clearTimer()
  }

  function markError(message = '保存失败') {
    status.value = SAVE_STATUS.ERROR
    clearTimer()
  }

  function reset() {
    status.value = SAVE_STATUS.SAVED
    lastSavedAt.value = null
    clearTimer()
  }

  function clearTimer() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  async function save() {
    if (!note.value?.id) return false

    status.value = SAVE_STATUS.SAVING

    try {
      await saveFn(note.value.id, {
        title: note.value.title,
        content: note.value.content
      })
      markSaved()
      return true
    } catch (error) {
      console.error('自动保存失败:', error)
      markError()
      return false
    }
  }

  function scheduleSave() {
    status.value = SAVE_STATUS.UNSAVED
    clearTimer()
    debounceTimer = setTimeout(() => {
      save()
    }, debounceMs)
  }

  async function flush() {
    clearTimer()
    if (status.value === SAVE_STATUS.UNSAVED) {
      return await save()
    }
    return true
  }

  // Watch for changes in note content
  watch(
    () => [note.value?.title, note.value?.content],
    () => {
      if (note.value) {
        scheduleSave()
      }
    },
    { deep: true }
  )

  return {
    status,
    statusLabel,
    lastSavedAt,
    hasChanges,
    markSaved,
    markError,
    reset,
    save,
    flush
  }
}
