import Toast from './index.vue'

Toast.install = (Vue) => {
  Vue.component(Toast.name, Toast)
}

export default Toast
