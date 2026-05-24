<template>
  <div class="skeleton" :style="{ width, height }" :class="className" />
</template>

<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '20px' },
  className: { type: String, default: '' }
})
</script>

<style scoped>
.skeleton {
  border-radius: var(--radius-sm);
  background-color: rgba(15, 23, 42, 0.06);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
