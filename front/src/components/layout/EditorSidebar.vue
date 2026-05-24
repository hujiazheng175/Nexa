<template>
  <aside class="editor-sidebar" :class="{ collapsed: isCollapsed }">
    <template v-if="isCollapsed">
      <!-- Collapsed state -->
      <div class="collapsed-header">
        <button class="collapsed-logo" @click="backToHome" title="返回首页">
        <img src="@/utils/logo.png" alt="Nexa" />
      </button>
        <button class="collapse-toggle" @click="toggleCollapse" title="展开侧边栏">
          <ChevronLeft class="h-4 w-4" />
        </button>
      </div>

      <div class="collapsed-actions">
        <button class="collapsed-create" @click="$emit('create')" title="新建笔记">
          <Plus class="h-4 w-4" />
        </button>
      </div>

      <div class="collapsed-notes">
        <button
          v-for="note in sidebarNotes.slice(0, 10)"
          :key="note.id"
          class="collapsed-note-item"
          :class="{ active: selectedNoteId === note.id }"
          @click="selectNote(note.id)"
          :title="note.title || '无标题'"
        >
          <FileText class="h-4 w-4" />
        </button>
      </div>
    </template>

    <template v-else>
      <!-- Expanded state -->
      <div class="expanded-header">
        <button class="back-btn" @click="backToHome">
          <ChevronLeft class="h-4 w-4" />
          <span>返回</span>
        </button>
        <button class="collapse-btn" @click="toggleCollapse" title="折叠侧边栏">
          <ChevronLeft class="h-4 w-4" />
        </button>
      </div>

      <!-- Search -->
      <div class="sidebar-search">
        <div class="search-wrapper">
          <Search class="search-icon" />
          <input
            class="search-input"
            placeholder="搜索..."
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
          />
        </div>
      </div>

      <!-- Create -->
      <div class="sidebar-create">
        <button class="create-btn" @click="$emit('create')">
          <Plus class="h-3.5 w-3.5" />
          新建笔记
        </button>
      </div>

      <!-- Notes list -->
      <div class="sidebar-notes">
        <button class="section-header" @click="isExpanded = !isExpanded">
          <ChevronDown class="section-chevron" :class="{ collapsed: !isExpanded }" />
          笔记列表
        </button>

        <div v-if="isExpanded" class="note-items">
          <div
            v-for="note in sidebarNotes"
            :key="note.id"
            class="note-item-wrapper"
          >
            <button
              class="note-item"
              :class="{ active: selectedNoteId === note.id }"
              @click="selectNote(note.id)"
            >
              <FileText class="h-3.5 w-3.5 shrink-0 text-muted" />
              <span class="truncate">{{ note.title || '无标题' }}</span>
            </button>
            <button
              class="note-item-delete"
              @click="$emit('delete', note.id)"
              title="删除笔记"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <p class="footer-text">{{ sidebarNotes.length }} 篇笔记</p>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Plus, FileText, ChevronLeft, ChevronDown, Trash2 } from 'lucide-vue-next'
import { noteApi } from '@/api/note'

const props = defineProps({
  notes: { type: Array, required: true },
  selectedNoteId: { type: String, default: '' },
  searchQuery: { type: String, default: '' },
  isCollapsed: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'create', 'update:searchQuery', 'toggleCollapse', 'back', 'delete'])

const isExpanded = ref(true)
const sidebarNotes = ref([])

const loadSidebarNotes = async () => {
  try {
    const data = await noteApi.getAll({
      keyword: props.searchQuery || undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    })
    sidebarNotes.value = data?.records || []
  } catch (error) {
    console.error('加载侧边栏笔记失败:', error)
  }
}

const selectNote = (id) => emit('select', id)
const toggleCollapse = () => emit('toggleCollapse')
const backToHome = () => emit('back')

onMounted(() => {
  loadSidebarNotes()
})

defineExpose({
  loadSidebarNotes
})
</script>

<style scoped>
.editor-sidebar {
  flex-shrink: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border-light);
  background-color: var(--color-background);
  transition: width var(--duration-normal) var(--ease-smooth);
}

.editor-sidebar.collapsed {
  width: 56px;
}

.editor-sidebar:not(.collapsed) {
  width: 224px;
}

/* Collapsed state */
.collapsed-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

.collapsed-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: transparent;
  transition: background-color var(--duration-normal) var(--ease-smooth);
}

.collapsed-logo img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.collapsed-logo:hover {
  background-color: var(--color-primary-hover);
}

.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: none;
  color: var(--color-text-secondary);
  transition: all var(--duration-fast) var(--ease-smooth);
}

.collapse-toggle:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.collapse-toggle svg {
  transform: rotate(180deg);
}

.collapsed-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
}

.collapsed-create {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: none;
  color: var(--color-primary);
  transition: all var(--duration-fast) var(--ease-smooth);
}

.collapsed-create:hover {
  background-color: rgba(79, 124, 255, 0.1);
}

.collapsed-notes {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
}

.collapsed-note-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: none;
  color: var(--color-text-muted);
  transition: all var(--duration-fast) var(--ease-smooth);
}

.collapsed-note-item:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.collapsed-note-item.active {
  background-color: rgba(79, 124, 255, 0.08);
  color: var(--color-text-primary);
}

/* Expanded state */
.expanded-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.back-btn:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: none;
  color: var(--color-text-secondary);
  transition: all var(--duration-fast) var(--ease-smooth);
}

.collapse-btn:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.sidebar-search {
  padding: 0 12px 8px;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  height: 32px;
  padding: 0 10px 0 30px;
  border: 1px solid transparent;
  border-radius: 8px;
  background-color: rgba(15, 23, 42, 0.04);
  font-size: 13px;
  color: var(--color-text-primary);
  transition: all var(--duration-normal) var(--ease-smooth);
}

.search-input:focus {
  background-color: var(--color-card);
  border-color: var(--color-border);
  box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.sidebar-create {
  padding: 0 12px 12px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  background-color: rgba(79, 124, 255, 0.1);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  transition: background-color var(--duration-normal) var(--ease-smooth);
}

.create-btn:hover {
  background-color: rgba(79, 124, 255, 0.15);
}

.sidebar-notes {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: none;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.section-header:hover {
  color: var(--color-text-primary);
}

.section-chevron {
  width: 12px;
  height: 12px;
  transition: transform var(--duration-normal) var(--ease-smooth);
}

.section-chevron.collapsed {
  transform: rotate(-90deg);
}

.note-items {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.note-item-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.note-item-wrapper:hover .note-item-delete {
  opacity: 1;
  visibility: visible;
}

.note-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  color: rgba(31, 41, 55, 0.8);
  background: none;
  text-align: left;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.note-item:hover {
  background-color: rgba(15, 23, 42, 0.04);
}

.note-item.active {
  background-color: rgba(79, 124, 255, 0.08);
  color: var(--color-text-primary);
}

.note-item-delete {
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
  visibility: hidden;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
  flex-shrink: 0;
  position: absolute;
  right: 4px;
}

.note-item-delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.sidebar-footer {
  border-top: 1px solid var(--color-border-light);
  padding: 10px 16px;
}

.footer-text {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
