<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="contact-section">
        <div class="item-list" @click="chooseGroup">
          <div class="item__portrait"><img :src="defaultAvatar"></div>
          <div class="item__name">群组</div>
        </div>
        <div class="friend-list">
          <div class="friend-sec-item" v-for="(item, index) in friendList" :key="index">
            <div class="friend-sec-letter">{{item.letter}}</div>
            <div class="friend-sub-list">
              <div class="friend-item" v-for="(subItem, subIndex) in item.data" :key="subIndex" @click="goChatPage(subItem)">
                <div class="friend-item__portrait">
                  <img :src="subItem.userAvatar || defaultAvatar">
                </div>
                <div class="friend-item__name">{{subItem.userName}}</div>
              </div>
            </div>
          </div>
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
      defaultAvatar: require('../../assets/imgs/avatar_default.jpg')
    }
  },
  methods: {
    chooseGroup () {
      let vm = this
      vm.$router.push({path: 'ppChooseGroup'})
    },
    goChatPage (item) {
      let vm = this
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
      vm.$store.dispatch('msgSendcard', { chatId: item.friendUserid, type: 0, result })
      vm.$router.push({path: `/chat/${item.friendUserid}`})
    }
  },
  computed: {
    ...mapState({
      'friendList': state => state.friend.friendList
    })
  },
  created () {}
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
      .contact-section{
        width: 100%;
        overflow-y: auto;
        background-color: $app-bg-color;
        -webkit-overflow-scrolling: touch;
        .item-list{
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
          height: 1.44rem;
          background-color: #ffffff;
          cursor: pointer;
          .item__portrait{
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
          .item__name{
            @include font(32px, #333333)
          }
        }
        .friend-list{
          padding-bottom: 220px;
          .friend-sec-item{
            .friend-sec-letter{
              width: 100%;
              height: 68px;
              line-height: 68px;
              text-align: left;
              padding: 0 20px;
              @include font(28px, #999999)
            }
            .friend-sub-list{
              background-color: #ffffff;
              .friend-item{
                display: flex;
                justify-content: flex-start;
                align-items: center;
                width: 100%;
                height: 108px;
                .friend-item__portrait{
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
                .friend-item__name{
                  flex: 1 1 auto;
                  display: flex;
                  justify-content: flex-start;
                  align-items: center;
                  height: 100%;
                  line-height: 108px;
                  text-align: left;
                  border-bottom: 1px solid #EBEBEB;
                  @include font(32px, #333333)
                }
              }
            }
          }
        }
      }
    }
  }
</style>
