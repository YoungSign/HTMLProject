<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="search-wrap">
        <input type="text" placeholder="搜索已关注的公众号" class="search__input" :value="searchText" @input="searchInputVal($event)">
      </div>
      <xm-list :lists="displayLists"></xm-list>
      <div class="total-num">{{displayLists.length}}个公众号</div>
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
  watch: {},
  computed: {
    ...mapState({
      'ppFocusList': state => state.pp.ppFocusList
    }),
    displayLists () {
      let vm = this
      if (!vm.searchText) {
        return vm.ppFocusList
      } else {
        return vm.ppFocusList.filter(item => {
          return item.PPAccountName.indexOf(vm.searchText) > -1
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
      .total-num{
        height: 108px;
        line-height: 108px;
        color: #666666;
      }
    }
  }
</style>
