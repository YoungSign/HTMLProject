<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="detail__header">
        <div class="detail__portrait">
          <xm-portrait :imgList="avatarImg"></xm-portrait>
        </div>
        <div class="detail__username">{{curFriend.name || '未命名'}}</div>
      </div>
      <div class="sect-wrap mb-20">
        <div class="sect-item" v-show="isFriend">
          <p class="sect-tit">分组</p>
        </div>
        <div class="sect-item" @click="goFirendCircle()">
          <p class="sect-tit">朋友圈</p>
        </div>
      </div>
      <div class="control__wrap">
        <button class="control__btn" @click="controlBtn()">{{btnTxt}}</button>
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
      membDdetailId: 0,
      btnTxt: '添加好友',
      isFriend: false,
      curFriend: {},
      avatarImg: [require('../../assets/imgs/avatar_default.jpg')]
    }
  },
  methods: {
    goFirendCircle () {
      let vm = this
      if (vm.isFriend) {} else {
        EventBus.$emit('showToast', '此用户为陌生人，不能查看朋友圈!')
      }
    },
    controlBtn () {
      let vm = this
      if (vm.btnTxt === '添加好友') {
        vm.$store.dispatch('addFriend', { friUserId: vm.membDdetailId })
        vm.btnTxt = '等待验证'
      } else if (vm.btnTxt === '发消息') {
        vm.$router.push({path: `/chat/${vm.membDdetailId}`})
      }
    }
  },
  computed: {
    ...mapState({
      'initFriendList': state => state.friend.initFriendList,
      'friNotifyList': state => state.friend.friNotifyList,
      'userInfos': state => state.group.userInfos
    }),
    groupItemInfo () {
      let vm = this
      return vm.userInfos || JSON.parse(sessionStorage.getItem('userInfos'))
    }
  },
  created () {
    let vm = this
    let orgUserInfo = vm.groupItemInfo.orgUserInfo || []
    vm.isFriend = false
    vm.curFriend = {}
    vm.membDdetailId = vm.$route.params.detailId
    for (let i = 0, len = vm.initFriendList.length; i < len; i++) {
      if ((vm.initFriendList)[i].friendUserid === vm.membDdetailId) {
        vm.isFriend = true
        vm.btnTxt = '发消息'
        break
      }
    }
    for (let j = 0, ln = vm.friNotifyList.length; j < ln; j++) {
      if ((vm.friNotifyList)[j].friendUserId === vm.membDdetailId) {
        vm.btnTxt = '等待验证'
        break
      }
    }
    for (let k = 0, l = orgUserInfo.length; k < l; k++) {
      if (orgUserInfo[k]['userId'] === vm.membDdetailId) {
        vm.curFriend = orgUserInfo[k]
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
      .detail__header{
        display: flex;
        align-items: center;
        background-color: #FFFFFF;
        margin-bottom: 60px;
        padding: 40px;
        .detail__portrait{
          flex: 0 0 auto;
          width: 130px;
          height: 130px;
          margin-right: 20px;
          border-radius: 50%;
          overflow: hidden;
          background-color: $base-bg-color;
          img{
            width: 100%;
            height: 100%;
          }
        }
        .detail__username {
          width: 460px;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
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
          background-color: $base-bg-color;
          .sect-tit{
            margin-right: 40px;
            flex-shrink: 0;
          }
        }
      }
      .control__wrap{
        padding: 10px 30px;
        margin-top: 30px;
        .control__btn{
          width: 100%;
          height: 80px;
          line-height: 80px;
          text-align: center;
          border-radius: 100px;
          border: 0;
          background-color: #0096FF;
          @include font(36px, #FFFFFF);
        }
      }
    }
  }
</style>
