import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页', icon: 'dashboard' }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/users/index.vue'),
          meta: { title: '用户管理', icon: 'user' }
        },
        {
          path: 'chat',
          name: 'Chat',
          component: () => import('@/views/chat/index.vue'),
          meta: { title: 'AI 助手', icon: 'chat-dot-round' }
        },
        {
          path: 'tests',
          name: 'Test',
          component: () => import('@/views/tests/index.vue'),
          meta: { title: 'AI 助手', icon: 'chat-dot-round' }
        }
      ]
    }
  ]
})

export default router 