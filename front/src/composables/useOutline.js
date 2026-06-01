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
 * Composable: document outline active-heading tracking + navigation.
 *
 * The parent is responsible for computing headings from the reactive
 * content model; this composable only handles IntersectionObserver
 * and scroll-to-heading via the TipTap editor DOM.
 *
 * @param {import('vue').ComputedRef<import('@tiptap/vue-3').Editor|null>} editorRef
 *        A computed that resolves to the TipTap Editor instance (or null).
 */
export function useOutline(editorRef) {
  const activeId = ref(null)
  let observer = null

  /** Attach IntersectionObserver to current heading DOM elements */
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

    // Build a map: element → outline id
    const elToId = new Map()
    const texts = []
    headingEls.forEach((el, i) => {
      elToId.set(el, `outline-${i}`)
      texts.push(el.textContent.trim())
    })

    observer = new IntersectionObserver(
      (entries) => {
        // First intersecting heading near the top is "active"
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = elToId.get(entry.target)
            if (id) activeId.value = id
            return
          }
        }
        // No heading intersecting — keep the last active
      },
      {
        rootMargin: '-10% 0px -75% 0px'
      }
    )

    headingEls.forEach((el) => observer.observe(el))
  }

  /** Scroll the editor so the given heading id is at the top */
  function scrollToHeading(id) {
    const editor = editorRef?.value
    if (!editor) return

    // The id is "outline-N" where N is the index among all headings
    const idx = parseInt(id.replace('outline-', ''))
    if (isNaN(idx)) return

    const headingEls = editor.view.dom.querySelectorAll('h1, h2, h3')
    const target = headingEls[idx]
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      activeId.value = id
    }
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
