// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import XmUI from './components'
import router from './router'
import store from './store'
import 'lib-flexible/flexible'
import './assets/css/reset.css'

Vue.use(XmUI)

Vue.config.productionTip = false
Vue.prototype.ApiUrl = window.ApiUrl;//服务器地址

router.beforeEach((to, from, next) => {
  console.log('UI___routeFrom: ', from)
  console.log('UI___routeTo: ', to)
  if (to.meta.requiresAuth) {
    let loginStatus = sessionStorage.getItem('loginStatus') || false
    if (!loginStatus) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
