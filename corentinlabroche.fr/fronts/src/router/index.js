import { createRouter, createWebHashHistory } from 'vue-router'
const routes = [{
  path: '/',
  name: 'home',
  component: () => import('../views/Home.vue')
}, {
  path: '/blog',
  name: 'blog',
  component: () => import('../views/Blog.vue')
},
{ path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
