<template>
  <div class="note-editor">
    <!-- Save Status -->
    <div class="save-status">
      <div class="save-indicator">
        <span
          class="save-dot"
          :class="{ saving: isSaving, saved: lastSavedAt && !isSaving }"
        />
        <span class="save-text">
          <template v-if="isSaving">保存中...</template>
          <template v-else-if="lastSavedAt">{{ formatLastSaved(lastSavedAt) }}</template>
        </span>
      </div>
    </div>

    <!-- Editor -->
    <div class="editor-scroll">
      <div class="editor-inner">
        <!-- Title -->
        <textarea
          ref="titleRef"
          class="editor-title"
          :value="title"
          @input="onTitleInput"
          @keydown="onTitleKeydown"
          placeholder="无标题"
          rows="1"
        />

        <!-- Divider -->
        <div class="editor-divider" />

        <!-- Content -->
        <textarea
          ref="contentRef"
          class="editor-content"
          :value="content"
          @input="onContentInput"
          placeholder="开始书写..."
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  onTitleChange: { type: Function, required: true },
  onContentChange: { type: Function, required: true },
  isSaving: { type: Boolean, default: false },
  lastSavedAt: { type: [Date, null], default: null }
})

const titleRef = ref(null)
const contentRef = ref(null)

const adjustHeight = (el) => {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

const onTitleInput = (e) => {
  props.onTitleChange(e.target.value)
  nextTick(() => adjustHeight(e.target))
}

const onContentInput = (e) => {
  props.onContentChange(e.target.value)
  nextTick(() => adjustHeight(e.target))
}

const onTitleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    contentRef.value?.focus()
  }
}

watch(() => props.title, () => {
  nextTick(() => adjustHeight(titleRef.value))
}, { immediate: true })

watch(() => props.content, () => {
  nextTick(() => adjustHeight(contentRef.value))
}, { immediate: true })

const formatLastSaved = (date) => {
  if (!date) return ''
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
</script>

<style scoped>
.note-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.save-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 40px;
  padding: 0 32px;
}

.save-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.save-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-text-muted);
  transition: background-color var(--duration-fast) var(--ease-smooth);
}

.save-dot.saving {
  animation: pulse 1s ease-in-out infinite;
  background-color: var(--color-primary);
}

.save-dot.saved {
  background-color: var(--color-success);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.editor-scroll {
  flex: 1;
  overflow-y: auto;
}

.editor-inner {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 32px 32px 128px;
}

.editor-title {
  width: 100%;
  resize: none;
  overflow: hidden;
  background: transparent;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  line-height: 1.2;
  outline: none;
}

.editor-title::placeholder {
  color: rgba(31, 41, 55, 0.4);
}

.editor-divider {
  height: 1px;
  margin: 24px 0;
  background-color: var(--color-border-light);
}

.editor-content {
  width: 100%;
  resize: none;
  background: transparent;
  font-size: 16px;
  line-height: 1.75;
  color: rgba(31, 41, 55, 0.9);
  outline: none;
  min-height: 400px;
}

.editor-content::placeholder {
  color: rgba(31, 41, 55, 0.4);
}
</style>
