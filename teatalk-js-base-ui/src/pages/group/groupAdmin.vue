<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <xm-list :lists="displayLists" :groupInfo="groupItemInfo" :adminIds="administratorsIds" :isRemoveLeader="removeLeader"></xm-list>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      removeLeader: 0,
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
      'userId': state => state.base.userId,
      'userInfos': state => state.group.userInfos
    }),
    groupItemInfo () {
      let vm = this
      if (vm.userInfos && vm.userInfos.hasOwnProperty('groupName') && vm.userInfos.hasOwnProperty('orgUserInfo')) {
        return vm.userInfos
      } else {
        return JSON.parse(sessionStorage.getItem('userInfos'))
      }
    },
    displayLists () {
      let vm = this
      return vm.groupItemInfo.orgUserInfo.filter(item => {
        return item.userId !== vm.groupItemInfo.createuserId
      })
    },
    administratorsIds () {
      let vm = this
      return vm.groupItemInfo.administratorsId
    }
  },
  created () {
    let vm = this
    vm.removeLeader = parseInt(vm.$route.query.removeLeader)
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
      background-color: #eeeeee;
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
    }
  }
</style>
