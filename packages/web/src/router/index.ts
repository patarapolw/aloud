import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const registeredLayouts = [
  'web'
]

registeredLayouts.map((layout) => {
  Vue.component(`${layout}-layout`, () => import(`@/layouts/${layout}.vue`))
})

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/comment',
      component: () => import('@/views/Comment.vue')
    },
    {
      path: '/installation',
      component: () => import('@/views/MarkdownDoc.vue'),
      props: {
        getMd: async () => (await import('@/assets/docs/installation.md')).default
      },
      meta: {
        layout: 'web'
      }
    },
    {
      path: '/guide',
      component: () => import('@/views/MarkdownDoc.vue'),
      props: {
        getMd: async () => (await import('@/assets/docs/guide.md')).default
      },
      meta: {
        layout: 'web'
      }
    },
    {
      path: '/',
      component: () => import('@/views/MarkdownDoc.vue'),
      props: {
        getMd: async () => (await import('@/assets/README.md')).default
      },
      meta: {
        layout: 'web'
      }
    },
    {
      path: '*',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

export default router
