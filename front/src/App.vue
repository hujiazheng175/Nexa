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
  show: (msg) => toastRef.value?.show(msg)
}
</script>
