<template>
    <div class="page-container">
        <div class="l-header">
            <xm-top-nav :curRoute="$route" @showSelect="getSelect"></xm-top-nav>
        </div>
        <div class="l-main">
          <div style="width: 90%; height: 50px; font-size: 16px;" v-show="selected === 'org'">
            <div>
              <span>请输入好友userid</span>
              <input style="height: 100%; border: 1px solid #000; "
                type="text"
                placeholder=""
                v-model="friUserId">
            </div>
              <!-- <div id="mapholder">test location</div>
              <button @click="getCurPosition">获取当前位置</button> -->
              <button @click="orgCreate">创建群组</button>
              <button @click="addFriend">添加好友</button>
              <button @click="deleteFriend">删除好友</button>
              <button @click="getEid">获取eid</button>
              <button @click="getOrgOfflineMsg">获取群离线消息通知</button>


              <button @click="logout">退出登录</button>
              <button @click="getSessionMsg">获取最近会话列表</button>

              <button @click="takeCardBatch">获取用户在线状态</button>
              <button @click="takeStatus">设置用户在线状态</button>
              <button @click="getSystemTime">获取服务端时间戳</button>

              <!-- <button @click="IsAgreeJoinOrg(0)">同意</button>
              <button @click="IsAgreeJoinOrg(1)">拒绝</button>
              <button @click="IsAddFriend(1)">同意加为好友</button>
              <button @click="IsAddFriend(0)">拒绝加为好友</button> -->
            <div>
              <span>请输入用户名</span>
              <input style="height: 100%; border: 1px solid #000; "
              type="text"
              placeholder=""
              v-model="name">
            </div>
            <div>
              <span>请输入个性签名</span>
              <input style="height: 100%; border: 1px solid #000; "
              type="text"
              placeholder=""
              v-model="mood">
            </div>
            <div>
              <span>请输入头像id（上传图片返回）</span>
              <input style="height: 100%; border: 1px solid #000; "
              type="text"
              placeholder=""
              v-model="portraitId">
            </div>
            <div>
              <span>请输入性别</span>
              <input style="height: 100%; border: 1px solid #000; "
              type="text"
              placeholder=""
              v-model="gender">
            </div>
            <div>
              <span>请输入心情</span>
              <input style="height: 100%; border: 1px solid #000; "
              type="text"
              placeholder=""
              v-model="expression">
            </div>
              <button @click="changeCard">修改个人信息</button>

          </div>
          <div class="recent-section" v-show="selected === 'ytx'">
            <div class="session-list">
              <div v-if="!sessionList.length && !friNotifyList.length && !orgNotifyList.length">没有会话信息</div>
              <div v-else class="session-sec-item" v-for="(item, index) in sessionList" :key="index" @click="goChatPage(item)">
                <div class="list__portrait">
                  <img :src="item.avatar || defaultAvatar">
                </div>
                <div class="list__name">{{item.groupName || item.chatName}}</div>
              </div>
              <div class="session-notify-item" v-for="(item, index) in friNotifyList" :key="index">
                <div v-if="item.friendUserId">
                  添加好友通知
                  <div>{{item.friendUserId}}请求添加你为好友</div>
                  <div>
                    <button @click="IsAddFriend(1, item)">同意加为好友</button>
                    <button @click="IsAddFriend(0, item)">拒绝加为好友</button>
                    </div>
                </div>
              </div>
              <div class="session-notify-item"  v-for="(item, index) in orgNotifyList" :key="index">
                <div v-if="item.inviteName">
                  群组通知
                  <div>{{item.inviteName}}邀请你加入{{item.orgName}}</div>
                  <div>
                    <button @click="IsAgreeJoinOrg(0, item)">同意</button>
                    <button @click="IsAgreeJoinOrg(1, item)">拒绝</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="contact-section" v-show="selected === 'txl'">
            <!-- <div class="immunity">
              <div class="dr">消息免打扰</div>
              <div class="switch-panel" @click.stop="isflag" :class="{'switch-left': flag,'switch-right': !flag}">
                <span class="switch-ico"></span>
              </div>
            </div> -->
            <div class="group-list" @click="goGroup">
              <div class="group__portrait">
                <img :src="defaultAvatar">
              </div>
              <div class="group__name">群组</div>
            </div>
            <div class="group-list" @click="goEnterprise">
              <div class="group__portrait">
                <img :src="defaultAvatar">
              </div>
              <div class="group__name">企业通讯录</div>
            </div>
            <div class="friend-list">
              <div class="friend-sec-item" v-for="(item, index) in friendList" :key="index">
              <div class="immunity">
                <div class="dr">消息免打扰</div>
                <div class="switch-panel" @click.stop="isflag" :class="{'switch-left': flag,'switch-right': !flag}">
                  <span class="switch-ico"></span>
                </div>
              </div>
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
        <div class="l-footer">
          <div class="btm-tabbar">
            <div class="btm-tabbar-item" v-for="(item, index) in tabbars" :key=index @click="handleClickBtmTabbar(item)">
              <div class="tabbar-item-img-box" v-show="!isActive(item)">
                <img :src="item.norImg">
              </div>
              <div class="tabbar-item-img-box" v-show="isActive(item)">
                <img :src="item.actImg">
              </div>
              <p class="tabbar-item-name">{{item.txt}}</p>
            </div>
          </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { EventBus } from '../event-bus'
export default {
  props: {
    showSelect: Number
  },
  data () {
    return {
      selected: 'ytx',
      tabbars: [
        {
          txt: '云通信',
          page: 'ytx',
          norImg: require('../assets/imgs/btn_ytx_nor.png'),
          actImg: require('../assets/imgs/btn_ytx_act.png')
        },
        {
          txt: '通讯录',
          page: 'txl',
          norImg: require('../assets/imgs/btn_contacts_nor.png'),
          actImg: require('../assets/imgs/btn_contacts_act.png')
        },
        {
          txt: '群组',
          page: 'org',
          norImg: require('../assets/imgs/btn_contacts_nor.png'),
          actImg: require('../assets/imgs/btn_contacts_act.png')
        }
      ],
      defaultAvatar: require('../assets/imgs/avatar_default.jpg'),
      toUserId: sessionStorage.getItem('toUserId') || '100001062',
      createOrg: false,
      friUserId: 100001071,
      flag: true,
      
      name: '',
      mood: '',
      portraitId: '',
      gender: '',
      expression: ''
    }
  },
  methods: {
    handleClickBtmTabbar (item) {
      let vm = this
      vm.selected = item.page
      vm.selected === 'txl' ? vm.createOrg = false : vm.createOrg = true
      EventBus.$emit('changeTopNavTitle', item.txt)
    },
    getSelect (data) {
      this.createOrg = data
    },
    getCurPosition() {
      if (navigator.geolocation) {
        let x = document.getElementById("mapholder");
        x.innerHTML = 'location...ing';
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          console.log(latitude, longitude)
          let latlon = latitude + "," + longitude;

          let img_url="http://maps.googleapis.com/maps/api/staticmap?center=" + latlon + "&zoom=14&size=400x300&sensor=false";
          x.innerHTML="<img src='"+img_url+"' />"
        }, error=> {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              x.innerHTML="User denied the request for Geolocation."
              break;
            case error.POSITION_UNAVAILABLE:
              x.innerHTML="Location information is unavailable."
              break;
            case error.TIMEOUT:
              x.innerHTML="The request to get user location timed out."
              break;
            case error.UNKNOWN_ERROR:
              x.innerHTML="An unknown error occurred."
              break;
            }
        });
      }
    },
    orgCreate () {
      let vm = this
      let friUserId = vm.friUserId
      vm.$store.dispatch('orgCreate', { friUserId, vm })
    },
    addFriend () {
      console.log(1)
      let vm = this
      let friUserId = vm.friUserId
      vm.$store.dispatch('addFriend', { friUserId })
    },
    deleteFriend () {
      let vm = this
      let friUserId = vm.friUserId
      vm.$store.dispatch('deleteFriend', { friUserId, vm })
    },
    getEid () {
      let vm = this
      // let friUserId = vm.friUserId
      vm.$store.dispatch('getEid', { vm })
    },
    getOrgOfflineMsg () {
      let vm = this
      vm.$store.dispatch('getOrgOfflineMsg') // 获取群离线消息通知
    },
    IsAgreeJoinOrg (isAgree, item) {
      let vm = this
      let friUserId = vm.friUserId
      vm.$store.dispatch('IsAgreeJoinOrg', { friUserId, isAgree, item, vm })
    },
    IsAddFriend (isAgree, item) {
      console.log(isAgree)
      let vm = this
      // let friUserId = vm.friUserId
      let friUserId = item.friendUserId
      vm.$store.dispatch('isAddFriend', { friUserId, isAgree, vm })
    },
    goGroup () {
      let vm = this
      vm.$router.push({path: 'group'})
    },
    goEnterprise () {
      let vm = this
      vm.$router.push({path: 'enterprise'})
    },
    goChatPage (item) {
      let vm = this
      if (item.groupId) {
        let userInfos = JSON.stringify(item)
        sessionStorage.setItem('userInfos', userInfos)
        vm.$store.commit('setUserInfos', {userInfos: item})
        vm.$router.push({path: `/groupChat/${JSON.parse(userInfos).groupId}`})
      } else if (item.sessionId || item.friendUserid) {
        vm.$router.push({path: `/chat/${item.sessionId || item.friendUserid}`})
        let friUserId = item.sessionId
        vm.$store.dispatch('msgReadReply', { friUserId, vm })
      }
    },
    // 消息免打扰
    isflag () {
      let vm = this
      // let getFlag
      // let dateTime
      // let expire
      vm.flag = !vm.flag
      // if (vm.flag === true) {
      //   getFlag = 0
      // } else if (vm.flag === false) {
      //   getFlag = 1
      //   dateTime = new Date(new Date().toLocaleDateString()).getTime() // 0点开始
      //   expire = 60 * 60 * 1000 * 8 // 持续8小时
      // }
      // vm.$store.dispatch('msgImmunity', { getFlag, dateTime, expire, vm })
    },
    logout () {
      let vm = this
      vm.$store.dispatch('logout', {  })
    },
    getSessionMsg () {
      let vm = this
      vm.$store.dispatch('getSessionMsg', { vm }) // 获取最近会话列表
    },
    takeCardBatch () {
      let vm = this
      let friUserId = vm.friUserId
      vm.$store.dispatch('takeCardBatch', { friUserId, vm }) // 批量获取用户在线状态
    },
    takeStatus () {
      let vm = this
      let friUserId = vm.friUserId
      vm.$store.dispatch('takeStatus', { friUserId, vm }) // 设置用户在线状态
    },
    changeCard () {
      let vm = this
      let name = vm.name
      let mood = vm.mood
      let gender = vm.gender
      let expression = vm.expression
      let portraitId = vm.portraitId
      vm.$store.dispatch('changeCard', { name, mood, gender, expression, portraitId, vm }) // 修改用户信息
    },
    getSystemTime () {
      let vm = this
      vm.$store.dispatch('getSystemTime', { vm }) // 获取服务端时间戳
    },
  },
  computed: {
    ...mapState({
      'friendList': state => state.friend.friendList,
      'sessionList': state => state.msg.sessionList,
      'friNotifyList': state => state.friend.friNotifyList,
      'orgNotifyList': state => state.group.orgNotifyList
    }),
    isActive () {
      let vm = this
      return (item) => {
        return item.page === vm.selected
      }
    }
  },
  created () {},
  components: {}
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
            height: 100%;
            background-color: $app-bg-color;
            button{
              background: lightblue;
              border-radius: 5px;
              padding: 5px;
              margin: 3px;
            }
            .recent-section{
              .session-sec-item{
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 1.44rem;
                background-color: #ffffff;
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
              .session-notify-item{
                display: flex;
                justify-content: flex-start;
                width: 100%;
                height: 1.44rem;
                background-color: #ffffff;
              }
            }
            .contact-section{
              width: 100%;
              // flex: 1 1 auto;
              overflow-y: auto;
              // padding-top: 88px;
              background-color: $app-bg-color;
              -webkit-overflow-scrolling: touch;
              // .immunity{
              //   display: flex;
              //   padding: 30px 0 30px 20px;
              //   .dr{padding-right: 20px;font-size: 24px;}
              //   .switch-panel{position:relative;transition:1s;width:100px;height:40px;border-radius:40px;background:#13CE66;cursor:pointer;}
              //   .switch-ico{transition:.5s;float:left;margin-top:1px;width:38px;height:38px;background:#fff;border-radius:50%;}
              //   .switch-left{background:#c7c6c6;}
              //   .switch-right{background:#13CE66;}
              //   .switch-left .switch-ico{transform:translateX(0);}
              //   .switch-right .switch-ico{transform:translateX(60px);}
              // }
              .group-list{
                display: flex;
                justify-content: flex-start;
                align-items: center;
                width: 100%;
                height: 1.44rem;
                background-color: #ffffff;
                .group__portrait{
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
                .group__name{
                  @include font(32px, #333333)
                }
              }
              .friend-list{
                padding-bottom: 220px;
                .friend-sec-item{
                  .immunity{
                    display: flex;
                    padding: 30px 0 0 20px;
                    .dr{padding-right: 20px;font-size: 24px;}
                    .switch-panel{position:relative;transition:1s;width:100px;height:40px;border-radius:40px;background:#13CE66;cursor:pointer;}
                    .switch-ico{transition:.5s;float:left;margin-top:1px;width:38px;height:38px;background:#fff;border-radius:50%;}
                    .switch-left{background:#c7c6c6;}
                    .switch-right{background:#13CE66;}
                    .switch-left .switch-ico{transform:translateX(0);}
                    .switch-right .switch-ico{transform:translateX(60px);}
                  }
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
        .l-footer{
          position: fixed;
          left: 0;
          bottom: 0;
          z-index: 100;
          width: 100%;
          height: 98px;
          .btm-tabbar{
            width: 100%;
            height: 100%;
            padding: 0 27px;
            box-sizing: border-box;
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-top: 1px solid #DDDDDD;
            background-color: #ffffff;
            .btm-tabbar-item{
              width: 85px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              .tabbar-item-img-box{
                width: 50px;
                height: 50px;
                img{
                  vertical-align: baseline;
                }
              }
              .tabbar-item-name{
                @include font(18px, #999999);
                text-align: center;
              }
            }
          }
        }
    }
</style>
