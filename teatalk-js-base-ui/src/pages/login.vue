<template>
    <div class="page-container">
        <div class="l-header">
            <xm-top-nav :curRoute="$route"></xm-top-nav>
        </div>
        <div class="l-main">
            <div class="login-container">
              <div class="qrcode-btn" @click="changeLoginType">{{logonType != 2 ? '二维码登陆': "账号登陆"}}</div>
              <div v-show="logonType != 2">
                <div class="input-container">
                    <input class="input-val"
                           ref="usernameInput"
                           type="tel"
                           maxlength="100"
                           placeholder="请输入手机号"
                           @focus="handleInputFocus(form.username)"
                           @blur="handleInputBlur(form.username)"
                           @input="handleInput()"
                           v-model="form.username.value" required>
                    <div class="input-op">
                        <div class="input-op-item clear-btn"
                             v-show="form.username.value"
                             @click="clearInput(form.username)"></div>
                    </div>
                </div>
                <div class="input-container">
                  <!-- maxlength="16" -->
                    <input class="input-val"
                           ref="passwordInput"
                           :type="pwdType"
                           placeholder="请输入密码"
                           @focus="handleInputFocus(form.password)"
                           @blur="handleInputBlur(form.password)"
                           @input="handleInput()"
                           v-model="form.password.value">
                    <div class="input-op">
                        <div class="input-op-item clear-btn"
                             v-show="form.password.value"
                             @click="clearInput(form.password)"></div>
                        <div class="input-op-item"
                             :class="{ 'show-pwd-btn': isShowPwd, 'hide-pwd-btn': !isShowPwd }"
                             @click="switchPwdType"></div>
                    </div>
                </div>
                <div class="button-container">
                  <button class="login-btn" type="submit" @click="handleLogin" :disabled="isButtonDisabled">登录</button>
                </div>
                <!-- <template>
                  <el-radio v-model="logonType" label="0">密码登录</el-radio>
                  <el-radio v-model="logonType" label="1">token登录</el-radio>
                </template> -->
                <div class="log-params-list">
                  <div>
                    <p class="input-label">
                      <span>请输入登录方式：</span>
                      <input style="height: 100%; border: 1px solid #000; "
                          type="text"
                          placeholder=""
                          v-model="logonType">
                    </p>
                    <p>0为密码登录、1为token登录</p>
                  </div>
                  <div>
                    <p class="input-label">
                    <span>请输入渠道号：</span>
                    <input style="height: 100%; border: 1px solid #000; "
                          type="text"
                          placeholder=""
                          v-model="channel">
                    </p>
                  </div>
                  <div>
                    <p class="input-label">
                    <span>请输入登录type：</span>
                    <input style="height: 100%; border: 1px solid #000; "
                          type="text"
                          placeholder=""
                          v-model="type">
                    </p><span>2为pc端登录、3为web端登录</span>
                  </div>
                  <div>
                    <p class="input-label">
                    <span>请输入status：</span>
                    <input style="height: 100%; border: 1px solid #000; "
                          type="text"
                          placeholder=""
                          v-model="status">
                    </p>
                    <span>0为内网、1为外网</span>
                  </div>
                  <div>
                    <p class="input-label">
                    <span>请输入对方userid</span>
                    <input style="height: 100%; border: 1px solid #000; "
                          type="text"
                          placeholder=""
                          v-model="toUserId">
                    </p>
                  </div>
                </div>
                
              </div>
              <div class="qrcode-container" v-show="logonType == 2">
                  <!-- <button @click="checkQrcodeStatus">查询二维码状态</button> -->
                  <div class="qrcode">
                    <img :src="qrcodeUrl" alt="">
                  </div>
                  <p v-show="qrcodeTip">{{qrcodeTip}} <span @click="getQrcode" v-if="qrErrorCode == 3">重新获取二维码</span></p>
              </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import QRCode from 'qrcode'
export default {
  data () {
    return {
      isShowPwd: false,
      isButtonDisabled: true,
      form: {
        username: {
          value: sessionStorage.getItem('username') || '+86',
          name: 'username',
          isFocus: false
        },
        password: {
          value: sessionStorage.getItem('password') || 'q12345678',
          name: 'password',
          isFocus: false
        }
      },
      toUserId: sessionStorage.getItem('toUserId') || '180000220221',
      logonType: 0,
      channel: 40003,
      type: 3,
      status: 1,
      qrcode: '',
      qrcodeUrl: '',
      qrcodeTip: '',
      qrErrorCode: 0
    }
  },
  methods: {
    switchPwdType () {
      let vm = this
      vm.isShowPwd = !vm.isShowPwd
    },
    handleInput () {
      let vm = this
      vm.checkButtonDisabled()
    },
    handleInputFocus (target) {
      let vm = this
      vm.checkButtonDisabled()
      target.isFocus = true
    },
    handleInputBlur (target) {
      target.isFocus = false
    },
    clearInput (target) {
      let vm = this
      target.value = ''
      if (target.name === 'username') {
        vm.$refs.usernameInput.focus()
      } else if (target.name === 'password') {
        vm.$refs.passwordInput.focus()
      }
    },
    handleLogin () {
      let vm = this
      let username = vm.form.username.value
      let password = vm.form.password.value
      console.log(vm.logonType)
      let logonType = vm.logonType // 0:密码登录 1:token登录 2:扫码登陆
      let channel = vm.channel
      let type = vm.type // 2:pc 3:web
      let status = vm.status // 0:内网 1:外网
      vm.$store.dispatch('doLogin', { username, password, logonType, channel, type, status, targetRoute: '/', vm })

      sessionStorage.setItem('toUserId', vm.toUserId)
    },

    checkButtonDisabled () {
      let vm = this
      vm.isButtonDisabled = !(vm.form.username.value && vm.form.password.value)
    },

    changeLoginType() {
      let vm = this;
      vm.logonType = vm.logonType !=2 ? 2 : 0;
      if (vm.logonType  == 2) { //登陆方式为2时 获取扫码登陆的唯一识别码
        vm.initQrcode();
      }
    },

    // 初始化二维码登陆
    initQrcode() {
      let vm = this;
      let logonType = vm.logonType // 0:密码登录 1:token登录 2:扫码登陆
      let channel = vm.channel
      let type = vm.type // 2:pc 3:web
      let status = vm.status // 0:内网 1:外网
      window.TeatalkSdk.invoke('connect', {
            options: {
                keepAlive: 30,
                logonType,
                channel,
                type,
                status
            }, 
            callback: (success, result, reason) => {
                console.log('UI___connectCallback-res:', result)
                    if (!success) {
                        console.warn('通信连接失败', result, reason)
                        return
                    }
                    if (result.response === 'OK') { 
                        // 登录连接成功
                        vm.qrcode = result.codeUrl;

                        // vm.qrcode = result.codeUrl = result.codeUrl.replace(/(\d+)/g, '1623809984029')
                        vm.showQrcode(result);
                    }
            }
        })
        
        // 刷新自动登录用
        sessionStorage.setItem('logonType', logonType)
        sessionStorage.setItem('channel', channel)
        sessionStorage.setItem('type', type)
        sessionStorage.setItem('status', status)
    },

    //获取二维码
    getQrcode() {
      let vm = this;
      let logonType = vm.logonType // 0:密码登录 1:token登录 2:扫码登陆
      let channel = vm.channel
      let type = vm.type // 2:pc 3:web
      let status = vm.status // 0:内网 1:外网
      vm.qrcodeTip = '';
      window.TeatalkSdk.invoke('getQrcode', {
            options: {
                keepAlive: 30,
                logonType,
                channel,
                type,
                status
            }, 
            callback: (success, result, reason) => {
                console.log('UI___connectCallback-res:', result)
                    if (!success) {
                        console.warn('通信连接失败', result, reason)
                        return
                    }
                    if (result.response === 'OK') { 
                        // 登录连接成功
                        vm.qrcode = result.codeUrl;

                        // vm.qrcode = result.codeUrl = result.codeUrl.replace(/(\d+)/g, '1623809984029')
                        vm.showQrcode(result);
                    }
            }
        })
    },

    // 生成二维码图
    showQrcode(result) {
      let vm = this;
      QRCode.toDataURL(result.codeUrl).then(url => {
        vm.qrcodeUrl = url;
        setTimeout(() => {
          vm.checkQrcodeStatus()
          },1000);
      }).catch(err => {
        console.error(err)
      })
    },



    // 查询二维码状态
    checkQrcodeStatus () {
      let vm = this;
      let qrcode = vm.qrcode;
      vm.$store.dispatch('getQrcodeState', {qrcode, targetRoute: '/', vm, callback: function(success, result, reason) {
        vm.qrcodeTip = reason;
        vm.qrErrorCode = result.status;
          console.log('---status---', result.status)
        if (success) { 
          if(result.status == 0 || result.status == 1) {
             vm.qrcodeTip = result.status == 1 ? '已扫描待确认' : '未扫描';
            // setTimeout(vm.checkQrcodeStatus, 1000);
          } else if(result.status == 3) {
            vm.qrcodeTip = "二维码已失效";
          }
        } else {
          console.error(reason)
        }
      }})
    }
  },

  computed: {
    ...mapState({
      'loginStatus': state => state.base.loginStatus
    }),

    pwdType () {
      let vm = this
      return vm.isShowPwd ? 'text' : 'password'
    }
  },
  created () {
    let vm = this
    vm.checkButtonDisabled()
    sessionStorage.setItem('toUserId', vm.toUserId)
  }
}
</script>

<style scoped lang="scss">
    .page-container{
        padding-top: 88px;
        padding-bottom: 98px;
        height: 100%;
        background-color: $base-bg-color;
        .l-header{
            @include l-header;
        }
        .l-main{
            width: 100%;
            .login-container{
                position: relative;
                width: 630px;
                margin: 180px auto 0;
                .input-container{
                    /*position: relative;*/
                    width: 100%;
                    height: 120px;
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: $base-border;
                    .input-val{
                        flex: 1 1 auto;
                        height: 45px;
                        /*width: 100%;*/
                        border: 0;
                        outline: 0;
                        border-radius: 0;
                        @include font(36px, #999999);
                    }
                    .input-op{
                        /*position: absolute;*/
                        /*top: 0;*/
                        /*right: 0;*/
                        @include displayFlex(flex-end);
                        height: 100%;
                        .input-op-item{
                            width: 40px;
                            height: 40px;
                            background-repeat: no-repeat;
                            background-size: 100% auto;
                            margin-left: 40px;
                        }
                        .clear-btn{
                            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAHlBMVEUAAADMzMzNzc3Nzc3Nzc3MzMzMzMzPz8/Ozs7Nzc2Z5bCdAAAACnRSTlMA/lXB0M9LSiopP4KJtgAAAH5JREFUOMtjGAWkgslhMFapBYqEoaAChMEkKIwiESgoBGEoCoqgSBQKCipANAiKwQWhAkJgDSAFcAATgcljaIFJY2qByGLRAtWAqQWqAVMLVAOmFoQGwhIIowhZTti5CA8SDBLMQCQu2BNxRZQjWtQSTgyTw2GsEguGUUAiAAAoUA/JvBWTsAAAAABJRU5ErkJggg==");
                        }
                        .show-pwd-btn{
                            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAV1BMVEUAAADNzc3Q0NDNzc3Nzc3Nzc3Ozs7X19fNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Ozs7Pz8/Pz8/Nzc3MzMzNzc3MzMzMzMzNzc3Ozs7Ozs7Ozs7V1dXNzc3MzMxIIVLAAAAAHHRSTlMA9RjJwmlkCO7oz72kfFQ1Iory2qt5bVg+KRKJvRKyKgAAAOlJREFUSMftVNcShCAMvAh2VLC3///OgwNGsN3kWffJJLtOGvm8eC6CiNEGoKEsCv6z4zBbHWRhfE/v03WHtL+RTNl6gmy64oegGbQbeRzzsaPahvCcX+ioCJz6hf5Hcc1ns++d2ZWiVP56OAaGWkXKQ/MT6U0qY0UEgETGqH6h/UhalX5lxLkuNg+MQhXS+nyuCLYZkm8Utn3K4J5ASA+x+WwjsFkR+S08AXXqIpuAOB2hnkBthC0LNgHYlqgdQQvQKaGLxrcVPzj8auCXD7/eR0W9uA9oAc3HPlHsEcCeGeQhQ57KF4/FFwhjLcIUtz4iAAAAAElFTkSuQmCC");
                        }
                        .hide-pwd-btn{
                            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAUVBMVEUAAADNzc3Ozs7W1tbNzc3Pz8/Nzc3MzMzNzc3MzMzNzc3Nzc3Nzc3Nzc3Nzc3MzMzNzc3Nzc3MzMzNzc3Ozs7Nzc3Ozs7R0dHX19f////MzMxg+QCeAAAAGnRSTlMA+zoKaiT28One25uCfXPIt6eRTD4zKiETA+EbngEAAACZSURBVEjH7czHDsMgEEXRoYMxuLf5/w8NJIvIlEjJLhJned9ooGma5je0p1+NG0GyQMUSxi1pHhGVgCKhwuiTuJMQjSjemzCRPc0cA00hQzUGPB9s7GRm98pmEruF3GUx0u58t9NpjOwFJQ6f5OjpwdhB/ShfxUHF2mFBt0IV6xUmVM/gE8a723eenecEnwYjpRkmLqBp/tgDwI4Nr7IO2JwAAAAASUVORK5CYII=");
                        }
                    }
                }
                .button-container{
                    width: 100%;
                    height: 98px;
                    margin-top: 110px;
                    .login-btn{
                        width: 100%;
                        height: 98px;
                        line-height: 98px;
                        text-align: center;
                        border-radius: 100px;
                        border: 0;
                        background-color: #0096FF;
                        @include font(36px, #FFFFFF);
                        &[disabled=disabled]{
                            opacity: 0.5;
                        }
                    }
                }
                .qrcode-btn{
                  position: absolute;
                  right: 0;
                  top:-60px;
                  // width: 120px;
                  padding:8px 10px;
                  line-height: 1.5;
                  border-radius: 5px;
                  background: lightblue;
                }
                .qrcode-container{
                  display: flex;
                  flex-direction: column;
                  justify-content:center;
                  align-items: center;
                  .qrcode {
                    width: 400px;
                    height: 400px;
                    border-radius: 10px;
                    background: lightgray;
                  }
                }
            }

            .log-params-list{
              display: flex;
              flex-direction: column;
              div{
                display: flex;
                flex-direction: column;
                padding: 10px 5px;
                .input-label{
                  display: flex;
                  flex-direction: row;
                  justify-content: flex-start;
                  align-items: center;
                  span {
                    width: 30%;
                    white-space: nowrap;
                    text-align: justify;
                  }
                  input{
                    padding: 5px;
                  }
                }
              }
            }
        }
    }
</style>
