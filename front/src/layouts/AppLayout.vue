<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-inner">
        <router-link to="/" class="logo">
        <img src="@/utils/logo.png" alt="Nexa" class="logo-icon" />
        <span>Nexa</span>
      </router-link>
        <nav class="header-nav">
          <slot name="nav"></slot>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: var(--color-card);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.logo:hover {
  color: var(--color-primary);
}

.logo-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-main {
  flex: 1;
  padding: 32px 24px;
}
</style>
