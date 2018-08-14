import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'browser',
      component: require('@/components/browser').default
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/components/settings')
    },
    {
      path: '/auth',
      name: 'auth',
      component: require('@/components/auth')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
