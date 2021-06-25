<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <!-- <div class="search-wrap">
        <input type="text" placeholder="搜索" class="search__input" :value="searchText" @input="searchInputVal($event)">
      </div> -->
      <xm-list :lists="displayLists"></xm-list>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      searchText: ''
    }
  },
  methods: {
    searchInputVal (e) {
      let vm = this
      vm.searchText = e.target.value.trim()
    }
  },
  computed: {
    ...mapState({
      'groupLists': state => state.group.orgList
    }),
    displayLists () {
      let vm = this
      if (!vm.searchText) {
        return vm.groupLists
      } else {
        return vm.groupLists.filter(item => {
          return item.groupName.indexOf(vm.searchText) > -1
        })
      }
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
