import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const registeredLayouts = [
  'web'
]

registeredLayouts.map((layout) => {
  Vue.component(`${layout}-layout`, () => import(/* webpackChunkName: "[request]-layout" */ `../layouts/${layout}.vue`))
})

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/comment',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/Comment.vue')
    },
    {
      path: '/installation',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/MarkdownDoc.vue'),
      props: {
        raw: require('../../../../docs/installation.md')
      },
      meta: {
        layout: 'web'
      }
    },
    {
      path: '/guide',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/MarkdownDoc.vue'),
      props: {
        raw: require('../../../../docs/guide.md')
      },
      meta: {
        layout: 'web'
      }
    },
    {
      path: '/',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/MarkdownDoc.vue'),
      props: {
        raw: require('../../../../README.md')
      },
      meta: {
        layout: 'web'
      }
    },
    {
      path: '*',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/NotFound.vue')
    }
  ]
})

export default router
