import enterpriseList from './index.vue'

enterpriseList.install = (Vue) => {
  Vue.component(enterpriseList.name, enterpriseList)
}

export default enterpriseList
