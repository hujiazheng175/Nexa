<template>
  <Transition name="dialog-fade">
    <div v-if="visible" class="confirm-overlay" @click.self="handleCancel">
      <div class="confirm-dialog">
        <!-- Header -->
        <div class="confirm-header">
          <div class="confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 class="confirm-title">{{ title }}</h3>
        </div>

        <!-- Content -->
        <p class="confirm-message">{{ message }}</p>

        <!-- Actions -->
        <div class="confirm-actions">
          <button class="btn btn-secondary" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button class="btn btn-danger" @click="handleConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '确认删除'
  },
  message: {
    type: String,
    default: '此操作无法撤销，确定要继续吗？'
  },
  confirmText: {
    type: String,
    default: '确认删除'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const visible = ref(false)

const show = () => {
  visible.value = true
}

const hide = () => {
  visible.value = false
}

const handleConfirm = () => {
  visible.value = false
  emit('confirm')
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  width: 100%;
  max-width: 420px;
  padding: 24px;
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-dialog);
}

.confirm-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-16);
  margin-bottom: var(--space-16);
}

.confirm-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: rgba(239, 68, 68, 0.08);
  color: var(--color-error);
}

.confirm-icon svg {
  width: 20px;
  height: 20px;
}

.confirm-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.confirm-message {
  margin: 0 0 var(--space-24) 56px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-12);
}

/* Animation */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all var(--duration-normal) var(--ease-smooth);
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .confirm-dialog {
  transform: scale(0.95) translateY(8px);
}

.dialog-fade-leave-to .confirm-dialog {
  transform: scale(0.95) translateY(-8px);
}
</style>
