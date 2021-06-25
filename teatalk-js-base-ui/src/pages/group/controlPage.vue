<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <xm-portrait-list :style="{'border-bottom': '1px solid #eeeeee'}" :itemInfo="groupItemInfo"></xm-portrait-list>
      <div class="sect-wrap mb-20">
        <div class="sect-item" @click="goAllMemb()">
          <p class="sect-tit">全部成员({{groupItemInfo.orgUserInfo.length}})</p>
          <p class="sect-icon">&#62;</p>
        </div>
      </div>
      <div class="sect-wrap mb-20">
        <div class="sect-item" @click="goEditGroupName()">
          <p class="sect-tit">群聊名称</p>
          <p class="sect-icon">
            <span class="group-name">{{groupItemInfo.groupName || "未命名"}}</span>
            &#62;
          </p>
        </div>
        <div class="sect-item" @click="goQRCodeGroup()">
          <p class="sect-tit">二维码名片</p>
          <p class="sect-icon">&#62;</p>
        </div>
        <div class="sect-item" @click="goManageGroup()">
          <p class="sect-tit">群管理</p>
          <p class="sect-icon">&#62;</p>
        </div>
        <div class="sect-item" @click="goProclaEdit()">
          <p class="sect-tit">群公告</p>
          <p class="sect-icon">&#62;</p>
        </div>
      </div>
      <div class="sect-wrap">
        <div class="sect-btn-item" @click="quitOrg()">退出群组</div>
        <div class="sect-btn-item" @click="unorganize()">解散群组</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { EventBus } from '../../event-bus'

export default {
  data () {
    return {
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
  computed: {
    ...mapState({
      'userId': state => state.base.userId,
      'userName': state => state.base.userName,
      'userInfos': state => state.group.userInfos
    }),
    groupItemInfo () {
      let vm = this
      if (vm.userInfos && vm.userInfos.hasOwnProperty('groupName')) {
        return vm.userInfos
      } else {
        return JSON.parse(sessionStorage.getItem('userInfos'))
      }
    },
    isGroupLeader () {
      let vm = this
      return vm.groupItemInfo && vm.groupItemInfo.createuserId === vm.userId
    },
    isAdministrator () {
      let vm = this
      return vm.groupItemInfo && Array.isArray(vm.groupItemInfo.administratorsId) &&
             vm.groupItemInfo.administratorsId.includes(vm.userId)
    }
  },
  methods: {
    goAllMemb () {
      let vm = this
      vm.$router.push({name: 'groupAllMemb'})
    },
    goManageGroup () {
      let vm = this
      if (vm.groupItemInfo.createuserId === vm.userId) {
        vm.$router.push({name: 'groupManage'})
      } else {
        EventBus.$emit('showToast', '只有群主才能设置管理员')
      }
    },
    goEditGroupName () {
      let vm = this
      if (vm.groupItemInfo.createuserId === vm.userId || vm.isAdministrator) {
        vm.$router.push({name: 'editGroupName'})
      } else {
        EventBus.$emit('showToast', '只有群主和管理员才能修改群名称')
      }
    },
    goQRCodeGroup () {
      let vm = this
      vm.$router.push({name: 'QRCodeGroup'})
    },
    goProclaEdit () {
      let vm = this
      if (vm.groupItemInfo.createuserId === vm.userId || vm.isAdministrator) {
        vm.$router.push({path: '/editGroupPro', query: { canEdit: 1 }})
      } else {
        // EventBus.$emit('showToast', '只有群主和管理员才能修改群公告')
        vm.$router.push({path: '/editGroupPro', query: { canEdit: 0 }})
      }
    },
    quitOrg () {
      let vm = this
      if (vm.isGroupLeader && vm.groupItemInfo.orgUserInfo.length > 1) {
        // 转让群主
        EventBus.$emit('showToast', '请先转移群主!')
        // return
      } else {
        let param = {
          from: vm.userId,
          to: vm.groupItemInfo.groupId,
          quitedName: vm.userName
        }
        vm.$store.dispatch('quitOrg', { param, vm })
      }
    },
    unorganize () {
      let vm = this
      let param = {
        from: vm.groupItemInfo.userId,
        to: vm.groupItemInfo.groupId
      }
      if (vm.groupItemInfo.createuserId === vm.userId) {
        vm.$store.dispatch('unorganize', { param, vm })
      } else {
        EventBus.$emit('showToast', '没有权限!')
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
      background-color: #eeeeee;
      .mb-20{
        margin-bottom: 20px;
      }
      .sect-wrap{
        color: #666666;
        .sect-item{
          height: 108px;
          line-height: 108px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          font-size: 28px;
          border-bottom: 1px solid #e0e0e0;
          background-color: $base-bg-color;
          .sect-tit{
            margin-right: 40px;
            flex-shrink: 0;
          }
          .sect-icon{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        .sect-btn-item{
          width: 90%;
          height: 88px;
          line-height: 88px;
          margin: 30px auto;
          color: #ffffff;
          font-size: 32px;
          background-color: #d15757;
          border-radius: 100px;
          box-shadow: 2px 2px 3px #999999;
        }
      }
    }
  }
</style>
