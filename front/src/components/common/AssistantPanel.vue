<template>
  <!-- Closed state: narrow strip with expand button -->
  <div v-if="!isOpen" class="closed-panel">
    <button class="toggle-btn" @click="$emit('toggle')" title="展开助手面板">
      <ChevronLeft class="h-4 w-4" />
    </button>
  </div>

  <!-- Open state: full panel -->
  <aside v-else class="open-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-left">
        <Sparkles class="h-4 w-4" />
        <span class="header-title">助手</span>
      </div>
      <button class="toggle-btn" @click="$emit('toggle')" title="收起助手面板">
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <!-- Tabs -->
    <div class="panel-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'info' }"
        @click="activeTab = 'info'"
      >信息</button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'summary' }"
        @click="activeTab = 'summary'"
      >摘要</button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'tags' }"
        @click="activeTab = 'tags'"
      >标签</button>
    </div>

    <!-- Content -->
    <div class="panel-content">
      <!-- Info Tab -->
      <div v-if="activeTab === 'info'" class="tab-panel">
        <div class="stats-card">
          <div class="stats-header">
            <FileText class="stats-icon" />
            统计信息
          </div>
          <div class="stats-body">
            <div class="stats-row">
              <span class="stats-label">字符数</span>
              <span class="stats-value">{{ characterCount.toLocaleString() }}</span>
            </div>
            <div class="stats-row">
              <span class="stats-label">字数</span>
              <span class="stats-value">{{ wordCount.toLocaleString() }}</span>
            </div>
            <div class="stats-row">
              <span class="stats-label">预计阅读</span>
              <span class="stats-value">{{ readTime }} 分钟</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Tab -->
      <div v-else-if="activeTab === 'summary'" class="tab-panel">
        <!-- No note selected -->
        <div v-if="!noteId" class="empty-state">
          <Sparkles class="empty-icon" />
          <p class="empty-text">选择一篇笔记以生成摘要</p>
          <p class="empty-desc">AI 将自动提炼核心内容</p>
        </div>

        <!-- Loading -->
        <div v-else-if="summaryLoading" class="summary-loading">
          <div class="skeleton-line skeleton-line-short" />
          <div class="skeleton-line" />
          <div class="skeleton-line" />
          <div class="skeleton-line skeleton-line-short" />
        </div>

        <!-- Has summary -->
        <div v-else-if="summaryResult" class="summary-result">
          <p class="summary-text">{{ summaryResult }}</p>
          <button class="regenerate-btn" :disabled="summaryLoading" @click="generate">
            <Sparkles class="h-3 w-3" />
            重新生成
          </button>
        </div>

        <!-- No summary yet -->
        <div v-else class="empty-state">
          <Sparkles class="empty-icon" />
          <p class="empty-text">AI 智能摘要</p>
          <p class="empty-desc">一键提取笔记核心内容</p>
          <button class="generate-btn" :disabled="summaryLoading" @click="generate">
            <Sparkles class="h-4 w-4" />
            生成摘要
          </button>
        </div>
      </div>

      <!-- Tags Tab -->
      <div v-else class="tab-panel">
        <div class="empty-state">
          <Tag class="empty-icon" />
          <p class="empty-text">标签功能即将上线</p>
          <p class="empty-desc">智能标签帮你整理知识</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Sparkles, ChevronLeft, ChevronRight, FileText, Tag } from 'lucide-vue-next'
import { aiApi } from '@/api/ai'

const props = defineProps({
  isOpen: { type: Boolean, default: true },
  wordCount: { type: Number, default: 0 },
  characterCount: { type: Number, default: 0 },
  noteId: { type: String, default: null }
})

defineEmits(['toggle'])

const activeTab = ref('info')
const summaryResult = ref(null)
const summaryLoading = ref(false)

async function loadLatestSummary() {
  if (!props.noteId) {
    summaryResult.value = null
    return
  }
  try {
    const data = await aiApi.getLatestSummary(props.noteId)
    summaryResult.value = data?.result || null
  } catch {
    summaryResult.value = null
  }
}

async function generate() {
  if (!props.noteId || summaryLoading.value) return
  summaryLoading.value = true
  try {
    const data = await aiApi.generateSummary(props.noteId)
    summaryResult.value = data?.result || null
    window.$toast?.show('摘要已生成')
  } catch (err) {
    window.$toast?.show(err.message || '摘要生成失败')
  } finally {
    summaryLoading.value = false
  }
}

watch(() => props.noteId, () => {
  summaryResult.value = null
  loadLatestSummary()
}, { immediate: true })

const readTime = computed(() => {
  return Math.max(1, Math.ceil(props.characterCount / 500))
})
</script>

<style scoped>
/* Closed: narrow 40px strip */
.closed-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  height: 100vh;
  border-left: 1px solid var(--color-border-light);
  background-color: var(--color-background);
  padding-top: var(--space-16);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-secondary);
  transition: all var(--duration-fast) var(--ease-smooth);
}

.toggle-btn:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

/* Open: full 256px panel */
.open-panel {
  display: flex;
  flex-direction: column;
  width: 256px;
  height: 100vh;
  border-left: 1px solid var(--color-border-light);
  background-color: var(--color-background);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-12) var(--space-16);
  border-bottom: 1px solid var(--color-border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.header-left svg {
  color: var(--color-primary);
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* Tabs */
.panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border-light);
}

.tab-btn {
  flex: 1;
  padding: 8px var(--space-12);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: none;
  border-bottom: 2px solid transparent;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.tab-btn:hover {
  color: var(--color-text-primary);
}

.tab-btn.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-primary);
}

/* Content */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-16);
}

/* Stats Card */
.stats-card {
  border-radius: var(--radius-sm);
  background-color: rgba(15, 23, 42, 0.04);
  padding: var(--space-12);
}

.stats-header {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.stats-icon {
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
}

.stats-body {
  margin-top: var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.stats-label {
  color: var(--color-text-secondary);
}

.stats-value {
  font-weight: 500;
  color: var(--color-text-primary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-16);
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
}

.empty-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.empty-text {
  margin-top: var(--space-8);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.empty-desc {
  margin-top: var(--space-4);
  font-size: 12px;
  color: var(--color-text-muted);
  opacity: 0.7;
}

/* Generate Button */
.generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-12);
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
  background-color: var(--color-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.generate-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Summary Result */
.summary-result {
  padding: var(--space-8) 0;
}

.summary-text {
  font-size: 13px;
  line-height: 1.8;
  color: var(--color-text-primary);
  white-space: pre-wrap;
}

.regenerate-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-12);
  padding: 0;
  font-size: 12px;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.regenerate-btn:hover:not(:disabled) {
  color: var(--color-primary);
}

.regenerate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Summary Loading Skeleton */
.summary-loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.04) 25%, rgba(15, 23, 42, 0.08) 50%, rgba(15, 23, 42, 0.04) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

.skeleton-line-short {
  width: 60%;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
