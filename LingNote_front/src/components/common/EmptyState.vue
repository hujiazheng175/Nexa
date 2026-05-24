<template>
  <div class="empty-state">
    <div class="empty-content">
      <!-- Icon -->
      <div class="empty-icon">
        <FileText />
      </div>

      <!-- Text -->
      <h2 class="empty-title">开始你的知识之旅</h2>
      <p class="empty-desc">
        创建你的第一篇笔记，记录想法、整理知识，让灵感自然流淌。
      </p>

      <!-- Action -->
      <button class="btn btn-primary" @click="$emit('create')">
        <Plus class="h-4 w-4" />
        新建笔记
      </button>
    </div>
  </div>
</template>

<script setup>
import { FileText, Plus } from 'lucide-vue-next'

defineEmits(['create'])
</script>

<style scoped>
.empty-state {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
  border-radius: var(--radius-md);
  background-color: rgba(15, 23, 42, 0.04);
}

.empty-icon :deep(svg) {
  width: 32px;
  height: 32px;
  color: var(--color-text-muted);
}

.empty-title {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.empty-desc {
  margin-bottom: 32px;
  max-width: 320px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}
</style>
