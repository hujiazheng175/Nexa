<template>
  <div class="loading-page">
    <!-- Sidebar Skeleton -->
    <aside class="loading-sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <Skeleton width="32px" height="32px" class="rounded-lg" />
        <Skeleton width="96px" height="20px" />
      </div>

      <!-- Search -->
      <div class="sidebar-search">
        <Skeleton width="100%" height="36px" />
      </div>

      <!-- Button -->
      <div class="sidebar-create">
        <Skeleton width="100%" height="36px" />
      </div>

      <!-- Nav Items -->
      <div class="sidebar-nav">
        <Skeleton width="80px" height="16px" />
        <div class="nav-items">
          <Skeleton v-for="i in 5" :key="i" height="32px" />
        </div>
      </div>
    </aside>

    <!-- Main Content Skeleton -->
    <main class="loading-main">
      <div class="main-inner">
        <!-- Header -->
        <div class="main-header">
          <div class="header-left">
            <Skeleton width="192px" height="32px" />
            <Skeleton width="128px" height="16px" />
          </div>
          <div class="header-right">
            <Skeleton width="96px" height="32px" />
            <Skeleton width="72px" height="32px" />
          </div>
        </div>

        <!-- Cards Grid -->
        <div class="notes-grid">
          <div
            v-for="i in 6"
            :key="i"
            class="note-card-skeleton"
          >
            <div class="card-header">
              <Skeleton width="16px" height="16px" />
              <Skeleton width="75%" height="20px" />
            </div>
            <Skeleton width="100%" height="16px" class="ml-6" />
            <Skeleton width="66%" height="16px" class="ml-6" />
            <Skeleton width="80px" height="12px" class="ml-6" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Skeleton from '@/components/common/Skeleton.vue'
</script>

<style scoped>
.loading-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.loading-sidebar {
  flex-shrink: 0;
  width: 256px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border-light);
  background-color: var(--color-background);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px;
}

.sidebar-search {
  padding: 0 12px 12px;
}

.sidebar-create {
  padding: 0 12px 16px;
}

.sidebar-nav {
  flex: 1;
  overflow: hidden;
  padding: 0 12px;
}

.nav-items {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Main */
.loading-main {
  flex: 1;
  overflow: auto;
  background-color: var(--color-background);
}

.main-inner {
  max-width: 1024px;
  margin: 0 auto;
  padding: 32px 32px;
}

.main-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-right {
  display: flex;
  gap: 8px;
}

/* Cards Grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.note-card-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  background-color: var(--color-card);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ml-6 {
  margin-left: 24px;
}

@media (max-width: 768px) {
  .notes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
