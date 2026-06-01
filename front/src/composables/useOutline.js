import { ref, watch, onBeforeUnmount, nextTick } from 'vue'

/**
 * Extract headings from HTML content string.
 * Returns { id, level, text } for each h1/h2/h3.
 *
 * id format: "outline-N" where N matches the DOM index
 * of the heading within editor.view.dom.querySelectorAll('h1,h2,h3').
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
 * @param {import('vue').ComputedRef<import('@tiptap/vue-3').Editor|null>} editorRef
 */
export function useOutline(editorRef) {
  const activeId = ref(null)
  let observer = null

  function setupObserver() {
    if (observer) observer.disconnect()

    const editor = editorRef?.value
    if (!editor) return

    const headingEls = editor.view.dom.querySelectorAll('h1, h2, h3')
    if (headingEls.length === 0) {
      activeId.value = null
      return
    }

    const elToId = new Map()
    headingEls.forEach((el, i) => elToId.set(el, `outline-${i}`))

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
   * Scroll to the heading identified by its outline id ("outline-N").
   * Uses the N index to find the matching DOM element — no text
   * matching required, so entity-encoding or whitespace differences
   * between HTML-parsed text and live DOM text cannot cause a miss.
   */
  function scrollToHeading(id) {
    const editor = editorRef?.value
    if (!editor) return

    const idx = parseInt(id.replace('outline-', ''))
    if (isNaN(idx)) return

    const headingEls = editor.view.dom.querySelectorAll('h1, h2, h3')
    const target = headingEls[idx]
    if (!target) return

    // scrollIntoView handles finding the nearest scrollable ancestor
    // (.editor-shell has overflow-y:auto) automatically.
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }

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
