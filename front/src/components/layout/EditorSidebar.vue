<template>
  <aside class="editor-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Collapsed state -->
    <template v-if="isCollapsed">
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
    </template>

    <!-- Expanded state -->
    <template v-else>
      <!-- Brand -->
      <div class="expanded-brand">
        <router-link to="/" class="brand-link">
          <img src="@/utils/logo.png" alt="Nexa" class="brand-logo" />
          <span class="brand-name">Nexa</span>
        </router-link>
        <button class="collapse-btn" @click="toggleCollapse" title="折叠侧边栏">
          <ChevronLeft class="h-4 w-4" />
        </button>
      </div>

      <!-- New note -->
      <div class="sidebar-create">
        <button class="create-btn" @click="$emit('create')">
          <Plus class="h-3.5 w-3.5" />
          新建笔记
        </button>
      </div>

      <!-- Category tree -->
      <div class="sidebar-tree">
        <CategoryNode
          v-for="cat in categoryTree"
          :key="cat.id + '-' + treeVersion"
          :category="cat"
          :selected-note-id="selectedNoteId"
          :notes-version="notesVersion"
          @select-note="selectNote"
          @delete-note="$emit('delete', $event)"
          @create-note="$emit('createInCategory', $event)"
        />
      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="footer-btn" @click="router.push('/trash')">
          <Trash2 class="h-3.5 w-3.5" />
          <span>回收站</span>
        </button>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, ChevronLeft, Trash2 } from 'lucide-vue-next'
import { categoryApi } from '@/api/category'
import CategoryNode from './CategoryNode.vue'

const router = useRouter()

const props = defineProps({
  selectedNoteId: { type: String, default: '' },
  isCollapsed: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'create', 'toggleCollapse', 'back', 'delete', 'createInCategory'])

const categoryTree = ref([])
const treeVersion = ref(0)
const notesVersion = ref(0)

const loadTree = async () => {
  try {
    categoryTree.value = await categoryApi.tree() || []
    treeVersion.value++
    notesVersion.value++
  } catch {
    categoryTree.value = []
  }
}

const refreshNotes = () => {
  notesVersion.value++
}

onMounted(loadTree)

const selectNote = (id) => emit('select', id)
const toggleCollapse = () => emit('toggleCollapse')
const backToHome = () => emit('back')

defineExpose({ loadTree, refreshNotes })
</script>

<style scoped>
.editor-sidebar {
  flex-shrink: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(15, 23, 42, 0.04);
  background-color: rgba(245, 247, 250, 0.5);
  transition: width var(--duration-normal) var(--ease-smooth);
}

.editor-sidebar.collapsed { width: 40px; }
.editor-sidebar:not(.collapsed) { width: 224px; }

/* Collapsed */
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
  background: none;
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
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.collapse-toggle:hover {
  background-color: rgba(15, 23, 42, 0.06);
  color: var(--color-text-primary);
}

.collapse-toggle svg { transform: rotate(180deg); }

.collapsed-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 8px;
}

.collapsed-create {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--color-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.collapsed-create:hover {
  background-color: rgba(79, 124, 255, 0.1);
}

/* Expanded */
.expanded-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.collapse-btn:hover {
  background-color: rgba(15, 23, 42, 0.06);
  color: var(--color-text-primary);
}

.sidebar-create {
  padding: 0 12px 8px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: rgba(79, 124, 255, 0.08);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-smooth);
}

.create-btn:hover {
  background: rgba(79, 124, 255, 0.12);
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

.footer-btn {
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

.footer-btn:hover {
  color: var(--color-text-primary);
}
</style>
