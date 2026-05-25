<template>
  <editor-content class="editor-content" :editor="editor" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '开始书写...'
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = ref(null)
let lastEmittedValue = props.modelValue

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Typography,
      Link.configure({
        openOnClick: false,
        defaultProtocol: 'https',
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Placeholder.configure({
        placeholder: props.placeholder
      })
    ],
    content: props.modelValue,
    editorProps: {
      attributes: {
        class: 'prose'
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain')
        const html = event.clipboardData?.getData('text/html')

        if (text && !html) {
          const isUrl = /^https?:\/\/[^\s]+$/.test(text.trim())
          if (isUrl) {
            return false
          }
          view.dispatch(view.state.tr.insertText(text))
          return true
        }
        return false
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML()
      lastEmittedValue = html
      emit('update:modelValue', html)
    }
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

watch(() => props.modelValue, (newValue) => {
  if (!editor.value) return
  if (newValue === lastEmittedValue) return

  editor.value.commands.setContent(newValue, false)
  lastEmittedValue = newValue
})

defineExpose({
  editor,
  getHTML: () => editor.value?.getHTML() || ''
})
</script>

<style scoped>
.editor-content {
  width: 100%;
  min-height: 50vh;
  font-size: 16px;
  line-height: 1.8;
  color: rgba(31, 41, 55, 0.85);
  outline: none;
  letter-spacing: 0.01em;
}

:deep(.tiptap) {
  outline: none;
}

/* Placeholder */
:deep(.tiptap p.is-editor-empty:first-child::before) {
  color: rgba(31, 41, 55, 0.25);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Paragraphs */
:deep(.tiptap p) {
  margin-bottom: 0.75em;
}

/* Headings */
:deep(.tiptap h1),
:deep(.tiptap h2),
:deep(.tiptap h3) {
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-top: 2em;
  margin-bottom: 0.5em;
  color: var(--color-text-primary);
}

:deep(.tiptap h1) {
  font-size: 26px;
}

:deep(.tiptap h2) {
  font-size: 20px;
}

:deep(.tiptap h3) {
  font-size: 17px;
}

/* Bold & Italic */
:deep(.tiptap strong) {
  font-weight: 600;
  color: var(--color-text-primary);
}

:deep(.tiptap em) {
  font-style: italic;
}

/* Blockquote */
:deep(.tiptap blockquote) {
  border-left: 2px solid var(--color-border);
  padding-left: 16px;
  margin: 1.5em 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* Lists */
:deep(.tiptap ul),
:deep(.tiptap ol) {
  padding-left: 1.5em;
  margin-bottom: 0.5em;
}

:deep(.tiptap li) {
  margin-bottom: 0.25em;
  line-height: 1.7;
}

:deep(.tiptap ul li p),
:deep(.tiptap ol li p) {
  margin-bottom: 0;
}

/* Inline Code */
:deep(.tiptap code) {
  background-color: rgba(15, 23, 42, 0.05);
  padding: 0.15em 0.35em;
  border-radius: 4px;
  font-size: 0.88em;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace;
  color: rgba(31, 41, 55, 0.9);
}

/* Code Block */
:deep(.tiptap pre) {
  background-color: rgba(15, 23, 42, 0.03);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  margin: 1.5em 0;
  overflow-x: auto;
}

:deep(.tiptap pre code) {
  background: none;
  padding: 0;
  font-size: 14px;
  line-height: 1.6;
  border-radius: 0;
  color: rgba(31, 41, 55, 0.85);
}

/* Horizontal Rule */
:deep(.tiptap hr) {
  border: none;
  border-top: 1px solid var(--color-border-light);
  margin: 2em 0;
}

/* Link */
:deep(.tiptap a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-decoration-color: rgba(79, 124, 255, 0.25);
  text-underline-offset: 3px;
  transition: text-decoration-color var(--duration-fast) var(--ease-smooth);
}

:deep(.tiptap a:hover) {
  text-decoration-color: var(--color-primary);
}

/* Strike */
:deep(.tiptap s) {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

/* Task List */
:deep(.tiptap ul[data-type="taskList"]) {
  list-style: none;
  padding-left: 0;
}

:deep(.tiptap ul[data-type="taskList"] li) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

/* Selection */
:deep(.tiptap ::selection) {
  background-color: rgba(79, 124, 255, 0.15);
}
</style>
