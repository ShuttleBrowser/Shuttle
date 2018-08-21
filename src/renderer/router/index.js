import Vue from 'vue'
import Router from 'vue-router'

import Browser from '../components/Browser'
import Auth from '../components/Auth'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'browser',
      component: Browser
    },
    /* {
      path: '/settings',
      name: 'settings',
      component: () => import('@/components/Settings')
    }, */
    {
      path: '/auth',
      name: 'auth',
      component: Auth
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
