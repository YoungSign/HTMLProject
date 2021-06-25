<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <xm-list :lists="groupItemInfo.orgUserInfo"></xm-list>
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
      'userInfos': state => state.group.userInfos
    }),
    groupItemInfo () {
      let vm = this
      if (vm.userInfos && vm.userInfos.hasOwnProperty('groupName')) {
        return vm.userInfos
      } else {
        return JSON.parse(sessionStorage.getItem('userInfos'))
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
      .total-group{
        height: 108px;
        line-height: 108px;
        color: #666666;
      }
    }
  }
</style>
