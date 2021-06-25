<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="list-item">
        <div class="list__portrait">
          <img :src="defaultAvatar">
        </div>
        <div class="list_info">
          <div class="list__name">{{information.releaname || '未命名'}}</div>
          <div class="list__name">手机号：{{information.title}}</div>
        </div>
      </div>
      <div class="sect-wrap mb-20">
        <div class="sect-item" @click="goEnpInformation()">
          <p class="sect-tit">企业信息</p>
          <p class="sect-icon">&#62;</p>
        </div>
      </div>
      <div class="sect-wrap">
        <div class="sect-btn-item" @click="goChatPage(information)">发消息</div>
        <div class="sect-btn-item" @click="addFriend()">添加好友</div>
      </div>
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
      'userId': state => state.base.userId,
      'enpInformation': state => state.enterprise.enpInformation
    }),
    information () {
      let vm = this
      return vm.enpInformation
    }
  },
  methods: {
    // 企业信息
    goEnpInformation () {
      let vm = this
      vm.$router.push({name: 'enpInformation'})
    },
    // 发消息
    goChatPage (item) {
      let vm = this
      if (item.userid) {
        vm.$router.push({path: `/chat/${item.userid}`})
        let friUserId = item.userid
        vm.$store.dispatch('msgReadReply', { friUserId, vm })
      }
    },
    // 添加好友
    addFriend () {}
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
        margin-bottom: 50px;
      }
      .list-item{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: 3.44rem;
        background-color: #ffffff;
        border-bottom: 1px solid #EBEBEB;
        .check-box{
          flex: 0 0 auto;
          width: 105px;
          height: 105px;
          border-radius: 50%;
          background-color: #999999;
        }
        .list__portrait{
          flex: 0 0 auto;
          width: 105px;
          height: 105px;
          border-radius: 50%;
          overflow: hidden;
          background-color: $base-bg-color;
          margin: 0 40px;
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
          @include font(32px, #333333)
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
          background-color: #0096FF;
          border-radius: 100px;
          box-shadow: 2px 2px 3px #999999;
        }
      }
    }
  }
</style>
