<template>
  <Teleport to="body">
    <div
      v-show="visible"
      class="block-insert-handle"
      :style="{ top: handleTop + 'px', left: handleLeft + 'px' }"
    >
      <button
        type="button"
        class="handle-btn"
        title="插入图片"
        @mousedown.prevent
        @click.stop="triggerFileInput"
      >
        <Plus class="h-3.5 w-3.5" />
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { Plus } from 'lucide-vue-next'
import request from '@/api/request'

const props = defineProps({
  editor: { type: Object, required: true }
})

const visible = ref(false)
const handleTop = ref(0)
const handleLeft = ref(0)

let scrollEl = null

function findScrollEl() {
  if (!props.editor) return null
  return props.editor.view.dom.closest('.editor-shell')
}

function updatePosition() {
  const ed = props.editor
  if (!ed || !ed.isFocused) {
    visible.value = false
    return
  }

  // Hide handle when text is selected — BubbleMenu handles that context
  const { $from, empty } = ed.state.selection
  if (!empty) {
    visible.value = false
    return
  }

  const blockStart = $from.start($from.depth)
  const coords = ed.view.coordsAtPos(blockStart)
  if (!coords) {
    visible.value = false
    return
  }

  handleTop.value = coords.top
  handleLeft.value = coords.left - 36
  visible.value = true
}

function triggerFileInput() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const data = await request.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      props.editor.chain().focus()
        .setImage({ src: data.url })
        .createParagraphNear()
        .run()
      window.$toast?.show('图片已插入')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || '图片上传失败'
      window.$toast?.show(msg)
    }
  }
  input.click()
}

let rafId = null
function scheduleUpdate() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    updatePosition()
  })
}

function setupScrollListener(el) {
  if (scrollEl) {
    scrollEl.removeEventListener('scroll', scheduleUpdate)
  }
  scrollEl = el
  if (scrollEl) {
    scrollEl.addEventListener('scroll', scheduleUpdate, { passive: true })
  }
}

watch(() => props.editor, (ed) => {
  if (!ed) return
  ed.on('selectionUpdate', scheduleUpdate)
  ed.on('focus', () => {
    setupScrollListener(findScrollEl())
    scheduleUpdate()
  })
  ed.on('blur', () => {
    setTimeout(() => {
      if (ed.isFocused) return
      visible.value = false
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', scheduleUpdate)
        scrollEl = null
      }
    }, 200)
  })
}, { immediate: true })

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (scrollEl) scrollEl.removeEventListener('scroll', scheduleUpdate)
})
</script>

<style>
.block-insert-handle {
  position: fixed;
  z-index: 10;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.block-insert-handle[style] {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.handle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: #9CA3AF;
  opacity: 0.35;
  cursor: pointer;
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1),
              color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.handle-btn:hover {
  opacity: 0.9;
  color: #4F7CFF;
}
</style>
