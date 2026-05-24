<template>
  <div
    class="group flex w-full flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left transition-all duration-200 cursor-pointer"
    :class="[
      isSelected
        ? 'border-primary/30 bg-primary/5 shadow-sm'
        : 'border-transparent hover:border-border hover:bg-card hover:shadow-sm'
    ]"
    @click="$emit('click')"
  >
    <!-- Title -->
    <div class="flex w-full items-start gap-2">
      <FileText class="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <h3 class="flex-1 text-base font-medium leading-snug text-text-primary">
        {{ note.title || '无标题' }}
      </h3>
      <!-- Delete Button (show on hover) -->
      <button
        class="delete-btn"
        @click.stop="$emit('delete', note.id)"
        title="删除笔记"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>

    <!-- Preview -->
    <p
      v-if="previewText"
      class="line-clamp-2 pl-6 text-sm leading-relaxed text-text-secondary"
    >
      {{ previewText }}
      <span v-if="shouldTruncate">...</span>
    </p>

    <!-- Meta -->
    <div class="flex items-center gap-1.5 pl-6 text-xs text-muted/70">
      <Clock class="h-3 w-3" />
      <span>{{ formatDate(note.updatedAt) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FileText, Clock, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  note: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click', 'delete'])

const previewText = computed(() => {
  const content = props.note.content || ''
  return content
    .replace(/[#*`>\-\[\]()]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 120)
})

const shouldTruncate = computed(() => {
  return (props.note.content || '').length > 120
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  }
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  opacity: 0;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
  flex-shrink: 0;
}

.group:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}
</style>
