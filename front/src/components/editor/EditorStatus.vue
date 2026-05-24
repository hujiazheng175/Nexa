<template>
  <div class="editor-status">
    <div class="editor-status-indicator">
      <span
        class="editor-status-dot"
        :class="dotClass"
      />
      <span class="editor-status-text" :class="{ 'has-error': status === 'error' }">
        <template v-if="statusLabel">{{ statusLabel }}</template>
        <template v-else>&nbsp;</template>
      </span>
      <span v-if="hasChanges && status !== 'saving'" class="unsaved-dot" title="有未保存的更改" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
  hasChanges: {
    type: Boolean,
    default: false
  }
})

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
  justify-content: flex-end;
  min-height: 40px;
  padding: 0 var(--space-32);
  border-bottom: 1px solid var(--color-border-light);
}

.editor-status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  font-size: 12px;
  color: var(--color-text-muted);
}

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

.unsaved-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-warning);
  opacity: 0.8;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
