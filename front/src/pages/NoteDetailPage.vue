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
      :note-id="noteId"
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
import { useAutoSave } from '@/composables/useAutoSave'
import { useFocusMode } from '@/composables/useFocusMode'

const route = useRoute()
const router = useRouter()
const noteId = computed(() => route.params.id)

// State
const currentNote = ref(null)
const sidebarNotes = ref([])
const searchQuery = ref('')
const isSidebarCollapsed = ref(false)
const sidebarRef = ref(null)
const isAssistantOpen = ref(true)
const contentRef = ref(null)

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
})

// Reset auto-save state when switching notes
watch(() => route.params.id, (newId, oldId) => {
  if (newId && oldId && newId !== oldId) {
    resetAutoSave()
  }
  if (newId) {
    loadNote(newId)
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
</style>
