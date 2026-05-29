<template>
  <div
    ref="titleRef"
    class="editor-title"
    contenteditable="true"
    :data-placeholder="placeholder"
    @input="handleInput"
    @keydown="handleKeydown"
    @paste="handlePaste"
    @compositionstart="isComposing = true"
    @compositionend="isComposing = false"
  />
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '无标题'
  }
})

const emit = defineEmits(['update:modelValue', 'enter'])

const titleRef = ref(null)
const isComposing = ref(false)
let localValue = ''

const handleInput = () => {
  const text = titleRef.value?.innerText || ''
  localValue = text
  emit('update:modelValue', text)
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    emit('enter')
    return
  }
}

const handlePaste = (e) => {
  e.preventDefault()
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// Sync initial value on mount
onMounted(() => {
  if (props.modelValue && titleRef.value) {
    titleRef.value.textContent = props.modelValue
    localValue = props.modelValue
  }
})

// Sync when modelValue changes externally (e.g., switching notes)
watch(() => props.modelValue, async (newValue) => {
  if (!titleRef.value) return
  if (localValue === newValue) return

  const currentText = titleRef.value.innerText || ''
  if (currentText === newValue) return

  await nextTick()
  if (titleRef.value) {
    titleRef.value.textContent = newValue || ''
    localValue = newValue || ''
  }
})
</script>

<style scoped>
.editor-title {
  width: 100%;
  resize: none;
  overflow: hidden;
  background: transparent;
  border: none;
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: var(--color-text-primary);
  outline: none;
  min-height: 44px;
}

.editor-title:empty:before {
  content: attr(data-placeholder);
  color: var(--color-text-muted);
  pointer-events: none;
}

.editor-title::selection {
  background-color: rgba(79, 124, 255, 0.15);
}
</style>
