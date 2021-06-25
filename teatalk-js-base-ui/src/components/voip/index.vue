<template>
    <div class="c-voip" v-if="voipSingleVisible">
      <div class="c-voip__wrapper">
        <div class="voip__top">
          <!--最小化按钮-->
          <!--<div class="voip__minimize" v-show="isConnected"></div>-->
          <!--视频通话用户信息-->
          <div class="voip__portrait" v-if="!isConnected&&!isVoice">
            <div class="voip__img"></div>
            <div class="voip__msg">
              <div class="voip__top-nickname">{{toUserId}}</div>
              <div class="voip__top-tip">{{portraitMsg}}</div>
            </div>
          </div>
          <!--视频通话小窗口-->
          <div class="voip__min-win" v-if="isConnected&&!isVoice">
            <myVideo :muted="true" playsinline class="video-min" :stream="myStatus.streams[0] && myStatus.streams[0].streamObj" id="videoEleMin" />
          </div>
        </div>
        <div class="voip__mid" v-if="isVoice">
          <div class="portrait__img">
            <img :src="imgSrc">
          </div>
          <div class="portrait__nickname">{{toUserId}}</div>
          <div class="portrait__msg" v-if="!isConnected">{{portraitMsg}}</div>
        </div>
        <div class="voip__bottom">
          <div class="voip__connect-time" v-if="isConnected">
            {{formatConversationTime(initTime)}}
          </div>
          <!--<div class="switch-voice" v-if="!isVoice&&isConnected">-->
            <!--<div class="voip__icon"></div>-->
            <!--<div class="voip__text">切换到语音聊天</div>-->
          <!--</div>-->
          <div class="voip__control" :class="{'space-evenly':isConnected}">
            <div class="voip__btn-wrap switch-vo" v-if="isConnected&&!isVoice">
              <div class="voip__icon" @click="handleSwitchToVoice"></div>
              <div class="voip__text">切到语音聊天</div>
            </div>
            <div class="voip__btn-wrap mute" v-if="isConnected&&isVoice">
              <div class="voip__icon" :class="{'mute-open-icon': isMute}" @click="handleMute"></div>
              <div class="voip__text" :class="{'mute-open-text': isMute}">静音</div>
            </div>
            <div class="voip__btn-wrap">
              <div class="voip__btn-big voip__hang-up" @click="handleHangUp"></div>
            </div>
            <div class="voip__btn-wrap" v-show="!isConnected&&!isCreator">
              <div class="voip__btn-big voip__answer" @click="handleAnswer"></div>
            </div>
            <div class="voip__btn-wrap hands-free" v-if="isConnected&&isVoice">
              <div class="voip__icon"></div>
              <div class="voip__text">免提</div>
            </div>
            <div class="voip__btn-wrap switch-camera" v-if="isConnected&&!isVoice">
              <div class="voip__icon"></div>
              <div class="voip__text">转换摄像头</div>
            </div>
          </div>
        </div>
        <audio autoplay id="audioEle"></audio>
        <myVideo class="video-max" :stream="peerStatus.streams[0] && peerStatus.streams[0].streamObj" id="videoEle" v-if="isConnected&&!isVoice" />
      </div>
    </div>
</template>

<script>
import avatarDefault from '../../assets/imgs/avatar_default.jpg'
import {RoomStatus} from '../../store/av-module/av-status'
import { mapState } from 'vuex'
import myVideo from './video'
export default {
  name: 'xm-voip-single',
  props: {
    voipSingleVisible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      initTime: 0,
      timer: null,
      imgSrc: avatarDefault
    }
  },
  components: {
    myVideo
  },
  computed: {
    ...mapState({
      'userId': state => state.base.userId,
      'toUserId': state => state.base.toUserId,
      'mediaType': state => state.av.mediaType,
      'creator': state => state.av.creator,
      'status': state => state.av.status,
      users: state => state.av.users
      // 'isMute': state => state.voip.isMute
    }),
    myStatus () {
      return this.users.find(u => u.id === this.userId)
    },
    peerStatus () {
      return this.users.find(u => u.id !== this.userId)
    },
    isMute () {
      return this.myStatus.isMute
    },
    isCreator () {
      return this.creator === this.userId
    },
    isVoice () {
      return this.mediaType === 1
    },
    portraitMsg () {
      let txt = this.isVoice ? '音频通话' : '视频聊天'
      return this.isCreator ? '正在等待对方接受邀请' : '邀请你进行' + txt
    },
    isConnected () {
      return this.status === RoomStatus.CONNECTED
    }

  },
  watch: {
    isConnected (newVal, oldVal) {
      let vm = this
      if (newVal) {
        vm.startCount()
      } else {
        clearInterval(vm.timer)
        vm.initTime = 0
      }
    }
  },
  methods: {
    // 挂断
    handleHangUp () {
      this.$store.dispatch('av/hangup')
    },
    // 接听
    handleAnswer () {
      this.$store.dispatch('av/accept')
    },
    handleSwitchToVoice () {
      this.$store.dispatch('degradePeerAv')
    },
    // 静音
    handleMute () {
      let isMuted = !this.myStatus.isMuted
      this.$store.dispatch('mute', {isMuted})
    },
    // 通话计时相关
    startCount () {
      let vm = this
      vm.initTime = 0
      vm.timer = setInterval(() => {
        vm.initTime++
      }, 1000)
      vm.$once('hook:beforeDestroy', () => {
        clearInterval(vm.timer)
        vm.initTime = 0
      })
    },
    addZero (num) {
      return num < 10 ? '0' + num : num
    },
    formatConversationTime (time) {
      let vm = this
      let h = Math.floor(time / 3600)
      let m = Math.floor(time / 60)
      let s = time % 60
      if (time / 3600 < 1) {
        return vm.addZero(m) + ':' + vm.addZero(s)
      } else {
        return vm.addZero(h) + ':' + vm.addZero(m - h * 60) + ':' + vm.addZero(s)
      }
    }
  }
}
</script>

<style scoped lang="scss">
    .c-voip{
      .c-voip__wrapper{
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1001;
        background: #1a1a1a;
        color: #ffffff;
        .voip__top{
          position: absolute;
          top: 110px;
          left: 0;
          width: 100%;
          padding: 0 24px;
          @include displayFlex(space-between,flex-start);
          z-index: 1003;
          .voip__minimize{
            width: 76px;
            height: 76px;
            @include backgroundImg("../../assets/imgs/zoom.png",100% 100%);
          }
          .voip__portrait{
            @include displayFlex(flex-start);
            .voip__img{
              width: 144px;
              height: 144px;
              border-radius: 50%;
              @include backgroundImg("../../assets/imgs/avatar_default.jpg")
            }
            .voip__msg{
              margin-left: 32px;
              text-align: left;
              .voip__top-nickname{
                line-height: 56px;
                @include font(36px,#ffffff);
              }
              .voip__top-tip{
                line-height: 36px;
                @include font(24px,#ffffff);
              }
            }
          }
          .voip__min-win{
            width: 180px;
            height: 320px;
            background: #e0e0ee;
            .video-min{
              width: 100%;
              height: 100%;
            }
          }
        }
        .voip__mid{
          position: absolute;
          top: 310px;
          left: 0;
          width: 100%;
          text-align: center;
          z-index: 1003;
          .portrait__img{
            width: 240px;
            height: 240px;
            margin-left: auto;
            margin-right: auto;
            border-radius: 50%;
            background-color: black;
            img{
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
          .portrait__nickname{
            @include font(36px, #ffffff);
            padding: 30px 0;
          }
          .portrait__msg{
            @include font(24px, #999999);
          }
        }
        .voip__bottom{
          position: fixed;
          left: 0;
          bottom: 224px;
          width: 100%;
          z-index: 1003;
          .voip__connect-time{
            position: fixed;
            right: 0;
            bottom: 430px;
            width: 100%;
            text-align: center;
            @include font(36px, #ffffff);
          }
          .switch-voice{
            position: fixed;
            right: 0;
            bottom: 420px;
            width: calc(50% - 70px);
            .voip__icon{
              width: 80px;
              height: 80px;
              margin: 0 auto 16px auto;
              @include backgroundImg("../../assets/imgs/mute.png");
            }
            .voip__text{
              @include font(24px, #999999);
            }
          }
          .voip__control{
            width: 100%;
            @include displayFlex(space-around,center);
            &.space-evenly{
              justify-content: space-evenly;
            }
            .voip__btn-wrap{
              .voip__icon{
                width: 80px;
                height: 80px;
                margin-bottom: 16px;
              }
              &.switch-vo,
              &.mute,
              &.hands-free,
              &.switch-camera{
                transform: translateY(30px);
              }
              &.switch-vo{
                width: 80px;
                .voip__icon{
                  @include backgroundImg("../../assets/imgs/btn_changevioce.png");
                }
              }
              &.mute{
                width: 80px;
                .voip__icon{
                  @include backgroundImg("../../assets/imgs/btn_mute.png");
                }
                .mute-open-icon{
                  @include backgroundImg("../../assets/imgs/btn_mute_open.png");
                }
                .mute-open-text{
                  color: #ffffff;
                }
              }
              &.hands-free{
                .voip__icon{
                  @include backgroundImg("../../assets/imgs/btn_speaker.png");
                }
              }
              &.switch-camera{
                width: 80px;
                .voip__icon{
                  @include backgroundImg("../../assets/imgs/btn_changecam.png");
                }
              }
              .voip__btn-big{
                width: 140px;
                height: 140px;
                border-radius: 50%;
              }
              .voip__hang-up{
                @include backgroundImg("../../assets/imgs/hang-up.png");
              }
              .voip__answer{
                @include backgroundImg("../../assets/imgs/answer.png");
              }
              .voip__text{
                width: 180%;
                transform: translateX(-18%);
                @include font(24px, #999999);
              }
            }
          }
        }
        .video-max{
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 1002;
        }
      }
    }
</style>
