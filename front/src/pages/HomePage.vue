<template>
  <div class="home-page">
    <!-- Sidebar -->
    <Sidebar
      ref="sidebarRef"
      :notes="notes"
      :selected-note-id="selectedNoteId"
      :search-query="searchQuery"
      @select="handleSelectNote"
      @create="handleCreateNote"
      @update:search-query="handleSearch"
      @delete="handleDeleteNote"
    />

    <!-- Main Content -->
    <main class="home-main">
      <div class="main-inner">
        <!-- Header -->
        <div class="main-header">
          <div>
            <h1 class="main-title">{{ searchQuery ? '搜索结果' : '全部笔记' }}</h1>
            <p class="main-count">
              {{ displayTotal }} 篇笔记
              <span v-if="searchQuery"> · 包含 "{{ searchQuery }}"</span>
            </p>
          </div>

          <!-- Actions -->
          <div class="main-actions">
            <!-- Sort -->
            <div class="sort-wrapper">
              <button class="sort-btn" @click="toggleSort">
                <SortAsc class="h-4 w-4" />
                <span>{{ sortBy === 'updatedAt' ? '最近编辑' : '按标题' }}</span>
              </button>
            </div>

            <!-- View Mode -->
            <div class="view-toggle">
              <button
                class="view-btn"
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              >
                <Grid3X3 class="h-4 w-4" />
              </button>
              <button
                class="view-btn"
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
              >
                <List class="h-4 w-4" />
              </button>
            </div>

            <!-- Create Note -->
            <button class="btn btn-primary create-btn" @click="handleCreateNote">
              <Plus class="h-4 w-4" />
              <span>新建</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner" />
          <p class="text-muted">加载中...</p>
        </div>

        <!-- Notes Grid/List -->
        <template v-else-if="notes.length === 0">
          <EmptyState @create="handleCreateNote" />
        </template>
        <template v-else-if="filteredNotes.length === 0 && searchQuery">
          <div class="no-results">
            <p class="text-secondary">没有找到匹配的笔记</p>
            <p class="text-muted mt-1 text-sm">尝试使用不同的关键词搜索</p>
          </div>
        </template>
        <template v-else>
          <div
            class="notes-container"
            :class="[viewMode === 'grid' ? 'notes-grid' : 'notes-list']"
          >
            <NoteCard
              v-for="note in filteredNotes"
              :key="note.id"
              :note="note"
              :is-selected="selectedNoteId === note.id"
              @click="handleSelectNote(note.id)"
              @delete="handleDeleteNote"
            />
          </div>

          <!-- Pagination -->
          <div v-if="hasMore" class="pagination-footer">
            <button
              class="load-more-btn"
              :disabled="loadingMore"
              @click="loadMore"
            >
              <span v-if="loadingMore" class="loading-dots" />
              <span v-else>加载更多</span>
            </button>
          </div>
          <div v-else-if="notes.length > 0" class="pagination-footer">
            <p class="no-more-text">已显示全部 {{ displayTotal }} 篇笔记</p>
          </div>
        </template>
      </div>
    </main>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      ref="confirmDialogRef"
      title="移至回收站"
      message="笔记将被移至回收站，15 天后自动清空。可随时从回收站恢复。"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Grid3X3, List, SortAsc } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import NoteCard from '@/components/note/NoteCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { noteApi } from '@/api/note'

const router = useRouter()

const sidebarRef = ref(null)
const notes = ref([])
const total = ref(0)
const selectedNoteId = ref('')
const searchQuery = ref('')
const viewMode = ref('grid')
const sortBy = ref('updatedAt')
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const pageSize = 10

const displayTotal = computed(() => {
  return total.value > 0 ? total.value : notes.value.length
})

const hasMore = computed(() => {
  return notes.value.length < total.value
})

const filteredNotes = computed(() => {
  if (!searchQuery.value) return notes.value
  const query = searchQuery.value.toLowerCase()
  return notes.value.filter(
    (note) =>
      note.title?.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query)
  )
})

const loadNotes = async () => {
  loading.value = true
  currentPage.value = 1
  notes.value = []
  try {
    const data = await noteApi.getList({
      keyword: searchQuery.value || undefined,
      sortBy: sortBy.value,
      sortOrder: 'desc',
      page: currentPage.value,
      size: pageSize
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

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  currentPage.value += 1
  try {
    const data = await noteApi.getList({
      keyword: searchQuery.value || undefined,
      sortBy: sortBy.value,
      sortOrder: 'desc',
      page: currentPage.value,
      size: pageSize
    })
    const newRecords = data?.records || []
    notes.value = [...notes.value, ...newRecords]
    total.value = data?.total || 0
  } catch (error) {
    console.error('加载更多笔记失败:', error)
    currentPage.value -= 1
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => {
  loadNotes()
})

watch([sortBy], () => {
  loadNotes()
})

const handleCreateNote = async () => {
  try {
    const newNote = await noteApi.create({ title: '无标题笔记', content: '' })
    await loadNotes()
    sidebarRef.value?.loadSidebarNotes()
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

const handleSearch = (query) => {
  searchQuery.value = query
  loadNotes()
  sidebarRef.value?.loadSidebarNotes()
}

const toggleSort = () => {
  sortBy.value = sortBy.value === 'updatedAt' ? 'title' : 'updatedAt'
}

const confirmDialogRef = ref(null)
const pendingDeleteId = ref(null)

const handleDeleteNote = (id) => {
  pendingDeleteId.value = id
  confirmDialogRef.value?.show()
}

const onConfirmDelete = async () => {
  const id = pendingDeleteId.value
  if (!id) return
  try {
    await noteApi.delete(id)
    // 删除成功后重新加载列表
    await loadNotes()
    sidebarRef.value?.loadSidebarNotes()
  } catch (error) {
    console.error('删除笔记失败:', error)
  }
}
</script>

<style scoped>
.home-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.home-main {
  flex: 1;
  overflow: auto;
  background-color: var(--color-background);
}

.main-inner {
  max-width: 1024px;
  margin: 0 auto;
  padding: 32px 32px;
}

.main-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
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

.sort-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.sort-btn:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.view-toggle {
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: rgba(15, 23, 42, 0.03);
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border-radius: 8px;
  background: none;
  color: var(--color-text-muted);
  transition: all var(--duration-normal) var(--ease-smooth);
}

.view-btn:hover {
  color: var(--color-text-primary);
}

.view-btn.active {
  background-color: var(--color-card);
  color: var(--color-text-primary);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.create-btn {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: var(--space-16);
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

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
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

.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-32);
  padding-top: var(--space-24);
  border-top: 1px solid var(--color-border);
}

.load-more-btn {
  height: 38px;
  padding: 0 24px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-card);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.load-more-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: rgba(79, 124, 255, 0.04);
}

.load-more-btn:active:not(:disabled) {
  background-color: rgba(79, 124, 255, 0.08);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-dots {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.no-more-text {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

@media (min-width: 768px) {
  .notes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .main-inner {
    padding: 24px 16px;
  }

  .sort-btn span {
    display: none;
  }

  .create-btn span {
    display: none;
  }
}
</style>
