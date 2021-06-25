<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="search-wrap">
        <input type="text" placeholder="搜索" class="search__input" :value="searchText" @input="searchInputVal($event)">
      </div>
      <xm-list :lists="searchedPPAcounts" v-if="searchedPPAcounts.length"></xm-list>
      <div class="no-num" v-else>无搜索结果</div>
      <!-- <div class="accountIdInp">
        <input type="text" placeholder="请输入添加的公众号id" v-model="accountId">
        <button @click="addPPAccount()">添加公众号</button>
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      searchText: '',
      accountId: ''
    }
  },
  methods: {
    searchInputVal (e) {
      let vm = this
      let channelId = '2'
      vm.searchText = e.target.value.trim()
      if (vm.searchText === '') {
        vm.$store.commit('resetSearchedPPAcounts')
        return
      }
      vm.$store.dispatch('searchPPAccount', { searchKey: vm.searchText, channelId })
    },
    addPPAccount () {
      let vm = this
      let id = parseInt(vm.accountId.trim())
      let param = {
        to: id,
        eventType: 1,
        channelId: 2
      }
      if (window.confirm(`确定要关注公众号 “${id}”?`)) {
        vm.$store.dispatch('setPPFocus', { param, vm })
      }
    }
  },
  computed: {
    ...mapState({
      'searchedPPAcounts': state => state.pp.searchedPPAcounts
    })
  },
  mounted () {
    let vm = this
    vm.$store.commit('resetSearchedPPAcounts')
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
      .no-num{
        height: 108px;
        line-height: 108px;
        color: #666666;
      }
      .accountIdInp{
        padding: 4px;
        background-color: #ffffff;
      }
    }
  }
</style>
