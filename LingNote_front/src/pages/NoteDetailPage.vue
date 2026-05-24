<template>
  <div class="editor-page">
    <!-- Sidebar -->
    <EditorSidebar
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

    <!-- Editor -->
    <main class="editor-main">
      <NoteEditor
        v-if="currentNote"
        :title="currentNote.title"
        :content="currentNote.content"
        :on-title-change="handleTitleChange"
        :on-content-change="handleContentChange"
        :is-saving="isSaving"
        :last-saved-at="lastSavedAt"
      />
      <div v-else class="loading-placeholder">
        <p class="text-muted">正在加载...</p>
      </div>
    </main>

    <!-- Assistant Panel -->
    <AssistantPanel
      :is-open="isAssistantOpen"
      @toggle="toggleAssistant"
      :word-count="wordCount"
      :character-count="characterCount"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      ref="confirmDialogRef"
      title="确认删除"
      message="此操作无法撤销，确定要删除这篇笔记吗？"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EditorSidebar from '@/components/layout/EditorSidebar.vue'
import NoteEditor from '@/components/note/NoteEditor.vue'
import AssistantPanel from '@/components/common/AssistantPanel.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { noteApi } from '@/api/note'

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
const isSaving = ref(false)
const lastSavedAt = ref(null)

// Debounce timer for auto-save
let saveTimer = null

const wordCount = computed(() => {
  if (!currentNote.value) return 0
  const text = currentNote.value.content || ''
  const words = text.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(Boolean).length +
    (text.match(/[\u4e00-\u9fa5]/g) || []).length
  return words
})

const characterCount = computed(() => {
  return currentNote.value?.content?.length || 0
})

// Load current note
const loadNote = async (id) => {
  if (!id) return
  try {
    const note = await noteApi.getById(id)
    currentNote.value = note
  } catch (error) {
    console.error('加载笔记失败:', error)
    currentNote.value = null
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

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadNote(newId)
  }
})

// Auto-save with debounce
const triggerSave = () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    if (!currentNote.value || !currentNote.value.id) return
    isSaving.value = true
    try {
      await noteApi.update(currentNote.value.id, {
        title: currentNote.value.title || '无标题',
        content: currentNote.value.content || ''
      })
      lastSavedAt.value = new Date()
      // Refresh sidebar to show updated timestamp
      await loadSidebarNotes()
    } catch (error) {
      console.error('保存笔记失败:', error)
    } finally {
      isSaving.value = false
    }
  }, 1500)
}

// Watch for title/content changes - trigger auto-save
let titleChangeTimer = null
let contentChangeTimer = null

watch(() => currentNote.value?.title, () => {
  if (currentNote.value) {
    clearTimeout(titleChangeTimer)
    titleChangeTimer = setTimeout(() => {
      triggerSave()
    }, 500)
  }
})

watch(() => currentNote.value?.content, () => {
  if (currentNote.value) {
    clearTimeout(contentChangeTimer)
    contentChangeTimer = setTimeout(() => {
      triggerSave()
    }, 500)
  }
})

onUnmounted(() => {
  clearTimeout(saveTimer)
  clearTimeout(titleChangeTimer)
  clearTimeout(contentChangeTimer)
})

// Handlers
const handleTitleChange = (title) => {
  if (currentNote.value) {
    currentNote.value.title = title
  }
}

const handleContentChange = (content) => {
  if (currentNote.value) {
    currentNote.value.content = content
  }
}

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

const confirmDialogRef = ref(null)
const pendingDeleteId = ref(null)

const handleDeleteNote = async (id) => {
  pendingDeleteId.value = id
  confirmDialogRef.value?.show()
}

const onConfirmDelete = async () => {
  const id = pendingDeleteId.value
  if (!id) return
  try {
    await noteApi.delete(id)
    // 删除成功后重新加载侧边栏列表
    sidebarRef.value?.loadSidebarNotes()
    // 如果删除的是当前正在编辑的笔记，返回首页
    if (id === noteId.value) {
      router.push('/')
    }
  } catch (error) {
    console.error('删除笔记失败:', error)
  }
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
  overflow: hidden;
  background-color: var(--color-background);
}

.loading-placeholder {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}
</style>
