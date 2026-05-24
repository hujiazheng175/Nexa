<template>
  <span class="badge" :class="[`badge--${variant}`, { 'badge--small': small }]">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'error'].includes(value)
  },
  small: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
}

.badge--small {
  padding: 1px 6px;
  font-size: 11px;
  border-radius: 10px;
}

.badge--default {
  background-color: rgba(15, 23, 42, 0.06);
  color: var(--color-text-secondary);
}

.badge--primary {
  background-color: rgba(79, 124, 255, 0.1);
  color: var(--color-primary);
}

.badge--success {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.badge--warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.badge--error {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}
</style>
