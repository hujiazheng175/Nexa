<template>
  <div class="trash-page">
    <!-- Sidebar -->
    <Sidebar
      ref="sidebarRef"
      :notes="notes"
      :selected-note-id="null"
      :search-query="''"
      @select="handleSelectNote"
      @create="handleCreateNote"
      @update:search-query="() => {}"
      @delete="handleDeleteNote"
    />

    <!-- Main Content -->
    <main class="trash-main">
      <div class="main-inner">
        <!-- Header -->
        <div class="main-header">
          <div>
            <h1 class="main-title">回收站</h1>
            <p class="main-count">
              {{ total }} 篇笔记 · 15 天后自动清空
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner" />
          <p class="text-muted">加载中...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="trashedNotes.length === 0" class="empty-state">
          <ArchiveX class="empty-icon" />
          <p class="empty-title">回收站为空</p>
          <p class="empty-desc">已删除的笔记会出现在这里</p>
        </div>

        <!-- Trashed Notes List -->
        <div v-else class="trash-list">
          <div
            v-for="note in trashedNotes"
            :key="note.id"
            class="trash-card"
          >
            <!-- Card Content -->
            <div class="trash-card-content" @click="handleSelectNote(note.id)">
              <h3 class="trash-card-title">{{ note.title || '无标题' }}</h3>
              <p class="trash-card-preview">{{ extractPreview(note.content) }}</p>
              <div class="trash-card-meta">
                <Clock class="h-3 w-3" />
                <span>删除于 {{ formatDate(note.deletedAt) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="trash-card-actions">
              <button
                class="action-btn action-btn-restore"
                title="恢复"
                @click="handleRestore(note.id)"
              >
                <RotateCcw class="h-4 w-4" />
                <span>恢复</span>
              </button>
              <button
                class="action-btn action-btn-delete"
                title="永久删除"
                @click="handlePermanentDelete(note.id)"
              >
                <Trash2 class="h-4 w-4" />
                <span>删除</span>
              </button>
            </div>
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
        </div>
      </div>
    </main>

    <!-- Confirm Dialog for Permanent Delete -->
    <ConfirmDialog
      ref="confirmDialogRef"
      title="确认永久删除"
      message="此操作不可恢复，确定要永久删除这篇笔记吗？"
      @confirm="onConfirmPermanentDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Clock,
  RotateCcw,
  Trash2,
  ArchiveX
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { noteApi } from '@/api/note'
import { extractPreview } from '@/utils/html'

const router = useRouter()

const sidebarRef = ref(null)
const notes = ref([])
const trashedNotes = ref([])
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const pageSize = 10

const hasMore = computed(() => trashedNotes.value.length < total.value)

const loadTrashedNotes = async () => {
  loading.value = true
  currentPage.value = 1
  trashedNotes.value = []
  try {
    const data = await noteApi.getTrash({
      page: currentPage.value,
      size: pageSize
    })
    trashedNotes.value = data?.records || []
    total.value = data?.total || 0
  } catch (error) {
    console.error('加载回收站失败:', error)
    trashedNotes.value = []
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
    const data = await noteApi.getTrash({
      page: currentPage.value,
      size: pageSize
    })
    const newRecords = data?.records || []
    trashedNotes.value = [...trashedNotes.value, ...newRecords]
    total.value = data?.total || 0
  } catch (error) {
    console.error('加载更多失败:', error)
    currentPage.value -= 1
  } finally {
    loadingMore.value = false
  }
}

const handleRestore = async (id) => {
  try {
    await noteApi.restore(id)
    await loadTrashedNotes()
    sidebarRef.value?.loadSidebarNotes()
    window.$toast?.success('笔记已恢复')
  } catch (error) {
    console.error('恢复笔记失败:', error)
    window.$toast?.error('恢复失败')
  }
}

const confirmDialogRef = ref(null)
const pendingPermanentDeleteId = ref(null)

const handlePermanentDelete = (id) => {
  pendingPermanentDeleteId.value = id
  confirmDialogRef.value?.show()
}

const onConfirmPermanentDelete = async () => {
  const id = pendingPermanentDeleteId.value
  if (!id) return
  try {
    await noteApi.permanentDelete(id)
    await loadTrashedNotes()
    window.$toast?.success('笔记已永久删除')
  } catch (error) {
    console.error('永久删除失败:', error)
    window.$toast?.error('删除失败')
  }
}

const handleSelectNote = (id) => {
  if (id) {
    router.push(`/notes/${id}`)
  }
}

const handleCreateNote = async () => {
  try {
    const newNote = await noteApi.create({ title: '无标题笔记', content: '' })
    if (newNote?.id) {
      router.push(`/notes/${newNote.id}`)
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

const handleDeleteNote = (id) => {
  noteApi.delete(id)
}

const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadTrashedNotes()
})
</script>

<style scoped>
.trash-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.trash-main {
  flex: 1;
  overflow: auto;
  background-color: var(--color-background);
}

.main-inner {
  max-width: 860px;
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.empty-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.empty-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
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

/* Trash List */
.trash-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trash-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-card);
  transition: all var(--duration-normal) var(--ease-smooth);
}

.trash-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-soft);
}

.trash-card-content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.trash-card-title {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-text-primary);
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trash-card-preview {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.trash-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(156, 163, 175, 0.7);
}

.trash-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.action-btn:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text-primary);
}

.action-btn-restore:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: rgba(79, 124, 255, 0.04);
}

.action-btn-delete:hover {
  border-color: var(--color-error);
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.04);
}

/* Pagination */
.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
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

@media (max-width: 640px) {
  .main-inner {
    padding: 24px 16px;
  }

  .trash-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .trash-card-actions {
    align-self: flex-end;
  }
}
</style>
