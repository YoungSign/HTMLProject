<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="sect-wrap">
        <div class="list_item">
          <div class="list__portrait">
            <img :src="groupItemInfo.avatar || defaultAvatar">
          </div>
          <div class="list_input">
            <input type="text" :value="groupName" @input="changeName($event)">
          </div>
        </div>
        <div class="btn_item">
          <button :disabled="btnDsiable" :class="{ active: !btnDsiable }" @click="editOrgName()">完 成</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      defaultAvatar: require('@/assets/imgs/avatar_default.jpg'),
      btnDsiable: true,
      groupName: '',
      paramsReady: {
        from: 0,
        to: 0,
        name: '',
        orgInfo: {
          groupName: '',
          groupPortraitId: '',
          groupProclamation: '',
          groupIntroduction: ''
        }
      }
    }
  },
  methods: {
    changeName (e) {
      let vm = this
      vm.btnDsiable = false
      vm.groupName = e.target.value
    },
    editOrgName () {
      let vm = this
      vm.paramsReady.from = vm.groupItemInfo.userId
      vm.paramsReady.to = vm.groupItemInfo.groupId
      vm.paramsReady.type = 1
      vm.paramsReady.orgInfo.groupName = vm.groupName
      vm.paramsReady.orgInfo.groupProclamation = vm.groupItemInfo.groupProclamation
      let param = vm.paramsReady
      vm.$store.dispatch('updateOrgInf', { param, vm })
      let temp = vm.groupItemInfo
      temp.groupName = vm.groupName
      sessionStorage.setItem('userInfos', JSON.stringify(temp))
      vm.$store.commit('setUserInfos', { userInfos: temp })
    }
  },
  computed: {
    groupItemInfo () {
      return JSON.parse(sessionStorage.getItem('userInfos'))
    }
  },
  created () {
    let vm = this
    vm.groupName = vm.groupItemInfo.groupName || ''
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
      .sect-wrap{
        height: 108px;
        line-height: 108px;
        color: #666666;
        .list_item{
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin: 20px;
          padding: 20px 2px;
          border-top: 1px solid #999999;
          border-bottom: 1px solid #999999;
          .list__portrait{
            width: 72px;
            height: 72px;
            border-radius: 6px;
            overflow: hidden;
            background-color: $base-bg-color;
            margin: 0 20px;
            img{
              width: 100%;
              height: 100%;
              vertical-align: initial;
            }
          }
          .list_input{
            flex-grow: 1;
            input{
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
        .btn_item{
          button{
            width: 400px;
            padding: 20px;
            font-size: 28px;
            border-radius: 6px;
            &.active{
              background: #0096FF;
              color: #ffffff;
            }
          }
        }
      }
    }
  }
</style>
