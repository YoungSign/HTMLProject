<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <enterprise-search></enterprise-search>
      <enterprise-list :lists="displayLists"></enterprise-list>
      <div class="total-group">{{displayLists.length}}个企业</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {}
  },
  computed: {
    ...mapState({
      'getDepartment': state => state.enterprise.enterpriseList
    }),
    displayLists () {
      let vm = this
      let departmentList = []
      for (let i = 0; i < vm.getDepartment.length; i++) {
        let department = vm.getDepartment[i]
        if (department.depth === 1) {
          departmentList.push(department)
        }
      }
      return departmentList
    }
  }
}
</script>

<style scoped lang="scss">
  .page-container{
    padding-top: 88px;
    height: 100%;
    background-color: $base-bg-color;
    .l-header{
      @include l-header;
    }
    .l-main{
      width: 100%;
      height: 100%;
      background-color: $app-bg-color;
      .search-wrap{
        height: 108px;
        padding: 20px;
        background-color: #EDEDED;
        .search__input{
          width: 100%;
          height: 100%;
          padding-left: 30px;
          border-radius: 40px;
          background-color: #ffffff;
        }
      }
      .total-group{
        height: 108px;
        line-height: 108px;
        color: #666666;
      }
    }
  }
</style>
