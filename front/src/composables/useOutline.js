import { ref, watch, onBeforeUnmount, nextTick, unref } from 'vue'

const HEADING_SELECTOR = 'h1, h2, h3'
const OUTLINE_ID_PREFIX = 'outline-'
const SCROLL_GAP_PX = 24

/**
 * Build outline items from a DOM root or HTML string.
 * id = outline-{index} matches querySelectorAll order in the live editor.
 */
export function extractHeadings(source) {
  if (!source) return []

  const root =
    typeof source === 'string'
      ? (() => {
          const div = document.createElement('div')
          div.innerHTML = source
          return div
        })()
      : source

  return [...root.querySelectorAll(HEADING_SELECTOR)]
    .map((el, index) => {
      const text = el.textContent.trim()
      if (!text) return null
      return {
        id: `${OUTLINE_ID_PREFIX}${index}`,
        level: Number(el.tagName.charAt(1)),
        text
      }
    })
    .filter(Boolean)
}

function parseOutlineIndex(id) {
  if (!id?.startsWith(OUTLINE_ID_PREFIX)) return -1
  const index = Number(id.slice(OUTLINE_ID_PREFIX.length))
  return Number.isInteger(index) && index >= 0 ? index : -1
}

/**
 * @param {import('vue').MaybeRefOrGetter<import('@tiptap/core').Editor | null>} editorSource
 */
export function useOutline(editorSource) {
  const activeId = ref(null)
  let observer = null

  const getEditor = () => {
    const source = editorSource
    if (typeof source === 'function') return source()
    return unref(source)
  }

  const getHeadingElements = (editor) => {
    if (!editor?.view?.dom) return []
    return [...editor.view.dom.querySelectorAll(HEADING_SELECTOR)]
  }

  const getScrollContainer = (editor) => {
    return editor?.view?.dom?.closest('.editor-shell') ?? null
  }

  function setupObserver() {
    observer?.disconnect()
    observer = null

    const editor = getEditor()
    const headingEls = getHeadingElements(editor)

    if (!headingEls.length) {
      activeId.value = null
      return
    }

    const scrollRoot = getScrollContainer(editor)
    const idByElement = new Map(
      headingEls.map((el, index) => [el, `${OUTLINE_ID_PREFIX}${index}`])
    )

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        const topEntry = visible[0]
        if (!topEntry) return

        const id = idByElement.get(topEntry.target)
        if (id) activeId.value = id
      },
      {
        root: scrollRoot,
        rootMargin: '-12% 0px -65% 0px',
        threshold: 0
      }
    )

    headingEls.forEach((el) => observer.observe(el))
  }

  function scrollToHeading(id) {
    const editor = getEditor()
    if (!editor) return

    const index = parseOutlineIndex(id)
    if (index < 0) return

    const target = getHeadingElements(editor)[index]
    const scrollContainer = getScrollContainer(editor)
    if (!target || !scrollContainer) return

    const containerTop = scrollContainer.getBoundingClientRect().top
    const targetTop = target.getBoundingClientRect().top
    const nextScrollTop =
      scrollContainer.scrollTop + targetTop - containerTop - SCROLL_GAP_PX

    scrollContainer.scrollTo({
      top: Math.max(0, nextScrollTop),
      behavior: 'smooth'
    })

    activeId.value = id
  }

  watch(
    () => getEditor(),
    (editor) => {
      if (editor) {
        nextTick(setupObserver)
      } else {
        observer?.disconnect()
        observer = null
        activeId.value = null
      }
    },
    { immediate: true, flush: 'post' }
  )

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return {
    activeId,
    scrollToHeading,
    setupObserver
  }
}
