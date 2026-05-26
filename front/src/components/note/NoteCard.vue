<template>
  <div
    class="note-card"
    :class="{
      'note-card--selected': isSelected,
      'note-card--deleting': isDeleting
    }"
    @click="!isDeleting && $emit('click')"
  >
    <!-- Deleting State: Inline Undo -->
    <template v-if="isDeleting">
      <div class="note-card-undo">
        <span class="note-card-undo-text">已移入回收站</span>
        <span class="note-card-undo-sep">·</span>
        <button class="note-card-undo-link" @click.stop="$emit('undo', note.id)">
          撤销
        </button>
      </div>
    </template>

    <!-- Normal State -->
    <template v-else>
      <div class="note-card-header">
        <FileText class="note-card-icon" />
        <h3 class="note-card-title">
          {{ note.title || '无标题' }}
        </h3>
        <button
          class="note-card-delete"
          @click.stop="$emit('delete', note.id)"
          title="删除笔记"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>

      <p
        v-if="previewText"
        class="note-card-preview"
      >
        {{ previewText }}
      </p>

      <div class="note-card-meta">
        <Clock class="h-3 w-3" />
        <span>{{ formatDate(note.updatedAt) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FileText, Clock, Trash2 } from 'lucide-vue-next'
import { extractPreview } from '@/utils/html'

const props = defineProps({
  note: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click', 'delete', 'undo'])

const PREVIEW_MAX_LENGTH = 120
const previewText = computed(() => extractPreview(props.note.content, PREVIEW_MAX_LENGTH))

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
.note-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background-color: var(--color-card);
  cursor: pointer;
  text-align: left;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.note-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-soft);
}

.note-card--selected {
  border-color: rgba(79, 124, 255, 0.3);
  background-color: rgba(79, 124, 255, 0.05);
  box-shadow: var(--shadow-soft);
}

/* Deleting State */
.note-card--deleting {
  background-color: rgba(255, 255, 255, 0.55);
  border-color: rgba(15, 23, 42, 0.04);
  cursor: default;
  justify-content: center;
}

.note-card--deleting:hover {
  border-color: rgba(15, 23, 42, 0.04);
  box-shadow: none;
}

.note-card-undo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.note-card-undo-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.note-card-undo-sep {
  margin: 0 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.note-card-undo-link {
  padding: 0;
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity var(--duration-fast) var(--ease-smooth);
}

.note-card-undo-link:hover {
  opacity: 0.75;
}

.note-card-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.note-card-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  color: var(--color-text-muted);
}

.note-card-title {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-text-primary);
}

.note-card-delete {
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

.note-card:hover .note-card-delete {
  opacity: 1;
}

.note-card-delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.note-card-preview {
  padding-left: 24px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.note-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 24px;
  font-size: 12px;
  color: rgba(156, 163, 175, 0.7);
}
</style>
