<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="sect__head">
        <div class="sect__avatar">
          <img :src="groupItemInfo.groupPortraitId || defaultAvatar">
        </div>
        <div class="sect__groupname">{{groupItemInfo.groupName || '未命名'}}</div>
      </div>
      <div class="sect__QRCode" id="canvas">
        <img id="sect__QRCode-image">
      </div>
      <div class="sect__tip_word">扫码加入群组</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      defaultAvatar: require('@/assets/imgs/avatar_default.jpg')
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
  mounted () {
    let QRCode = require('qrcode')
    let opts = {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.92,
      margin: 0.1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }

    QRCode.toDataURL('https://www.baidu.com', opts, (err, url) => {
      if (err) {
        throw err
      }
      let img = document.getElementById('sect__QRCode-image')
      img.src = url
    })
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
      background-color: #ffffff;
      .sect__head{
        display: flex;
        align-items: center;
        padding: 40px;
        .sect__avatar{
          flex-shrink: 0;
          width: 180px;
          height: 180px;
          margin-right: 20px;
          img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }
        .sect__groupname{
          font-size: 36px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .sect__QRCode{
        width: 600px;
        height: 600px;
        margin: 40px auto;
        img{
          width: 100%;
          height: 100%;
        }
      }
      .sect__tip_word{
        @include font(40px, #999999);
      }
    }
  }
</style>
