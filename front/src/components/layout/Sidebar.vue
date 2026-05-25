<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="@/utils/logo.png" alt="Nexa" class="logo-icon" />
      <span class="logo-text">Nexa</span>
    </div>

    <!-- Search -->
    <div class="sidebar-search">
      <div class="search-wrapper">
        <Search class="search-icon" />
        <input
          class="search-input"
          placeholder="搜索笔记..."
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
        />
      </div>
    </div>

    <!-- Create Note Button -->
    <div class="sidebar-create">
      <button class="create-btn" @click="$emit('create')">
        <Plus class="h-4 w-4" />
        新建笔记
      </button>
    </div>

    <!-- Navigation -->
    <div class="sidebar-nav">
      <!-- Recent Notes -->
      <div class="nav-section">
        <button class="section-header" @click="isRecentExpanded = !isRecentExpanded">
          <ChevronDown
            class="section-chevron"
            :class="{ collapsed: !isRecentExpanded }"
          />
          <Clock class="h-3 w-3" />
          最近编辑
        </button>

        <div v-if="isRecentExpanded" class="section-items">
          <div
            v-for="note in recentNotes"
            :key="note.id"
            class="nav-item-wrapper"
          >
            <button
              class="nav-item"
              :class="{ active: selectedNoteId === note.id }"
              @click="$emit('select', note.id)"
            >
              <FileText class="h-4 w-4 shrink-0 text-muted" />
              <span class="truncate">{{ note.title || '无标题' }}</span>
            </button>
            <button
              class="nav-item-delete"
              @click="$emit('delete', note.id)"
              title="删除笔记"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- All Notes -->
      <div class="nav-section">
        <div class="section-header static">
          <FileText class="h-3 w-3" />
          全部笔记
        </div>
        <div class="section-items">
          <div
            v-for="note in sidebarNotes"
            :key="note.id"
            class="nav-item-wrapper"
          >
            <button
              class="nav-item"
              :class="{ active: selectedNoteId === note.id }"
              @click="$emit('select', note.id)"
            >
              <FileText class="h-4 w-4 shrink-0 text-muted" />
              <span class="truncate">{{ note.title || '无标题' }}</span>
            </button>
            <button
              class="nav-item-delete"
              @click="$emit('delete', note.id)"
              title="删除笔记"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <p class="footer-text">{{ sidebarNotes.length }} 篇笔记</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, FileText, Clock, ChevronDown, Trash2 } from 'lucide-vue-next'
import { noteApi } from '@/api/note'

const props = defineProps({
  notes: {
    type: Array,
    required: true
  },
  selectedNoteId: {
    type: String,
    default: ''
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

defineEmits(['select', 'create', 'update:searchQuery', 'delete'])

const isRecentExpanded = ref(true)
const sidebarNotes = ref([])

const recentNotes = computed(() => {
  return sidebarNotes.value.slice(0, 5)
})

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

onMounted(() => {
  loadSidebarNotes()
})

defineExpose({
  loadSidebarNotes
})
</script>

<style scoped>
.sidebar {
  flex-shrink: 0;
  width: 256px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border-light);
  background-color: var(--color-background);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  object-fit: contain;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.sidebar-search {
  padding: 0 12px 12px;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 12px 0 36px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background-color: rgba(15, 23, 42, 0.04);
  font-size: 13px;
  color: var(--color-text-primary);
  transition: all var(--duration-normal) var(--ease-smooth);
}

.search-input:hover {
  background-color: rgba(15, 23, 42, 0.06);
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
  padding: 0 12px 16px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  background-color: rgba(79, 124, 255, 0.1);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  transition: background-color var(--duration-normal) var(--ease-smooth);
}

.create-btn:hover {
  background-color: rgba(79, 124, 255, 0.15);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.nav-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: none;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.section-header:hover {
  color: var(--color-text-primary);
}

.section-header.static {
  cursor: default;
}

.section-header.static:hover {
  color: var(--color-text-secondary);
}

.section-chevron {
  width: 12px;
  height: 12px;
  transition: transform var(--duration-normal) var(--ease-smooth);
}

.section-chevron.collapsed {
  transform: rotate(-90deg);
}

.section-items {
  margin-top: 4px;
}

.nav-item-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.nav-item-wrapper:hover .nav-item-delete {
  opacity: 1;
  visibility: visible;
}

.nav-item {
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

.nav-item:hover {
  background-color: rgba(15, 23, 42, 0.04);
}

.nav-item.active {
  background-color: rgba(79, 124, 255, 0.08);
  color: var(--color-text-primary);
}

.nav-item-delete {
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

.nav-item-delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.sidebar-footer {
  border-top: 1px solid var(--color-border-light);
  padding: 12px 20px;
}

.footer-text {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
