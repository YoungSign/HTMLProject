import List from './index.vue'

List.install = (Vue) => {
  Vue.component(List.name, List)
}

export default List
