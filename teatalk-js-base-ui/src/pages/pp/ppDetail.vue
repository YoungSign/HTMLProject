<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route" :btnShow="showBtns" @showBtns="setBtnsShow"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="detail__header">
        <div class="detail__portrait">
          <xm-portrait :imgList="avatarImg"></xm-portrait>
        </div>
        <div class="detail__username">{{ curItem.PPAccountName || '未命名'}}</div>
      </div>
      <div class="detail__introduction">
        <div class="sect-tit">功能介绍</div>
        <div class="sect-content">{{curItem.PPAccountDescribeInfo}}</div>
      </div>

      <div class="sect-wrap mb-20">
        <div class="sect-item" v-if="curItem.isFoucs">
          <p class="sect-tit">接收消息</p>
          <!-- <p class="sect-icon">滑动按钮</p> -->
          <div class="switch-panel" @click.stop="toggleFlag" :class="{'switch-left': flag,'switch-right': !flag}">
            <span class="switch-ico"></span>
          </div>
        </div>
        <div class="sect-item">
          <p class="sect-tit">查看历史消息</p>
          <p class="sect-icon">&#62;</p>
        </div>
      </div>
      <div class="control__wrap">
        <button class="control__btn" @click="controlBtn()">{{btnTxt}}</button>
      </div>
      <div class="sect-wrap control__bottom" v-show="showBtns">
        <div class="sect-item" @click="toggleBtns()">取消</div>
        <div class="sect-item mb-20" @click="unfollowPP()">取消关注</div>
        <div class="sect-item">清除本地消息</div>
        <div class="sect-item" @click="RecommendToFriend()">推荐公众号给朋友</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      btnTxt: '关注',
      flag: false,
      showBtns: false,
      avatarImg: [require('../../assets/imgs/avatar_default.jpg')]
    }
  },
  methods: {
    controlBtn () {
      let vm = this
      if (vm.$route.params.hasFocus) {
        vm.$router.push({
          name: 'ppChat',
          params: {
            accountId: vm.curItem.PPAccountId
          }
        })
      } else {
        let param = {
          to: vm.curItem.PPAccountId,
          eventType: 1,
          channelId: 2
        }
        vm.$store.dispatch('setPPFocus', { param, vm })
      }
    },
    toggleFlag () {
      let vm = this
      let infos = JSON.parse(sessionStorage.getItem('ppInfos'))
      infos.isReceiveMsg = !vm.flag ? 1 : 0
      vm.flag = !vm.flag
      sessionStorage.setItem('ppInfos', JSON.stringify(infos))
      vm.$store.dispatch('setPPReceive', { to: infos.PPAccountId, switcher: infos.isReceiveMsg })
    },
    setBtnsShow (data) {
      let vm = this
      vm.showBtns = data
    },
    toggleBtns () {
      let vm = this
      vm.showBtns = !vm.showBtns
    },
    unfollowPP () {
      let vm = this
      let param = {
        to: vm.curItem.PPAccountId,
        eventType: 0,
        channelId: 2
      }
      if (window.confirm(`取消关注 “${vm.curItem.PPAccountName}” 后将不再收到其下发的消息?`)) {
        vm.$store.dispatch('setPPFocus', { param, vm })
      }
    },
    RecommendToFriend () {
      let vm = this
      vm.$router.push({ name: 'ppChooseContacts' })
    }
  },
  computed: {
    ...mapState({
      'ppFocusList': state => state.pp.ppFocusList,
      'searchedPPAcounts': state => state.pp.searchedPPAcounts
    }),
    curItem () {
      let vm = this
      let cur = vm.searchedPPAcounts.filter(n => n.PPAccountId === vm.$route.params.accountId)
      console.log('vm.searchedPPAcounts-----------------------------', vm.searchedPPAcounts)
      console.log('vm.$route.params-----------------------------', vm.$route.params)
      console.log('cur-----------------------------', cur)
      vm.flag = !!cur[0].isReceiveMsg
      sessionStorage.setItem('ppInfos', JSON.stringify(cur[0]))
      return cur[0]
    }
  },
  watch: {},
  created () {
    let vm = this
    vm.$route.params.hasFocus ? vm.btnTxt = '进入订阅号' : vm.btnTxt = '关注'
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
      position: relative;
      background-color: $app-bg-color;
      .mb-20{
        margin-bottom: 20px;
      }
      .detail__header{
        display: flex;
        align-items: center;
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
      .detail__introduction{
        display: flex;
        justify-content: flex-start;
        margin-bottom: 60px;
        padding: 34px 20px;
        text-align: left;
        color: #666666;
        background-color: #FFFFFF;
        .sect-tit{
          margin-right: 40px;
        }
        .sect-content{
          width: 540px;
          word-break: break-all;
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
          border-bottom: 1px solid #e0e0e0;
          background-color: $base-bg-color;
          .sect-tit{
            margin-right: 40px;
            flex-shrink: 0;
          }
          .dr{
            padding-right: 20px;
            font-size: 24px;
          }
          .switch-panel{
            position: relative;
            transition: 1s;
            width: 100px;
            height: 40px;
            border-radius: 40px;
            background: #0096ff;
            cursor: pointer;
          }
          .switch-ico{
            transition: .5s;
            float: left;
            margin-top: 1px;
            width: 38px;
            height: 38px;
            background: #fff;
            border-radius: 50%;
          }
          .switch-left{
            background: #c7c6c6;
          }
          .switch-right{
            background: #0096ff;
          }
          .switch-left{
            .switch-ico{
              transform: translateX(0);
            }
          }
          .switch-right{
            .switch-ico{
              transform: translateX(60px);
            }
          }
        }
        &.control__bottom{
          position: fixed;
          width: 100%;
          height: calc(100% - 1.173333rem);
          display: flex;
          flex-direction: column-reverse;
          .sect-item{
            justify-content: center;
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
