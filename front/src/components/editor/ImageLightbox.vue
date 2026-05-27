<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="image-lightbox"
      @click="close"
      @keydown.escape="close"
    >
      <img :src="src" :alt="alt" />
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const src = ref('')
const alt = ref('')

function open(imgSrc, imgAlt) {
  src.value = imgSrc
  alt.value = imgAlt
  visible.value = true
}

function close() {
  visible.value = false
}

defineExpose({ open, close })
</script>

<style>
.image-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  animation: lightbox-in 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.image-lightbox img {
  max-width: 92vw;
  max-height: 92vh;
  object-fit: contain;
  border-radius: 4px;
  user-select: none;
  -webkit-user-select: none;
}

@keyframes lightbox-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
