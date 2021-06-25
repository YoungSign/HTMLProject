<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="search-wrap">
        <input type="text" placeholder="搜索" class="search__input" :value="searchText" @input="searchInputVal($event)">
      </div>
      <div class="immunity">
        <div class="dr">消息免打扰</div>
        <div class="switch-panel" @click.stop="isflag" :class="{'switch-left': flag,'switch-right': !flag}">
          <span class="switch-ico"></span>
        </div>
      </div>
      <xm-list :lists="displayLists"></xm-list>
      <div class="total-group">{{displayLists.length}}个群聊</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      searchText: '',
      flag: true
    }
  },
  methods: {
    searchInputVal (e) {
      let vm = this
      vm.searchText = e.target.value.trim()
    },
    // 消息免打扰
    isflag () {
      let vm = this
      vm.flag = !vm.flag
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
      .immunity{
        display: flex;
        padding: 30px 0 30px 20px;
        .dr{padding-right: 20px;font-size: 24px;}
        .switch-panel{position:relative;transition:1s;width:100px;height:40px;border-radius:40px;background:#13CE66;cursor:pointer;}
        .switch-ico{transition:.5s;float:left;margin-top:1px;width:38px;height:38px;background:#fff;border-radius:50%;}
        .switch-left{background:#c7c6c6;}
        .switch-right{background:#13CE66;}
        .switch-left .switch-ico{transform:translateX(0);}
        .switch-right .switch-ico{transform:translateX(60px);}
      }
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
