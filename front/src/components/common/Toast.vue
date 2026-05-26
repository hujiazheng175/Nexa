<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
      >
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

function add(message, duration) {
  const id = nextId++
  toasts.value.push({ id, message })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, duration)
}

defineExpose({
  show: (msg) => add(msg, 2500)
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 280px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  pointer-events: auto;
}

.toast-message {
  white-space: nowrap;
}

.toast-enter-active {
  transition: all 200ms var(--ease-smooth);
}

.toast-leave-active {
  transition: all 150ms var(--ease-smooth);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
