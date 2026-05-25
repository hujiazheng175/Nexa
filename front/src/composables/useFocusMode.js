import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * 专注模式 composable
 * 
 * 提供浏览器全屏功能，让内容真正全屏显示，实现沉浸式创作。
 * 
 * 快捷键：
 * - Cmd/Ctrl + Shift + F: 进入专注模式
 * - Esc: 退出专注模式（由浏览器全屏原生处理）
 * 
 * 使用示例：
 * const { isFocusMode, toggleFocusMode } = useFocusMode()
 */

export function useFocusMode(options = {}) {
  const {
    onEnter,
    onExit
  } = options

  const isFocusMode = ref(false)

  function handleFullscreenChange() {
    const isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement
    )
    if (isFullscreen !== isFocusMode.value) {
      isFocusMode.value = isFullscreen
      if (isFullscreen) {
        onEnter?.()
      } else {
        onExit?.()
      }
    }
  }

  const handleKeydown = (e) => {
    const isCmdOrCtrl = e.metaKey || e.ctrlKey
    // Cmd/Ctrl + Shift + F: 切换专注模式
    if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault()
      toggleFocusMode()
    }
    // Esc 由浏览器全屏原生处理，无需额外监听
  }

  async function enterFocusMode() {
    if (isFocusMode.value) return
    try {
      const docEl = document.documentElement
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen()
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen()
      }
      // fullscreenchange 事件会更新 isFocusMode 状态并触发 onEnter
    } catch (error) {
      console.error('无法进入全屏模式:', error)
    }
  }

  async function exitFocusMode() {
    if (!isFocusMode.value) return
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      }
      // fullscreenchange 事件会更新 isFocusMode 状态并触发 onExit
    } catch (error) {
      console.error('无法退出全屏模式:', error)
    }
  }

  function toggleFocusMode() {
    if (isFocusMode.value) {
      exitFocusMode()
    } else {
      enterFocusMode()
    }
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    window.removeEventListener('keydown', handleKeydown)
    // 如果离开页面时仍在全屏，退出全屏
    if (isFocusMode.value) {
      exitFocusMode()
    }
  })

  return {
    isFocusMode,
    toggleFocusMode,
    enterFocusMode,
    exitFocusMode
  }
}
