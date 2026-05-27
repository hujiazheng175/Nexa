    <template>
  <div class="editor-wrapper">
    <!-- Floating Toolbar (BubbleMenu) -->
    <BubbleMenu
      v-if="editor"
      :editor="editor"
      :tippy-options="{ duration: 150, placement: 'top' }"
      class="editor-bubble-menu"
    >
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('bold') }"
        :title="'加粗'"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <Bold class="h-4 w-4" />
      </button>

      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('italic') }"
        :title="'斜体'"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <Italic class="h-4 w-4" />
      </button>

      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('strike') }"
        :title="'删除线'"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <Strikethrough class="h-4 w-4" />
      </button>

      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('code') }"
        :title="'行内代码'"
        @click="editor.chain().focus().toggleCode().run()"
      >
        <Code class="h-4 w-4" />
      </button>

      <div class="toolbar-divider" />

      <!-- Heading Levels -->
      <button
        type="button"
        class="toolbar-btn toolbar-btn-text"
        :class="{ active: editor.isActive('heading', { level: 1 }) }"
        :title="'一级标题'"
        @click="setHeading(1)"
      >
        H1
      </button>

      <button
        type="button"
        class="toolbar-btn toolbar-btn-text"
        :class="{ active: editor.isActive('heading', { level: 2 }) }"
        :title="'二级标题'"
        @click="setHeading(2)"
      >
        H2
      </button>

      <button
        type="button"
        class="toolbar-btn toolbar-btn-text"
        :class="{ active: editor.isActive('heading', { level: 3 }) }"
        :title="'三级标题'"
        @click="setHeading(3)"
      >
        H3
      </button>

      <button
        type="button"
        class="toolbar-btn toolbar-btn-text"
        :class="{ active: editor.isActive('paragraph') }"
        :title="'段落'"
        @click="setParagraph"
      >
        ¶
      </button>

      <div class="toolbar-divider" />

      <!-- Block Operations -->
      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('blockquote') }"
        :title="'引用'"
        @click="toggleBlockquote"
      >
        <Quote class="h-4 w-4" />
      </button>

      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('bulletList') }"
        :title="'无序列表'"
        @click="toggleBulletList"
      >
        <List class="h-4 w-4" />
      </button>

      <button
        type="button"
        class="toolbar-btn"
        :class="{ active: editor.isActive('orderedList') }"
        :title="'有序列表'"
        @click="toggleOrderedList"
      >
        <ListOrdered class="h-4 w-4" />
      </button>
    </BubbleMenu>

    <!-- Block Insert Handle -->
    <BlockInsertHandle v-if="editor" :editor="editor" />

    <!-- Editor Content -->
    <editor-content class="editor-content" :editor="editor" />

    <!-- Image Lightbox -->
    <ImageLightbox ref="lightboxRef" />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import ImageExt from '@tiptap/extension-image'
import BlockInsertHandle from './BlockInsertHandle.vue'
import ImageLightbox from './ImageLightbox.vue'
import { Bold, Italic, Strikethrough, Code, Quote, List, ListOrdered } from 'lucide-vue-next'

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
const lightboxRef = ref(null)
let lastEmittedValue = props.modelValue

function onEditorClick(e) {
  const img = e.target.closest('img')
  if (!img || !img.src) return
  lightboxRef.value?.open(img.src, img.alt || '')
}

// Heading operations
function setHeading(level) {
  editor.value.chain().focus().toggleHeading({ level }).run()
}

function setParagraph() {
  editor.value.chain().focus().setParagraph().run()
}

// Block operations
function toggleBlockquote() {
  editor.value.chain().focus().toggleBlockquote().run()
}

function toggleBulletList() {
  editor.value.chain().focus().toggleBulletList().run()
}

function toggleOrderedList() {
  editor.value.chain().focus().toggleOrderedList().run()
}

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          defaultProtocol: 'https',
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }
      }),
      Typography,
      Placeholder.configure({
        placeholder: () => props.placeholder
      }),
      ImageExt.configure({
        allowBase64: true
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

  editor.value.view.dom.addEventListener('click', onEditorClick)
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.view.dom.removeEventListener('click', onEditorClick)
  }
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
/* stylelint-disable */
.editor-wrapper {
  position: relative;
  width: 100%;
}

.editor-content {
  width: 100%;
  min-height: 50vh;
  font-size: 16px;
  line-height: 1.8;
  color: rgba(31, 41, 55, 0.85);
  outline: none;
  letter-spacing: 0.01em;
}

/* Floating Toolbar (BubbleMenu) */
.editor-bubble-menu {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px;
  background: #FFFFFF;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08),
              0 1px 2px rgba(15, 23, 42, 0.04);
  border: 1px solid var(--color-border-light);
  max-width: 600px;
  flex-wrap: wrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-btn:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: var(--color-text-primary);
}

.toolbar-btn.active {
  background-color: rgba(79, 124, 255, 0.12);
  color: var(--color-primary);
}

/* Text-based toolbar buttons (for headings) */
.toolbar-btn-text {
  width: auto;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background-color: var(--color-border-light);
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

/* Bold */
:deep(.tiptap strong) {
  font-weight: 600;
  color: var(--color-text-primary);
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

:deep(.tiptap ul) {
  list-style-type: disc;
}

:deep(.tiptap ol) {
  list-style-type: decimal;
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

/* Selection */
:deep(.tiptap ::selection) {
  background-color: rgba(79, 124, 255, 0.15);
}

/* Image */
:deep(.tiptap img) {
  display: block;
  max-width: 75%;
  max-height: 560px;
  height: auto;
  object-fit: scale-down;
  border-radius: 16px;
  margin: 32px auto;
  cursor: zoom-in;
}
</style>