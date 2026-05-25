import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue')
  },
  {
    path: '/notes/:id',
    name: 'NoteDetail',
    component: () => import('@/pages/NoteDetailPage.vue')
  },
  {
    path: '/trash',
    name: 'Trash',
    component: () => import('@/pages/TrashPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
