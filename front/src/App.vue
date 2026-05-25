<template>
  <div id="app">
    <router-view />
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Toast from '@/components/common/Toast.vue'

const toastRef = ref(null)

window.$toast = {
  success: (msg) => toastRef.value?.success(msg),
  error: (msg) => toastRef.value?.error(msg)
}
</script>
