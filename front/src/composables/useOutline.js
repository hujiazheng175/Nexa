import { ref, watch, onBeforeUnmount, nextTick } from 'vue'

/**
 * Extract headings from HTML content string.
 * Returns { id, level, text } for each h1/h2/h3.
 */
export function extractHeadings(html) {
  if (!html) return []
  const div = document.createElement('div')
  div.innerHTML = html
  const headings = []
  div.querySelectorAll('h1, h2, h3').forEach((el, i) => {
    const text = el.textContent.trim()
    if (text) {
      headings.push({
        id: `outline-${i}`,
        level: parseInt(el.tagName[1]),
        text
      })
    }
  })
  return headings
}

/**
 * Composable: document outline — active-heading tracking + scroll navigation.
 *
 * @param {import('vue').ComputedRef<import('@tiptap/vue-3').Editor|null>} editorRef
 *        A computed that resolves to the TipTap Editor instance (or null).
 */
export function useOutline(editorRef) {
  const activeId = ref(null)
  let observer = null

  /** Attach IntersectionObserver to heading DOM elements in the editor */
  function setupObserver() {
    if (observer) observer.disconnect()

    const editor = editorRef?.value
    if (!editor) return

    const dom = editor.view.dom
    const headingEls = dom.querySelectorAll('h1, h2, h3')

    if (headingEls.length === 0) {
      activeId.value = null
      return
    }

    // Map DOM elements → outline id by their index
    const elToId = new Map()
    headingEls.forEach((el, i) => {
      elToId.set(el, `outline-${i}`)
    })

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = elToId.get(entry.target)
            if (id) activeId.value = id
            return
          }
        }
      },
      { rootMargin: '-10% 0px -75% 0px' }
    )

    headingEls.forEach((el) => observer.observe(el))
  }

  /**
   * Scroll the editor so the heading with the given text is at the top.
   * Finds the heading by text content in the editor DOM, then manually
   * scrolls the nearest scrollable ancestor (.editor-shell).
   */
  function scrollToHeading(headingText) {
    const editor = editorRef?.value
    if (!editor || !headingText) return

    const dom = editor.view.dom
    const headingEls = dom.querySelectorAll('h1, h2, h3')

    // Find the heading element by matching text content
    let target = null
    let targetIdx = -1
    for (let i = 0; i < headingEls.length; i++) {
      if (headingEls[i].textContent.trim() === headingText) {
        target = headingEls[i]
        targetIdx = i
        break
      }
    }

    if (!target) return

    // Scroll the editor shell (the scrollable container)
    const shell = target.closest('.editor-shell')
    if (shell) {
      const shellRect = shell.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const offset = targetRect.top - shellRect.top + shell.scrollTop - 60
      shell.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    activeId.value = `outline-${targetIdx}`
  }

  // Initial setup when editor first becomes available
  const stopInit = watch(
    () => editorRef?.value,
    (ed) => {
      if (ed) {
        nextTick(() => setupObserver())
        stopInit?.()
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
  })

  return { activeId, scrollToHeading, setupObserver }
}
