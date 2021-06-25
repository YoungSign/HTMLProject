<template>
  <div class="c-list">
    <div class="list-item" v-for="(item, index) in lists" :key="index" @click="handleItem(item)">
      <div class="list__portrait">
        <img :src="item.avatar || defaultAvatar">
      </div>
      <div class="list__name">{{item.groupName || item.name || item.userName || '未命名'}}</div>
      <div class="check-box" v-show="isAdministrator(item)"></div>
    </div>
    <div class="add__reason" v-if="isAddOrMinusMemb">
      <textarea class="add_reason_in" v-model="inviteReason" placeholder="请输入添加原因" maxlength="255"></textarea>
    </div>
    <div class="no-item" v-if="!lists.length">{{emptyListWord}}</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'xm-list',
  props: {
    lists: {
      type: Array
    },
    groupInfo: [Object],
    adminIds: [Array, Number],
    type: [Number],
    isRemoveLeader: [Number]
  },
  data () {
    return {
      inviteReason: '', // 邀请人理由
      defaultAvatar: require('@/assets/imgs/avatar_default.jpg')
    }
  },
  methods: {
    handleItem (item) {
      let vm = this
      vm.isGroupListPage && vm.goChatPage(item)
      vm.isChooseAtMemb && vm.chooseMemb(item)
      vm.isSearchMemb && vm.goChatPageFromSearch(item)
      vm.isGroupAllMemb && vm.goMembDetail(item)
      vm.isSetAdmin && vm.controlAdmin(item)
      vm.isAddOrMinusMemb && vm.addOrMinusMemb(item)
      // vm.isFocusPPList && vm.unfollowPP(item)
      vm.isFocusPPList && vm.goPPChat(item)
      // vm.isAddPPPage && vm.addPP(item)
      vm.isAddPPPage && vm.goPPDetail(item)
      vm.isPPChooseGroupPage && vm.goChatPage(item)
    },
    goChatPage (item) {
      let vm = this
      let userInfos = JSON.stringify(item)
      sessionStorage.setItem('userInfos', userInfos)
      vm.$store.commit('setUserInfos', {userInfos: item})
      if (vm.isPPChooseGroupPage) {
        let curPP = JSON.parse(sessionStorage.getItem('ppInfos'))
        let result = {
          data: {
            visitingCardInfo: {
              userId: curPP.PPAccountId,
              name: curPP.PPAccountName,
              mobileNo: ''
            }
          }
        }
        vm.$store.dispatch('msgSendcard', { chatId: item.groupId, type: 1, result })
      }
      vm.$router.push({path: `/groupChat/${item.groupId}`})
    },
    goChatPageFromSearch (item) {
      let vm = this
      vm.$router.push({path: `/chat/${item.friendUserid}`})
    },
    goMembDetail (item) {
      let vm = this
      if (vm.baseUserId === item.userId) {} else {
        vm.$router.push({
          name: 'membDetail',
          params: {
            detailId: item.userId
          }
        })
      }
    },
    chooseMemb (item) {
      let vm = this
      let msgVal = sessionStorage.getItem('orgMsgVal') || ''
      let userInfos = JSON.parse(sessionStorage.getItem('userInfos'))
      let orgMsgAtVal = JSON.parse(sessionStorage.getItem('orgMsgAtVal') === ('' || null) ? '[]' : sessionStorage.getItem('orgMsgAtVal'))
      msgVal = msgVal + item.name + ' '
      sessionStorage.setItem('orgMsgVal', msgVal)
      orgMsgAtVal.push([item.userId, item.name])
      sessionStorage.setItem('orgMsgAtVal', JSON.stringify(orgMsgAtVal))
      vm.$router.push({path: `/groupChat/${userInfos.groupId}`})
    },
    isAdministrator (el) {
      let vm = this
      if (!vm.isSetAdmin || !vm.adminIds) {
        return false
      }
      if (vm.adminIds.indexOf(el.userId) > -1) {
        return true
      }
    },
    controlAdmin (el) {
      let vm = this
      if (vm.isRemoveLeader) {
        let param = {
          orgId: vm.groupInfo.groupId,
          originCreater: vm.baseUserId,
          curCreater: el.userId
        }
        vm.$store.dispatch('changeCreater', { param, vm })
      } else {
        let param = {
          from: vm.baseUserId,
          to: vm.groupInfo.groupId,
          userId: el.userId,
          status: 1 // 增加0, 删除1
        }
        if (!vm.adminIds || vm.adminIds.indexOf(el.userId) < 0) {
          param.status = 0
        }
        vm.$store.dispatch('changeOrgManager', { param, vm })
      }
    },
    addOrMinusMemb (item) {
      let vm = this
      console.log(item)
      if (vm.type) { // 1增加
        let friendid = item.friendUserid
        let friendname = item.userName
        let orgId = vm.groupInfo.groupId
        let orgName = vm.groupInfo.groupName
        if (vm.groupInfo.groupType === 3) {
          vm.$store.dispatch('OrgInviteBuddyWithout', { friendid, friendname, orgId, orgName, inviteReason, vm })
          return
        }
        vm.$store.dispatch('OrgInviteBuddy', { friendid, friendname, orgId, orgName, vm })
      } else { // 0删除
        let param = {
          from: vm.baseUserId,
          to: vm.groupInfo.groupId,
          quitedName: vm.baseUserName,
          orgUserInfo: [{
            userId: item.userId,
            name: item.name
          }]
          // orgUserInfo: []  // 测试多人 目前ui上未实现多人
        }
        // vm.lists.forEach( item => {  // 测试多人 目前ui上未实现多人
        //   param.orgUserInfo.push({
        //     userId: item.userId,
        //     name: item.name
        //   })
        // })
        vm.$store.dispatch('quitOrg', { param, vm })
      }
    },
    unfollowPP (item) {
      let vm = this
      let param = {
        to: item.PPAccountId,
        eventType: 0,
        channelId: 2
      }
      if (window.confirm(`确定要取消关注公众号 “${item.PPAccountName}”?`)) {
        vm.$store.dispatch('setPPFocus', { param, vm })
      }
    },
    goPPChat (item) {
      let vm = this
      sessionStorage.setItem('ppInfos', JSON.stringify(item))
      vm.$store.commit('setSearchedPPAcounts', [item])
      vm.$router.push({
        name: 'ppChat',
        params: {
          accountId: item.PPAccountId
        }
      })
    },
    addPP (item) {
      let vm = this
      let param = {
        to: item.PPAccountId,
        eventType: 1,
        channelId: 2
      }
      if (window.confirm(`确定要关注公众号 “${item.PPAccountName}”?`)) {
        vm.$store.dispatch('setPPFocus', { param, vm })
      }
    },
    goPPDetail (item) {
      let vm = this
      vm.$router.push({
        name: 'ppDetail',
        params: {
          accountId: item.PPAccountId,
          hasFocus: false
        }
      })
    }
  },
  computed: {
    ...mapState({
      'baseUserId': state => state.base.userId,
      'baseUserName': state => state.base.userName
    }),
    isGroupListPage () {
      let vm = this
      return vm.$route.path === '/group'
    },
    isSetAdmin () {
      let vm = this
      return vm.$route.path === '/groupAdmin'
    },
    isAddOrMinusMemb () {
      let vm = this
      return vm.$route.path === '/addOrMinusMemb'
    },
    isChooseAtMemb () {
      let vm = this
      return vm.$route.path === '/chooseAtMemb'
    },
    isSearchMemb () {
      let vm = this
      return vm.$route.path === '/searchMemb'
    },
    isGroupAllMemb () {
      let vm = this
      return vm.$route.path === '/groupAllMemb'
    },
    isFocusPPList () {
      let vm = this
      return vm.$route.path === '/ppList'
    },
    isAddPPPage () {
      let vm = this
      return vm.$route.path === '/addPP'
    },
    isPPChooseGroupPage () {
      let vm = this
      return vm.$route.path === '/ppChooseGroup'
    },
    emptyListWord () {
      let vm = this
      if (!vm.isFocusPPList) {
        return '暂无其他群成员'
      }
      return '暂无关注的公众号'
    },
    showCheckbox () {
      let vm = this
      return vm.isSetAdmin || vm.isChooseAtMemb
    },
  }
}
</script>

<style scoped lang="scss">
  .list-item{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 1.44rem;
    padding-right: 20px;
    background-color: #ffffff;
    .check-box{
      flex: 0 0 auto;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #999999;
    }
    .list__portrait{
      flex: 0 0 auto;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      overflow: hidden;
      background-color: $base-bg-color;
      margin: 0 20px;
      img{
        width: 100%;
        height: 100%;
      }
    }
    .list__name{
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex: 1 1 auto;
      height: 100%;
      line-height: 108px;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-bottom: 1px solid #EBEBEB;
      @include font(32px, #333333)
    }
  }
  .add_reason_in {
    width: 100%;
    padding: 10px 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #EBEBEB;
  }
  .no-item{
    line-height: 60px;
  }
</style>
