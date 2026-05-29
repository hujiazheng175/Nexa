<template>
  <div class="editor-shell">
    <div class="editor-shell-inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.editor-shell {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: var(--color-editor);
}

.editor-shell-inner {
  width: 100%;
  max-width: var(--editor-max-width);
  padding: 24px 32px 160px;
}
</style>
