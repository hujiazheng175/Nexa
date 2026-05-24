<template>
  <AppLayout>
    <div class="not-found-page">
      <h1 class="page-title">404</h1>
      <p class="page-desc">Page not found.</p>
      <router-link to="/" class="btn btn-primary">Back to Home</router-link>
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
  margin-bottom: 12px;
}

.page-desc {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}
</style>
