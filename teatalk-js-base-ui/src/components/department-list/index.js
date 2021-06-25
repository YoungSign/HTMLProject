import departmentList from './index.vue'

departmentList.install = (Vue) => {
  Vue.component(departmentList.name, departmentList)
}

export default departmentList
