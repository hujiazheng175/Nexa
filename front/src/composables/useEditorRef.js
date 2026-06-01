import { computed, unref } from 'vue'

/**
 * Resolve TipTap Editor from EditorContent expose.
 * Prefer getEditor() — stable across Vue ref-unwrapping differences.
 */
export function resolveEditorInstance(contentComponent) {
  if (!contentComponent) return null

  const fromGetter = contentComponent.getEditor?.()
  if (fromGetter) return fromGetter

  const exposed = contentComponent.editor
  return unref(exposed) ?? exposed ?? null
}

/**
 * @param {import('vue').Ref} contentRef - ref to EditorContent component
 */
export function useEditorRef(contentRef) {
  return computed(() => resolveEditorInstance(contentRef.value))
}
