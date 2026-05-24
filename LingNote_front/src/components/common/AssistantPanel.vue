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
        <div class="empty-state">
          <Sparkles class="empty-icon" />
          <p class="empty-text">AI 摘要功能即将上线</p>
          <p class="empty-desc">自动为你的笔记生成摘要</p>
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
import { ref, computed } from 'vue'
import { Sparkles, ChevronLeft, ChevronRight, FileText, Tag } from 'lucide-vue-next'

const props = defineProps({
  isOpen: { type: Boolean, default: true },
  wordCount: { type: Number, default: 0 },
  characterCount: { type: Number, default: 0 }
})

defineEmits(['toggle'])

const activeTab = ref('info')

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
  padding-top: 16px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
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
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 8px 12px;
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
  padding: 16px;
}

/* Stats Card */
.stats-card {
  border-radius: 8px;
  background-color: rgba(15, 23, 42, 0.04);
  padding: 12px;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.stats-icon {
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
}

.stats-body {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  padding: 16px;
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
}

.empty-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.empty-text {
  margin-top: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.empty-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  opacity: 0.7;
}
</style>
