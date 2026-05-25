<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <CheckCircle2 v-if="toast.type === 'success'" class="h-4 w-4" />
          <AlertCircle v-if="toast.type === 'error'" class="h-4 w-4" />
          <X v-if="toast.type === 'info'" class="h-4 w-4" />
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { CheckCircle2, AlertCircle, X } from 'lucide-vue-next'

const toasts = ref([])
let nextId = 0

function add(message, type = 'success', duration = 2500) {
  const id = nextId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    remove(id)
  }, duration)
}

function remove(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

defineExpose({ success: (msg) => add(msg, 'success'), error: (msg) => add(msg, 'error') })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  pointer-events: auto;
}

.toast--success {
  border-color: rgba(34, 197, 94, 0.3);
}

.toast--success svg {
  color: var(--color-success);
}

.toast--error {
  border-color: rgba(239, 68, 68, 0.3);
}

.toast--error svg {
  color: var(--color-error);
}

.toast--info {
  border-color: rgba(79, 124, 255, 0.3);
}

.toast--info svg {
  color: var(--color-primary);
}

.toast-message {
  white-space: nowrap;
}

.toast-enter-active {
  transition: all var(--duration-normal) var(--ease-smooth);
}

.toast-leave-active {
  transition: all var(--duration-fast) var(--ease-smooth);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
