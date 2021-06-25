import search from './index.vue'

search.install = (Vue) => {
  Vue.component(search.name, search)
}

export default search
