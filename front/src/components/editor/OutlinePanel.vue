<template>
  <div class="outline-panel" :class="{ expanded: expanded }">
    <!-- Collapsed: thin bar with dots -->
    <button
      v-if="!expanded"
      class="outline-trigger"
      @click="$emit('toggle')"
      title="展开大纲"
    >
      <div class="outline-dots">
        <span
          v-for="h in headings"
          :key="h.id"
          class="outline-dot"
          :class="{
            'dot-h1': h.level === 1,
            'dot-h2': h.level === 2,
            'dot-h3': h.level === 3
          }"
        />
      </div>
    </button>

    <!-- Expanded: full panel -->
    <div v-else class="outline-body">
      <!-- Header -->
      <div class="outline-header">
        <span class="outline-title">大纲</span>
        <button class="outline-collapse-btn" @click="$emit('toggle')" title="收起大纲">
          <ChevronLeft class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="headings.length === 0" class="outline-empty">
        <p class="outline-empty-text">暂无标题</p>
        <p class="outline-empty-hint">使用 H1-H3 标题构建文章结构</p>
      </div>

      <!-- Heading list -->
      <nav v-else class="outline-list">
        <button
          v-for="h in headings"
          :key="h.id"
          class="outline-item"
          :class="{
            'item-h1': h.level === 1,
            'item-h2': h.level === 2,
            'item-h3': h.level === 3,
            active: h.id === activeId
          }"
          @click="$emit('navigate', h.id)"
        >
          {{ h.text }}
        </button>
      </nav>

      <!-- Footer: heading count -->
      <div class="outline-footer">
        <span class="outline-count">{{ headings.length }} 个标题</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft } from 'lucide-vue-next'

defineProps({
  headings: {
    type: Array,
    default: () => []
  },
  activeId: {
    type: String,
    default: null
  },
  expanded: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle', 'navigate'])
</script>

<style scoped>
/* ========================================
   Panel shell — width transition
   ======================================== */
.outline-panel {
  flex-shrink: 0;
  width: 6px;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid transparent;
  transition: width 280ms cubic-bezier(0.33, 0, 0.17, 1),
              border-color 280ms cubic-bezier(0.33, 0, 0.17, 1);
  background-color: var(--color-background);
}

.outline-panel.expanded {
  width: 180px;
  border-right-color: var(--color-border-light);
}

/* ========================================
   Collapsed: thin bar trigger
   ======================================== */
.outline-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 12px 0;
  border: none;
  background: none;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 200ms ease;
}

.outline-trigger:hover {
  opacity: 0.7;
}

.outline-dots {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-top: 40px;
}

.outline-dot {
  display: block;
  border-radius: 50%;
  background-color: var(--color-text-muted);
  flex-shrink: 0;
}

.dot-h1 {
  width: 4px;
  height: 4px;
}

.dot-h2 {
  width: 3px;
  height: 3px;
}

.dot-h3 {
  width: 2.5px;
  height: 2.5px;
  opacity: 0.6;
}

/* ========================================
   Expanded: full panel body
   ======================================== */
.outline-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 180px;
  opacity: 0;
  transition: opacity 180ms ease 100ms; /* fade in after width expands */
}

.outline-panel.expanded .outline-body {
  opacity: 1;
}

/* Header */
.outline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.outline-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

.outline-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 150ms ease;
}

.outline-collapse-btn:hover {
  background: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

/* Empty state */
.outline-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-align: center;
}

.outline-empty-text {
  font-size: 13px;
  color: var(--color-text-muted);
}

.outline-empty-hint {
  margin-top: 6px;
  font-size: 11px;
  color: var(--color-text-muted);
  opacity: 0.5;
  line-height: 1.5;
}

/* Heading list */
.outline-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.outline-list::-webkit-scrollbar {
  width: 3px;
}

.outline-list::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.08);
  border-radius: 3px;
}

.outline-item {
  display: block;
  width: 100%;
  padding: 5px 12px;
  border: none;
  border-left: 2px solid transparent;
  background: none;
  text-align: left;
  cursor: pointer;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 150ms ease;
}

/* Level indentation */
.item-h1 {
  padding-left: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.item-h2 {
  padding-left: 22px;
  font-size: 12px;
  font-weight: 400;
}

.item-h3 {
  padding-left: 32px;
  font-size: 11px;
  font-weight: 400;
}

/* Hover */
.outline-item:hover {
  background: rgba(15, 23, 42, 0.03);
  color: var(--color-text-primary);
}

/* Active (current heading) */
.outline-item.active {
  border-left-color: var(--color-primary);
  color: var(--color-text-primary);
  background: rgba(79, 124, 255, 0.06);
}

/* Footer */
.outline-footer {
  flex-shrink: 0;
  padding: 8px 12px;
  border-top: 1px solid var(--color-border-light);
}

.outline-count {
  font-size: 11px;
  color: var(--color-text-muted);
  opacity: 0.5;
}
</style>
