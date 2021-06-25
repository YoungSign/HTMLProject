<template>
  <div id="app">
    <router-view/>
    <!--提示对话框-->
    <xm-dialog :dialogVisible.sync="dialogVisible"
               :dialogText="dialogText">
    </xm-dialog>
    <!--toast提示-->
    <xm-toast :toastVisible.sync="toastVisible"
              :toastText="toastText">
    </xm-toast>
    <!--二人音视频-->
    <xm-voip-single :voipSingleVisible.sync="voipSingleVisible"></xm-voip-single>
  </div>
</template>

<script>
import { EventBus } from './event-bus'
import {RoomStatus} from './store/av-module/av-status'

export default {
  name: 'App',
  data () {
    return {
      dialogText: '',
      dialogVisible: false,
      toastText: '',
      toastVisible: false,
      voipSingleData: {},
      voipSingleVisible: false
    }
  },
  created () {
    let vm = this
    console.log('UI___curRoute: ', vm.$route)
    if (window.TeatalkSdk) {
      window.TeatalkSdk.init({
        BASE: {
          connect_url: this.ApiUrl
        },
        TRANSFER: {
        },
        RTC: { // 音视频功能配置（未完）
          appKey: '', // 应用key
          appSecret: '', // 应用密钥
          xmRtcUrl: '', // 音视频服务地址
          inviteExpire: 30000
        },
        ENTERPRISE: {
          baseURL: 'http://124.42.103.164:8086', // 基础版
          timeout: 5000
        }
      })
      if (vm.$route.name !== 'loginPage') {
        // 刷新自动登录
        vm.autoLogin()
      }
    }
    EventBus.$on('routerReplace', (targetRoute) => {
      vm.$router.replace(targetRoute)
    })
    EventBus.$on('showDialog', (content) => {
      vm.dialogText = content
      vm.dialogVisible = true
    })
    EventBus.$on('showToast', (content) => {
      vm.toastText = content
      vm.toastVisible = true
    })
    EventBus.$on('showVoipSingle', () => {
      vm.voipSingleVisible = true
    })
    EventBus.$on('hideVoipSingle', () => {
      vm.voipSingleVisible = false
    })
  },
  computed: {
    avStatus () {
      return this.$store.state.av.status
    }
  },
  watch: {
    avStatus (to, from) {
      if (to === RoomStatus.IDEL) {
        this.voipSingleVisible = false
      } else {
        if (to === RoomStatus.HUNGUP) {
          EventBus.$emit('showToast', '已挂断 ' + this.$store.state.av.hungupReason)
          this.$store.dispatch('av/close')
        }
        this.voipSingleVisible = true
      }
    }
  },
  methods: {
    autoLogin () {
      if (!window.TeatalkSdk.ses) {
        // 刷新自动登录
        let vm = this
        let username = sessionStorage.getItem('username')
        let password = sessionStorage.getItem('password')
        let logonType = sessionStorage.getItem('logonType')
        let channel = sessionStorage.getItem('channel')
        let type = sessionStorage.getItem('type')
        let status = sessionStorage.getItem('status')
        if (typeof username === 'string' && username.length > 0 &&
            typeof password === 'string' && password.length > 0 &&
            typeof logonType === 'string') {
          this.$store.dispatch('doLogin', { username, password, logonType, channel, type, status, targetRoute: this.$route.path, vm })
          return
        }
      }
      this.$router.replace('/login')
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100%;
  background-color: $app-bg-color;
}
</style>
