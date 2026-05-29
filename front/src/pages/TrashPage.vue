<template>
  <div class="trash-page">
    <!-- Sidebar -->
    <aside class="trash-sidebar">
      <div class="sidebar-header">
        <button class="sidebar-back" @click="router.push('/')">
          <ChevronLeft class="h-4 w-4" />
          <span>返回</span>
        </button>
      </div>
      <div class="sidebar-title-row">
        <Trash2 class="h-4 w-4" />
        <span>回收站</span>
      </div>
    </aside>

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
          <div class="header-right">
            <div class="search-wrapper">
              <Search class="search-icon" />
              <input
                v-model="searchQuery"
                class="search-input"
                placeholder="搜索回收站..."
              />
            </div>
            <button
              v-if="trashedNotes.length > 0"
              class="empty-all-btn"
              @click="handleEmptyTrash"
            >
              清空回收站
            </button>
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
            <div class="trash-card-content" @click="handlePreview(note)">
              <h3 class="trash-card-title">{{ note.title || '无标题' }}</h3>
              <p class="trash-card-preview">{{ extractPreview(note.content) }}</p>
              <div class="trash-card-meta">
                <Clock class="h-3 w-3" />
                <span>删除于 {{ formatDate(note.deletedAt) }}</span>
                <span v-if="note.remainingDays != null" class="trash-card-retention">
                  · {{ formatRemaining(note.remainingDays) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="trash-card-actions">
              <button
                class="action-btn action-btn-restore"
                title="恢复"
                @click.stop="doRestore(note.id)"
              >
                <RotateCcw class="h-4 w-4" />
                <span>恢复</span>
              </button>
              <button
                class="action-btn action-btn-delete"
                title="永久删除"
                @click.stop="handlePermanentDelete(note.id)"
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

    <!-- Read-only Preview Overlay -->
    <div v-if="previewNote" class="preview-backdrop" @click.self="closePreview">
      <div class="preview-panel">
        <div class="preview-header">
          <button class="preview-close" @click="closePreview">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="preview-body">
          <h2 class="preview-title">{{ previewNote.title || '无标题' }}</h2>
          <div class="preview-meta">
            <Clock class="h-3 w-3" />
            <span>删除于 {{ formatDate(previewNote.deletedAt) }}</span>
            <span v-if="previewNote.remainingDays != null">
              · {{ formatRemaining(previewNote.remainingDays) }}
            </span>
          </div>

          <div class="preview-divider" />

          <div
            class="preview-content"
            v-html="previewNote.content || '<p style=\'color: var(--color-text-muted)\'>无内容</p>'"
          />
        </div>

        <div class="preview-footer">
          <button class="preview-btn preview-btn-primary" @click="doRestore(previewNote.id)">
            <RotateCcw class="h-4 w-4" />
            恢复
          </button>
          <button class="preview-btn preview-btn-danger" @click="handlePermanentDelete(previewNote.id)">
            <Trash2 class="h-4 w-4" />
            永久删除
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog for Permanent Delete -->
    <ConfirmDialog
      ref="confirmDialogRef"
      title="确认永久删除"
      message="此操作不可恢复，确定要永久删除这篇笔记吗？"
      @confirm="onConfirmPermanentDelete"
    />

    <!-- Confirm Dialog for Empty Trash -->
    <ConfirmDialog
      ref="emptyTrashDialogRef"
      title="确认清空回收站"
      message="此操作将永久删除回收站中的所有笔记，不可恢复。确定继续吗？"
      @confirm="onConfirmEmptyTrash"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Clock,
  RotateCcw,
  Trash2,
  ArchiveX,
  Search,
  X,
  ChevronLeft
} from 'lucide-vue-next'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { noteApi } from '@/api/note'
import { extractPreview } from '@/utils/html'

const router = useRouter()

const trashedNotes = ref([])
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const pageSize = 10
const searchQuery = ref('')
let searchTimer = null

const hasMore = computed(() => trashedNotes.value.length < total.value)

const loadTrashedNotes = async () => {
  loading.value = true
  currentPage.value = 1
  trashedNotes.value = []
  try {
    const params = { page: currentPage.value, size: pageSize }
    if (searchQuery.value) {
      params.keyword = searchQuery.value
    }
    const data = await noteApi.getTrash(params)
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
    const params = { page: currentPage.value, size: pageSize }
    if (searchQuery.value) {
      params.keyword = searchQuery.value
    }
    const data = await noteApi.getTrash(params)
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

const doRestore = async (id) => {
  try {
    await noteApi.restore(id)
    closePreview()
    await loadTrashedNotes()
    window.$toast?.show('笔记已恢复')
  } catch (error) {
    console.error('恢复笔记失败:', error)
    window.$toast?.show('恢复失败')
  }
}

const previewNote = ref(null)

const handlePreview = (note) => {
  previewNote.value = note
}

const closePreview = () => {
  previewNote.value = null
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
    closePreview()
    await loadTrashedNotes()
    window.$toast?.show('笔记已永久删除')
  } catch (error) {
    console.error('永久删除失败:', error)
    window.$toast?.show('删除失败')
  }
}

const emptyTrashDialogRef = ref(null)

const handleEmptyTrash = () => {
  emptyTrashDialogRef.value?.show()
}

const onConfirmEmptyTrash = async () => {
  try {
    await noteApi.emptyTrash()
    await loadTrashedNotes()
    window.$toast?.show('回收站已清空')
  } catch (error) {
    console.error('清空回收站失败:', error)
    window.$toast?.show('清空失败')
  }
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

const formatRemaining = (days) => {
  if (days === 0) return '即将清除'
  return `${days} 天后自动清除`
}

watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadTrashedNotes()
  }, 300)
})

onMounted(() => {
  loadTrashedNotes()
})

onUnmounted(() => {
  clearTimeout(searchTimer)
})
</script>

<style scoped>
.trash-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.trash-sidebar {
  flex-shrink: 0;
  width: 220px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(15, 23, 42, 0.04);
  background: rgba(245, 247, 250, 0.5);
}

.trash-sidebar .sidebar-header {
  padding: 20px 16px 12px;
}

.trash-sidebar .sidebar-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.trash-sidebar .sidebar-back:hover {
  background: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.trash-sidebar .sidebar-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.trash-sidebar .sidebar-title-row svg {
  color: var(--color-text-muted);
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  width: 200px;
  height: 34px;
  padding: 0 12px 0 36px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background-color: rgba(15, 23, 42, 0.04);
  font-size: 13px;
  color: var(--color-text-primary);
  outline: none;
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

.empty-all-btn {
  height: 34px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.empty-all-btn:hover {
  border-color: var(--color-error);
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.04);
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

/* Preview Overlay */
.preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.preview-panel {
  width: 640px;
  max-width: calc(100vw - 64px);
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background-color: var(--color-card);
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.16);
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.preview-header {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 0;
}

.preview-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.preview-close:hover {
  background-color: rgba(15, 23, 42, 0.06);
  color: var(--color-text-primary);
}

.preview-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px 24px;
}

.preview-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.preview-divider {
  height: 1px;
  margin: 20px 0;
  background-color: var(--color-border-light);
}

.preview-content {
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-text-primary);
}

.preview-content :deep(p) {
  margin: 0 0 12px;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3) {
  margin: 20px 0 8px;
  font-weight: 600;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  margin: 0 0 12px;
  padding-left: 20px;
}

.preview-content :deep(li) {
  margin-bottom: 4px;
}

.preview-content :deep(blockquote) {
  margin: 12px 0;
  padding-left: 12px;
  border-left: 2px solid var(--color-border);
  color: var(--color-text-secondary);
}

.preview-content :deep(code) {
  font-size: 13px;
  background-color: rgba(15, 23, 42, 0.05);
  padding: 1px 4px;
  border-radius: 4px;
}

.preview-content :deep(pre) {
  margin: 12px 0;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background-color: rgba(15, 23, 42, 0.04);
  overflow-x: auto;
}

.preview-content :deep(pre code) {
  background: none;
  padding: 0;
}

.preview-content :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-sm);
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 32px;
  border-top: 1px solid var(--color-border-light);
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 24px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.preview-btn-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.preview-btn-primary:hover {
  opacity: 0.9;
}

.preview-btn-danger {
  background: none;
  color: var(--color-text-secondary);
}

.preview-btn-danger:hover {
  border-color: var(--color-error);
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.04);
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
