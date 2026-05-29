<template>
  <div class="editor-page">
    <!-- Sidebar -->
    <EditorSidebar
      v-show="!isFocusMode"
      ref="sidebarRef"
      :notes="sidebarNotes"
      :selected-note-id="noteId"
      :search-query="searchQuery"
      :is-collapsed="isSidebarCollapsed"
      @select="handleSelectNote"
      @create="handleCreateNote"
      @update:search-query="handleSearch"
      @toggle-collapse="toggleSidebar"
      @back="backToHome"
      @delete="handleDeleteNote"
    />

    <!-- Editor Area -->
    <main class="editor-main">
      <template v-if="currentNote">
        <!-- Status Bar -->
        <EditorStatus
          :status="saveStatus"
          :status-label="saveStatusLabel"
          :last-saved-at="saveLastSavedAt"
          :is-focus-mode="isFocusMode"
          @toggle-focus-mode="toggleFocusMode"
        />

        <!-- Editor Shell -->
        <EditorShell :key="noteId">
          <!-- Title -->
          <EditorTitle
            v-model="currentNote.title"
            placeholder="无标题"
            @enter="focusContent"
          />

          <!-- Saved time -->
          <p v-if="saveLastSavedAt" class="editor-save-time">
            {{ formattedSaveTime }}
          </p>

          <!-- Inline Summary: expanded -->
          <div v-if="inlineSummary?.result && summaryExpanded" class="inline-summary">
            <div class="inline-summary-header">
              <Sparkles class="h-3.5 w-3.5" />
              <span>AI 摘要</span>
              <button class="inline-summary-close" @click="summaryExpanded = false" title="收起">
                <ChevronUp class="h-3.5 w-3.5" />
              </button>
            </div>
            <pre class="inline-summary-text">{{ inlineSummary.result }}</pre>
            <div class="inline-summary-footer">
              <span class="inline-summary-time">{{ formattedSummaryTime }}</span>
              <button
                class="inline-summary-regenerate"
                :disabled="summaryGenerating"
                @click="regenerateInlineSummary"
              >
                <Sparkles class="h-3 w-3" />
                重新生成
              </button>
            </div>
          </div>

          <!-- Inline Summary: collapsed -->
          <button
            v-else-if="inlineSummary?.result && !summaryExpanded"
            class="inline-summary-reopen"
            @click="summaryExpanded = true"
          >
            <Sparkles class="h-3.5 w-3.5" />
            <span>AI 摘要</span>
            <span class="inline-summary-hint">已折叠</span>
          </button>

          <!-- Inline Summary: loading -->
          <p v-else-if="summaryGenerating" class="inline-summary-loading">正在生成摘要...</p>

          <!-- Inline Summary: none yet -->
          <button
            v-else
            class="inline-summary-generate"
            @click="generateInlineSummary"
          >
            <Sparkles class="h-3.5 w-3.5" />
            <span>AI 摘要</span>
          </button>

          <!-- Divider -->
          <div class="editor-divider" />

          <!-- Content -->
          <EditorContent
            ref="contentRef"
            v-model="currentNote.content"
            placeholder="开始书写..."
          />
        </EditorShell>
      </template>

      <div v-else class="loading-placeholder">
        <p class="text-muted">正在加载...</p>
      </div>
    </main>

    <!-- Assistant Panel -->
    <AssistantPanel
      v-show="!isFocusMode"
      :is-open="isAssistantOpen"
      @toggle="toggleAssistant"
      :word-count="wordCount"
      :character-count="characterCount"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      ref="confirmDialogRef"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-text="confirmConfirmText"
      @confirm="onConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import EditorSidebar from '@/components/layout/EditorSidebar.vue'
import EditorShell from '@/components/editor/EditorShell.vue'
import EditorTitle from '@/components/editor/EditorTitle.vue'
import EditorContent from '@/components/editor/EditorContent.vue'
import EditorStatus from '@/components/editor/EditorStatus.vue'
import AssistantPanel from '@/components/common/AssistantPanel.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { noteApi } from '@/api/note'
import { aiApi } from '@/api/ai'
import { useAutoSave } from '@/composables/useAutoSave'
import { useFocusMode } from '@/composables/useFocusMode'
import { Sparkles, ChevronUp } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const noteId = computed(() => route.params.id)

// State
const currentNote = ref(null)
const sidebarNotes = ref([])
const searchQuery = ref('')
const isSidebarCollapsed = ref(true)
const sidebarRef = ref(null)
const isAssistantOpen = ref(false)
const contentRef = ref(null)
const inlineSummary = ref(null)
const summaryExpanded = ref(false)
const summaryGenerating = ref(false)

async function regenerateInlineSummary() {
  await generateInlineSummary()
}

async function generateInlineSummary() {
  if (!noteId.value || summaryGenerating.value) return
  summaryGenerating.value = true
  try {
    await aiApi.generateSummary(noteId.value)
    await loadInlineSummary()
    summaryExpanded.value = true
    window.$toast?.show('摘要已生成')
  } catch (err) {
    window.$toast?.show(err.message || '摘要生成失败')
  } finally {
    summaryGenerating.value = false
  }
}

const loadInlineSummary = async () => {
  if (!noteId.value) {
    inlineSummary.value = null
    return
  }
  try {
    const data = await aiApi.getLatestSummary(noteId.value)
    inlineSummary.value = data?.result ? { result: data.result, createdAt: data.createdAt } : null
  } catch {
    inlineSummary.value = null
  }
}

// Auto-save composable
const {
  status: saveStatus,
  statusLabel: saveStatusLabel,
  lastSavedAt: saveLastSavedAt,
  hasChanges: saveHasChanges,
  markSaved,
  markError,
  reset: resetAutoSave,
  flush
} = useAutoSave({
  note: currentNote,
  saveFn: async (id, data) => {
    await noteApi.update(id, data)
    sidebarRef.value?.loadSidebarNotes()
  },
  debounceMs: 800
})

// Focus mode composable
const { isFocusMode, toggleFocusMode } = useFocusMode({
  onEnter: () => {
    // Close assistant when entering focus mode
    isAssistantOpen.value = false
  }
})

const wordCount = computed(() => {
  if (!currentNote.value) return 0
  const text = currentNote.value.content || ''
  const plainText = text.replace(/<[^>]*>/g, '')
  return plainText.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(Boolean).length +
    (plainText.match(/[\u4e00-\u9fa5]/g) || []).length
})

const characterCount = computed(() => {
  const text = currentNote.value?.content || ''
  return text.replace(/<[^>]*>/g, '').length || 0
})

const formattedSaveTime = computed(() => {
  if (!saveLastSavedAt.value) return ''
  const d = saveLastSavedAt.value
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hh}:${mm} 保存`
})

const formattedSummaryTime = computed(() => {
  if (!inlineSummary.value?.createdAt) return ''
  const d = new Date(inlineSummary.value.createdAt)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${hh}:${mm} 生成`
})

const focusContent = () => {
  contentRef.value?.editor?.value?.commands.focus()
}

// Load current note
const loadNote = async (id) => {
  if (!id) return
  try {
    const note = await noteApi.getById(id)
    currentNote.value = note
    // Mark as saved after successful load
    markSaved()
  } catch (error) {
    console.error('加载笔记失败:', error)
    currentNote.value = null
    markError('加载失败')
  }
}

// Load sidebar notes
const loadSidebarNotes = async () => {
  try {
    const data = await noteApi.getList({
      keyword: searchQuery.value || undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    })
    sidebarNotes.value = data?.records || []
  } catch (error) {
    console.error('加载侧边栏笔记列表失败:', error)
    sidebarNotes.value = []
  }
}

onMounted(() => {
  loadNote(noteId.value)
  loadSidebarNotes()
  loadInlineSummary()
})

// Reset auto-save state when switching notes
watch(() => route.params.id, (newId, oldId) => {
  if (newId && oldId && newId !== oldId) {
    resetAutoSave()
  }
  if (newId) {
    loadNote(newId)
    loadInlineSummary()
  }
})

// Watch for save error to show confirmation dialog
const confirmDialogRef = ref(null)
const pendingNavTarget = ref(null)

// Confirm dialog state (for both delete and unsaved-leave)
const confirmTitle = ref('确认删除')
const confirmMessage = ref('此操作无法撤销，确定要删除这篇笔记吗？')
const confirmConfirmText = ref('确认删除')
const confirmAction = ref(null)

const onConfirm = async () => {
  const action = confirmAction.value
  if (action?.type === 'delete') {
    const id = action.id
    if (!id) return
    try {
      await noteApi.delete(id)
      sidebarRef.value?.loadSidebarNotes()
      if (id === noteId.value) {
        router.push('/')
      }
    } catch (error) {
      console.error('删除笔记失败:', error)
    }
  } else if (action?.type === 'leave') {
    // User chose to leave without saving
    pendingNavTarget.value?.()
  }
  confirmAction.value = null
}

// Intercept navigation away from editor page
onBeforeRouteLeave(async (to, from, next) => {
  // Flush any pending auto-save before leaving
  const saved = await flush()
  if (saved) {
    next()
    return
  }

  // Save failed or user cancelled
  // Show confirmation if there are unsaved changes
  if (saveHasChanges) {
    confirmTitle.value = '有未保存的更改'
    confirmMessage.value = '是否放弃更改并离开？'
    confirmConfirmText.value = '放弃并离开'
    confirmAction.value = { type: 'leave' }
    pendingNavTarget.value = next
    confirmDialogRef.value?.show()
    // Block navigation - dialog will call next()
    next(false)
    return
  }

  next()
})

const handleSelectNote = (id) => {
  router.push(`/notes/${id}`)
}

const handleCreateNote = async () => {
  try {
    const newNote = await noteApi.create({ title: '无标题笔记', content: '' })
    if (newNote?.id) {
      sidebarRef.value?.loadSidebarNotes()
      router.push(`/notes/${newNote.id}`)
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  sidebarRef.value?.loadSidebarNotes()
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const toggleAssistant = () => {
  isAssistantOpen.value = !isAssistantOpen.value
}

const backToHome = () => {
  router.push('/')
}

const handleDeleteNote = (id) => {
  confirmTitle.value = '确认删除'
  confirmMessage.value = '此操作无法撤销，确定要删除这篇笔记吗？'
  confirmConfirmText.value = '确认删除'
  confirmAction.value = { type: 'delete', id }
  confirmDialogRef.value?.show()
}
</script>

<style scoped>
.editor-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-background);
}

.loading-placeholder {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.editor-divider {
  height: 1px;
  margin: 24px 0;
  background-color: var(--color-border-light);
}

.editor-save-time {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}

/* Inline Summary Card */
.inline-summary {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: rgba(79, 124, 255, 0.04);
  border: 1px solid rgba(79, 124, 255, 0.08);
}

.inline-summary-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
}

.inline-summary-regenerate {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.inline-summary-regenerate:hover:not(:disabled) {
  color: var(--color-text-secondary);
}

.inline-summary-regenerate:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.inline-summary-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(15, 23, 42, 0.04);
}

.inline-summary-time {
  font-size: 11px;
  color: var(--color-text-muted);
  opacity: 0.6;
}

.inline-summary-close {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: 2px;
  border: none;
  border-radius: 4px;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.inline-summary-close:hover {
  color: var(--color-text-primary);
}

.inline-summary-text {
  margin: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.8;
  color: var(--color-text-secondary);
  white-space: pre-wrap;
  background: none;
}

.inline-summary-reopen {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: rgba(79, 124, 255, 0.04);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.inline-summary-reopen:hover {
  background: rgba(79, 124, 255, 0.08);
  color: var(--color-primary);
}

.inline-summary-hint {
  margin-left: auto;
  opacity: 0.5;
}

.inline-summary-loading {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.inline-summary-generate {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.inline-summary-generate:hover {
  color: var(--color-text-secondary);
}
</style>
