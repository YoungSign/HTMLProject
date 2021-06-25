import Portrait from './index.vue'

Portrait.install = (Vue) => {
  Vue.component(Portrait.name, Portrait)
}

export default Portrait
