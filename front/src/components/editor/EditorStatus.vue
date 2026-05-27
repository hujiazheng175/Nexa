<template>
  <div class="editor-status">
    <!-- Left: Focus mode toggle -->
    <div class="editor-status-left">
      <button
        class="focus-mode-btn"
        :class="{ active: isFocusMode }"
        :title="isFocusMode ? '退出专注模式 (Esc)' : '进入专注模式 (Cmd/Ctrl+Shift+F)'"
        @click="$emit('toggleFocusMode')"
      >
        <Maximize v-if="!isFocusMode" class="h-4 w-4" />
        <Minimize v-else class="h-4 w-4" />
        <span class="focus-mode-text">
          {{ isFocusMode ? '退出专注模式' : '专注模式' }}
        </span>
      </button>
    </div>

    <!-- Right: Save status -->
    <div class="editor-status-right">
      <div class="editor-status-indicator">
        <span
          class="editor-status-dot"
          :class="dotClass"
        />
        <span class="editor-status-text" :class="{ 'has-error': status === 'error' }">
          <template v-if="status === 'saved' && lastSavedAt">
            {{ formatSaveTime(lastSavedAt) }}
          </template>
          <template v-else-if="statusLabel">{{ statusLabel }}</template>
          <template v-else>&nbsp;</template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Maximize, Minimize } from 'lucide-vue-next'

const props = defineProps({
  status: {
    type: String,
    default: 'loading'
  },
  statusLabel: {
    type: String,
    default: ''
  },
  lastSavedAt: {
    type: [Date, null],
    default: null
  },
  isFocusMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggleFocusMode'])

function formatSaveTime(date) {
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚保存'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前保存`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前保存`
  return '已保存'
}

const dotClass = computed(() => {
  switch (props.status) {
    case 'saving': return 'saving'
    case 'saved': return 'saved'
    case 'error': return 'error'
    case 'loading': return 'loading'
    case 'unsaved': return 'unsaved'
    default: return 'idle'
  }
})
</script>

<style scoped>
.editor-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 var(--space-32);
  border-bottom: 1px solid var(--color-border-light);
}

.editor-status-left {
  display: flex;
  align-items: center;
}

.editor-status-right {
  display: flex;
  align-items: center;
}

.editor-status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Focus mode button */
.focus-mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.focus-mode-btn:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.focus-mode-btn.active {
  background-color: rgba(79, 124, 255, 0.08);
  color: var(--color-primary);
}

.focus-mode-text {
  letter-spacing: 0.01em;
}

/* Save status dots */
.editor-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--color-text-muted);
  opacity: 0.3;
  transition: background-color var(--duration-fast) var(--ease-smooth),
              opacity var(--duration-fast) var(--ease-smooth);
}

.editor-status-dot.saving {
  animation: pulse 1s ease-in-out infinite;
  background-color: var(--color-primary);
  opacity: 1;
}

.editor-status-dot.saved {
  background-color: #22C55E;
  opacity: 1;
}

.editor-status-dot.error {
  background-color: var(--color-error);
  opacity: 1;
}

.editor-status-dot.loading {
  animation: pulse 1.5s ease-in-out infinite;
  background-color: var(--color-text-muted);
  opacity: 1;
}

.editor-status-dot.unsaved {
  background-color: var(--color-warning);
  opacity: 1;
}

.editor-status-text {
  transition: color var(--duration-fast) var(--ease-smooth);
  min-width: 60px;
  text-align: right;
  letter-spacing: 0.01em;
}

.editor-status-text.has-error {
  color: var(--color-error);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
