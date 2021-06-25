<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="search-wrap">
        <input type="text" placeholder="搜索" class="search__input" :value="searchText" @input="searchInputVal($event)">
      </div>
      <div class="search_res_wrap">
        <div class="res_title res_title_contacts" v-show="searchLists.contacts.length">联系人</div>
        <xm-list :lists="searchLists.contacts"></xm-list>
      </div>
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
  computed: {
    ...mapState({
      'initFriendList': state => state.friend.initFriendList
    }),
    searchLists () {
      let vm = this
      if (!vm.searchText) {
        return {contacts: []}
      } else {
        return {contacts: vm.initFriendList.filter(item => {
          return item.userName.indexOf(vm.searchText) > -1
        })}
      }
    }
  },
  methods: {
    searchInputVal (e) {
      let vm = this
      vm.searchText = e.target.value.trim()
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
      background-color: #ffffff;
      .search-wrap{
        height: 108px;
        padding: 20px;
        background-color: #ffffff;
        .search__input{
          width: 100%;
          height: 100%;
          padding-left: 30px;
          border-radius: 40px;
          background-color: #EDEDED;
        }
      }
      .search_res_wrap{
        padding: 20px;
        .res_title{
          padding: 20px 0;
          text-align: left;
          border-bottom: 1px solid #EBEBEB;
          @include font(30px, #333333)
        }
      }
    }
  }
</style>
