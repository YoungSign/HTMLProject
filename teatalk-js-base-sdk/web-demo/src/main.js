import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
window.TeatalkSdk.init()
const username = localStorage.getItem('username')
const password = localStorage.getItem('password')
if (typeof username === 'string' && username.length > 0 &&
    typeof password === 'string' && password.length > 0) {
    window.TeatalkSdk.invoke('connect', {
        options: {
            url: ApiUrl, // 基础
            name: username,
            password: password
        }
    })
}
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')