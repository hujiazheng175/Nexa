<template>
  <div class="category-node">
    <button class="category-label" @click="toggleCategory">
      <ChevronRight class="category-chevron" :class="{ expanded }" />
      <Folder class="h-3.5 w-3.5" />
      <span class="category-name">{{ category.name }}</span>
      <span
        class="category-count"
        @click.stop="$emit('createNote', category.id)"
        title="新建笔记"
      >
        <span class="count-num">{{ notes.length }}</span>
        <Plus class="count-plus" />
      </span>
    </button>

    <div v-if="expanded" class="category-children">
      <!-- Sub-categories -->
      <CategoryNode
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :selected-note-id="selectedNoteId"
        @select-note="$emit('selectNote', $event)"
        @delete-note="$emit('deleteNote', $event)"
      />

      <!-- Notes -->
      <div
        v-for="note in notes"
        :key="note.id"
        class="note-item"
        :class="{ active: selectedNoteId === note.id }"
        @click="$emit('selectNote', note.id)"
      >
        <FileText class="h-3.5 w-3.5 shrink-0" />
        <span class="truncate">{{ note.title || '无标题' }}</span>
        <button
          class="note-delete"
          @click.stop="$emit('deleteNote', note.id)"
          title="删除"
        >
          <Trash2 class="h-3 w-3" />
        </button>
      </div>

      <!-- Empty -->
      <p v-if="!category.children?.length && notes.length === 0" class="empty-notes">暂无笔记</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import { ChevronRight, Folder, FileText, Trash2, Plus } from 'lucide-vue-next'

defineOptions({ name: 'CategoryNode' })
import { noteApi } from '@/api/note'

const props = defineProps({
  category: { type: Object, required: true },
  selectedNoteId: { type: String, default: '' },
  notesVersion: { type: Number, default: 0 }
})

const emit = defineEmits(['selectNote', 'deleteNote', 'selectCategory', 'createNote'])

const expanded = ref(true)
const notes = ref([])

function toggleCategory() {
  expanded.value = !expanded.value
  emit('selectCategory', props.category.id)
}

const loadNotes = async () => {
  try {
    const data = await noteApi.getList({
      categoryId: props.category.id,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      size: 50
    })
    notes.value = data?.records || []
  } catch {
    notes.value = []
  }
}

watch([() => props.category.id, () => props.notesVersion], loadNotes, { immediate: true })
</script>

<style scoped>
.category-label {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.category-label:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.category-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  margin-left: auto;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.count-num {
  font-size: 11px;
  opacity: 0.4;
  transition: opacity var(--duration-fast) var(--ease-smooth);
}

.count-plus {
  position: absolute;
  width: 12px;
  height: 12px;
  opacity: 0;
  color: var(--color-text-muted);
  transition: opacity var(--duration-fast) var(--ease-smooth);
}

.category-count:hover .count-num {
  opacity: 0;
}

.category-count:hover .count-plus {
  opacity: 1;
}

.category-count:hover {
  background: rgba(15, 23, 42, 0.06);
}

.category-chevron {
  width: 12px;
  height: 12px;
  transition: transform var(--duration-normal) var(--ease-smooth);
  opacity: 0.4;
}

.category-chevron.expanded {
  transform: rotate(90deg);
}

.category-name {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-children {
  padding-left: 20px;
}

.note-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  background: none;
  color: rgba(31, 41, 55, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
  text-align: left;
}

.note-item:hover {
  background-color: rgba(15, 23, 42, 0.04);
}

.note-item.active {
  background-color: rgba(79, 124, 255, 0.08);
  color: var(--color-text-primary);
}

.note-delete {
  display: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  margin-left: auto;
  flex-shrink: 0;
}

.note-item:hover .note-delete {
  display: flex;
}

.note-delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.empty-notes {
  padding: 4px 8px;
  font-size: 12px;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
