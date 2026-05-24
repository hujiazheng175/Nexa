<template>
  <AppLayout>
    <div class="not-found-page">
      <h1 class="page-title">404</h1>
      <p class="page-desc">页面未找到</p>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
</script>

<style scoped>
.not-found-page {
  max-width: var(--content-width);
  margin: 0 auto;
  text-align: center;
  padding-top: 120px;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-12);
}

.page-desc {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-24);
}
</style>
