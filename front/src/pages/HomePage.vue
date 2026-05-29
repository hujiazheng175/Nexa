<template>
  <div class="home-page">
    <!-- Sidebar: category tree -->
    <aside class="home-sidebar">
      <div class="sidebar-brand">
        <router-link to="/" class="brand-link">
          <img src="@/utils/logo.png" alt="Nexa" class="brand-logo" />
          <span class="brand-name">Nexa</span>
        </router-link>
      </div>

      <div class="sidebar-section-header">
        <span class="sidebar-section-title">笔记本</span>
        <button class="sidebar-add" @click="showNewCategory = !showNewCategory" title="新建笔记本">
          <FolderPlus class="h-3.5 w-3.5" />
        </button>
      </div>

      <div v-if="showNewCategory" class="new-category-row">
        <input
          ref="newCategoryInput"
          v-model="newCategoryName"
          class="new-category-input"
          placeholder="笔记本名称"
          @keydown.enter="createCategory"
          @keydown.escape="showNewCategory = false"
        />
      </div>

      <div class="sidebar-tree">
        <CategoryNode
          v-for="cat in categories"
          :key="cat.id"
          :category="cat"
          :notes-version="sidebarNotesVersion"
          @select-note="handleSelectNote"
          @delete-note="handleDeleteNote"
          @create-note="handleCreateNoteInCategory"
        />
      </div>

      <div class="sidebar-footer">
        <button class="trash-btn" @click="router.push('/trash')">
          <Trash2 class="h-3.5 w-3.5" />
          <span>回收站</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="home-main">
      <div class="main-inner">
        <!-- Header -->
        <div class="main-header">
          <div>
            <h1 class="main-title">全部笔记</h1>
            <p class="main-count">{{ displayTotal }} 篇笔记</p>
          </div>
          <div class="main-actions">
            <!-- Sort -->
            <button class="sort-btn" @click="toggleSort">
              <SortAsc class="h-4 w-4" />
              <span>{{ sortBy === 'updatedAt' ? '最近编辑' : '按标题' }}</span>
            </button>
            <!-- View Mode -->
            <div class="view-toggle">
              <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
                <Grid3X3 class="h-4 w-4" />
              </button>
              <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                <List class="h-4 w-4" />
              </button>
            </div>
            <!-- Create -->
            <button class="btn btn-primary create-btn" @click="handleCreateNote">
              <Plus class="h-4 w-4" />
              <span>新建笔记</span>
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner" />
          <p class="text-muted">加载中...</p>
        </div>
        <template v-else-if="notes.length === 0">
          <EmptyState @create="handleCreateNote" />
        </template>
        <template v-else>
          <div v-for="group in groupedNotes" :key="group.categoryId || '__uncategorized__'" class="note-group">
            <div class="group-header">
              <BookOpen class="h-4 w-4" />
              <span>{{ group.categoryName }}</span>
              <span class="group-count">{{ group.notes.length }}</span>
            </div>
            <div :class="[viewMode === 'grid' ? 'notes-grid' : 'notes-list']">
              <NoteCard
                v-for="note in group.notes"
                :key="note.id"
                :note="note"
                :is-selected="selectedNoteId === note.id"
                :is-deleting="deletingNoteIds.includes(note.id)"
                @click="handleSelectNote(note.id)"
                @delete="handleDeleteNote"
                @undo="handleUndoDelete"
              />
            </div>
          </div>
        </template>

      </div>
    </main>

    <ConfirmDialog
      ref="confirmDialogRef"
      title="移至回收站"
      message="笔记将被移至回收站，15 天后自动清空。可随时从回收站恢复。"
      confirm-text="移至回收站"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Grid3X3, List, SortAsc, FolderPlus, BookOpen, Trash2 } from 'lucide-vue-next'
import NoteCard from '@/components/note/NoteCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import CategoryNode from '@/components/layout/CategoryNode.vue'
import { noteApi } from '@/api/note'
import { categoryApi } from '@/api/category'

const router = useRouter()

const categories = ref([])
const sidebarNotesVersion = ref(0)
const showNewCategory = ref(false)
const newCategoryName = ref('')
const newCategoryInput = ref(null)

const notes = ref([])
const total = ref(0)
const selectedNoteId = ref('')
const viewMode = ref('grid')
const sortBy = ref('updatedAt')
const loading = ref(false)

const displayTotal = computed(() => total.value > 0 ? total.value : notes.value.length)

function flattenCategories(tree, map = {}) {
  for (const cat of tree) {
    map[cat.id] = cat.name
    if (cat.children?.length) flattenCategories(cat.children, map)
  }
  return map
}

const groupedNotes = computed(() => {
  const nameMap = flattenCategories(categories.value)
  const groups = {}
  for (const note of notes.value) {
    const cid = note.categoryId || '__uncategorized__'
    if (!groups[cid]) groups[cid] = { categoryId: cid, categoryName: cid === '__uncategorized__' ? '未分类' : (nameMap[cid] || '未分类'), notes: [] }
    groups[cid].notes.push(note)
  }
  return Object.values(groups)
})

const loadCategories = async () => {
  try {
    const data = await categoryApi.tree()
    categories.value = data || []
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = []
  }
}

const loadNotes = async () => {
  loading.value = true
  notes.value = []
  try {
    const data = await noteApi.getList({
      sortBy: sortBy.value,
      sortOrder: 'desc',
      page: 1,
      size: 100
    })
    notes.value = data?.records || []
    total.value = data?.total || 0
  } catch (error) {
    console.error('加载笔记失败:', error)
    notes.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadNotes()
})

onUnmounted(() => {
  Object.values(deletingTimers).forEach(clearTimeout)
})

watch([sortBy], () => {
  loadNotes()
})

const createCategory = async () => {
  const name = newCategoryName.value.trim()
  if (!name) return
  try {
    await categoryApi.create(name, null)
    newCategoryName.value = ''
    showNewCategory.value = false
    await loadCategories()
  } catch (error) {
    console.error('创建分类失败:', error)
  }
}

const handleCreateNoteInCategory = async (categoryId) => {
  try {
    const newNote = await noteApi.create({
      title: '无标题笔记',
      content: '',
      categoryId
    })
    sidebarNotesVersion.value++
    await loadNotes()
    if (newNote?.id) {
      router.push(`/notes/${newNote.id}`)
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

const handleCreateNote = async () => {
  try {
    const newNote = await noteApi.create({ title: '无标题笔记', content: '' })
    await loadNotes()
    if (newNote?.id) {
      router.push(`/notes/${newNote.id}`)
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

const handleSelectNote = (id) => {
  selectedNoteId.value = id
  router.push(`/notes/${id}`)
}

const toggleSort = () => {
  sortBy.value = sortBy.value === 'updatedAt' ? 'title' : 'updatedAt'
}

watch(showNewCategory, async (val) => {
  if (val) {
    await nextTick()
    newCategoryInput.value?.focus()
  }
})

const confirmDialogRef = ref(null)
const pendingDeleteId = ref(null)
const deletingNoteIds = ref([])
const deletingTimers = {}

const handleDeleteNote = (id) => {
  pendingDeleteId.value = id
  confirmDialogRef.value?.show()
}

const onConfirmDelete = async () => {
  const id = pendingDeleteId.value
  if (!id) return
  try {
    await noteApi.delete(id)
    sidebarNotesVersion.value++
    deletingNoteIds.value.push(id)
    deletingTimers[id] = setTimeout(() => {
      deletingNoteIds.value = deletingNoteIds.value.filter(did => did !== id)
      notes.value = notes.value.filter(n => n.id !== id)
      total.value = Math.max(0, total.value - 1)
      delete deletingTimers[id]
    }, 5000)
  } catch (error) {
    console.error('删除笔记失败:', error)
  }
}

const handleUndoDelete = async (id) => {
  try {
    await noteApi.restore(id)
    clearTimeout(deletingTimers[id])
    delete deletingTimers[id]
    deletingNoteIds.value = deletingNoteIds.value.filter(did => did !== id)
    sidebarNotesVersion.value++
    loadNotes()
  } catch (e) {
    console.error('恢复笔记失败:', e)
  }
}
</script>

<style scoped>
.home-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.home-sidebar {
  flex-shrink: 0;
  width: 220px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(15, 23, 42, 0.04);
  background: rgba(245, 247, 250, 0.5);
}

.sidebar-brand {
  padding: 20px 16px 12px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-logo {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  object-fit: contain;
}

.brand-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.sidebar-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px;
}

.sidebar-section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sidebar-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.sidebar-add:hover {
  background: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.new-category-row {
  padding: 0 16px 8px;
}

.new-category-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 6px;
  font-size: 13px;
  color: var(--color-text-primary);
  background: var(--color-card);
  outline: none;
}

.new-category-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.1);
}

.sidebar-tree {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.sidebar-footer {
  border-top: 1px solid rgba(15, 23, 42, 0.04);
  padding: 10px 16px;
}

.sidebar-footer .trash-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.sidebar-footer .trash-btn:hover {
  color: var(--color-text-primary);
}

/* Main */
.home-main {
  flex: 1;
  height: 100%;
  overflow: auto;
  background-color: var(--color-background);
}

.main-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 32px 80px;
}

.main-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.main-title {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.main-count {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.main-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.note-group {
  margin-bottom: 40px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.group-header svg {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.group-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.sort-btn:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.view-toggle {
  display: flex;
  padding: 2px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.view-btn.active {
  background: var(--color-card);
  color: var(--color-text-primary);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.create-btn {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-16);
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

@media (min-width: 768px) {
  .notes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .main-inner {
    padding: 24px 16px 80px;
  }
}
</style>
