<template>
  <div class="outline-area" :class="{ expanded }">
    <!-- ============================================
         Collapsed: floating capsule button
         ============================================ -->
    <div v-if="!expanded" class="outline-capsule-area">
      <button
        class="outline-capsule"
        @click="$emit('toggle')"
        title="展开大纲"
      >
        <List class="capsule-icon" />
        <span class="capsule-label">大纲</span>
        <span v-if="headings.length" class="capsule-badge">{{ headings.length }}</span>
      </button>
    </div>

    <!-- ============================================
         Expanded: full outline panel
         ============================================ -->
    <div v-else class="outline-body">
      <!-- Header -->
      <div class="outline-header">
        <div class="outline-header-left">
          <List class="h-3.5 w-3.5" />
          <span class="outline-title">大纲</span>
        </div>
        <button class="outline-collapse-btn" @click="$emit('toggle')" title="收起大纲">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="headings.length === 0" class="outline-empty">
        <p class="outline-empty-text">暂无标题</p>
        <p class="outline-empty-hint">使用 H1-H3 标题<br />构建文章结构</p>
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
          <span class="item-dot" />
          <span class="item-text">{{ h.text }}</span>
        </button>
      </nav>

      <!-- Footer -->
      <div v-if="headings.length" class="outline-footer">
        <span class="outline-count">{{ headings.length }} 个标题</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { List, X } from 'lucide-vue-next'

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
.outline-area {
  flex-shrink: 0;
  width: 44px;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--color-background);
  border-right: 1px solid transparent;
  transition: width 280ms cubic-bezier(0.33, 0, 0.17, 1),
              border-color 200ms ease;
}

.outline-area.expanded {
  width: 180px;
  border-right-color: var(--color-border-light);
}

/* ========================================
   Collapsed: capsule
   ======================================== */
.outline-capsule-area {
  display: flex;
  justify-content: center;
  padding-top: 56px;
  width: 44px;
}

.outline-capsule {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 8px;
  width: 36px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 200ms ease;
  position: relative;
}

.outline-capsule:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
  color: var(--color-text-primary);
  border-color: rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.capsule-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.capsule-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1;
}

.capsule-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--color-primary);
  color: #FFFFFF;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  text-align: center;
  letter-spacing: 0;
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
  transition: opacity 160ms ease 100ms;
}

.outline-area.expanded .outline-body {
  opacity: 1;
}

/* Header */
.outline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 12px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.outline-header-left {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--color-text-secondary);
}

.outline-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.outline-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
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
  line-height: 1.6;
}

/* Heading list */
.outline-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}

.outline-list::-webkit-scrollbar {
  width: 3px;
}

.outline-list::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.06);
  border-radius: 3px;
}

.outline-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  border: none;
  border-left: 2px solid transparent;
  background: none;
  text-align: left;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 150ms ease;
}

/* Level hierarchy */
.item-h1 {
  padding-left: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.item-h2 {
  padding-left: 24px;
  font-size: 12px;
  font-weight: 400;
}

.item-h3 {
  padding-left: 36px;
  font-size: 11px;
  font-weight: 400;
}

/* Level dot indicator */
.item-dot {
  flex-shrink: 0;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.35;
}

.item-h1 .item-dot {
  width: 5px;
  height: 5px;
  opacity: 0.5;
}

.item-h3 .item-dot {
  width: 3px;
  height: 3px;
  opacity: 0.25;
}

.item-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Hover */
.outline-item:hover {
  background: rgba(15, 23, 42, 0.03);
  color: var(--color-text-primary);
}

/* Active */
.outline-item.active {
  border-left-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(79, 124, 255, 0.05);
}

.outline-item.active .item-dot {
  opacity: 1;
  background: var(--color-primary);
}

/* Footer */
.outline-footer {
  flex-shrink: 0;
  padding: 8px 12px;
  border-top: 1px solid var(--color-border-light);
}

.outline-count {
  font-size: 10px;
  color: var(--color-text-muted);
  opacity: 0.45;
}
</style>
