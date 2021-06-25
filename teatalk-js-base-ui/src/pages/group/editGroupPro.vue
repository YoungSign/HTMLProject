<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="sect-wrap">
        <div class="list_item">
          <textarea class="procla-editor" placeholder="请编辑群公告" :disabled="canEdit" :value="proclaWord" @input="changeProcla($event)"></textarea>
        </div>
        <div class="btn_item">
          <button :disabled="btnDsiable" :class="{ active: !btnDsiable }" @click="setProcla()">完 成</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      btnDsiable: true,
      proclaWord: '',
      canEdit: false,
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
    changeProcla (e) {
      let vm = this
      vm.btnDsiable = false
      vm.proclaWord = e.target.value
    },
    setProcla () {
      let vm = this
      vm.paramsReady.from = vm.groupItemInfo.userId
      vm.paramsReady.to = vm.groupItemInfo.groupId
      vm.paramsReady.type = 2
      vm.paramsReady.orgInfo.groupName = vm.groupItemInfo.groupName
      vm.paramsReady.orgInfo.groupProclamation = vm.proclaWord
      let param = vm.paramsReady
      vm.$store.dispatch('updateOrgInf', { param, vm })
      let temp = vm.groupItemInfo
      temp.groupProclamation = vm.proclaWord
      sessionStorage.setItem('userInfos', JSON.stringify(temp))
      vm.$store.commit('setUserInfos', { userInfos: temp })
    }
  },
  computed: {
    ...mapState({
      'userInfos': state => state.group.userInfos
    }),
    groupItemInfo () {
      let vm = this
      return vm.userInfos || JSON.parse(sessionStorage.getItem('userInfos'))
    }
  },
  watch: {
    'groupItemInfo.groupProclamation': {
      handler: function (val, oldVal) {
        let vm = this
        vm.proclaWord = val
      },
      deep: true
    }
  },
  created () {
    let vm = this
    vm.proclaWord = vm.groupItemInfo.groupProclamation || ''
    vm.canEdit = !vm.$route.query.canEdit
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
        height: 300px;
        color: #666666;
        .list_item{
          width: 100%;
          height: 100%;
          .procla-editor{
            width: 100%;
            height: 100%;
            padding: 20px;
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
