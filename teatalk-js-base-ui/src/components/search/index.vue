<template>
  <div class="search-wrap">
    <input type="text" placeholder="搜索企业联系人" class="search__input" :value="searcheName" @input="searchInputVal($event)">
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'enterprise-search',
  props: {},
  data () {
    return {
      searcheName: ''
    }
  },
  methods: {
    getRemote: _.debounce(function (e) {
      let vm = this
      vm.searcheName = e.target.value.trim()
      vm.$store.dispatch('queryEmployeeForSearch', vm.searcheName)
      vm.$router.push({name: 'enpSearch'})
    }, 300),
    searchInputVal (e) {
      this.getRemote(e)
    }
  }
}
</script>

<style scoped lang="scss">
.search-wrap {
  height: 108px;
  padding: 20px;
  background-color: #EDEDED;
  .search__input {
    width: 100%;
    height: 100%;
    padding-left: 30px;
    border-radius: 40px;
    background-color: #ffffff;
  }
}
</style>
