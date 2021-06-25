<template>
  <div class="c-message">
    <div
      class="message"
      :class="{ 'message--self': item.sender === userId }"
      :key="item.messageId"
    >
      <div class="message__date" v-show="item.isShowMsgTime">
        {{ formatMsgTime(item.serverTime) }}
      </div>
      <div class="message__main">
        <div v-if="showMultiCheck" class="multi-select">
          <input type="checkbox" v-model="checked" @change="updateChecked()" />
        </div>
        <div class="message__portrait">
          <xm-portrait></xm-portrait>
        </div>
        <div class="message__body" @click="dialogBtn(index, item)">
          <div
            class="message__content"
            ref="hello"
            v-if="item.type === null || item.type === undefined"
            v-html="handleMsgWithEmoji(item.content)"
          ></div>
          <div class="message__content" v-if="item.type === 55">
            {{ atContent }}
          </div>
          <span v-if="item.sender === userId && msgReadReplyList.length <= 0"
            >未读</span
          >
          <div v-for="(item1, index) in msgReadReplyList" :key="index">
            <span v-if="item.sender === userId && item1.msgReadReply == true"
              >已读</span
            >
          </div>
          <div class="message__content" v-if="item.type === 0">
            <a target="_blank" :href="getImageUrl()" download="img"
              ><img width="200" height="auto" :src="getThumbImageUrl()"
            /></a>
          </div>
          <div class="message__content" v-if="item.type === 2">
            <a target="_blank" :href="getFileUrl()">文件消息</a>
          </div>
          <div class="message__content" v-if="item.type === 6">
            <a target="_blank">名片消息</a>
          </div>
          <div class="message__status">
            <div
              class="message__loading"
              v-if="item.sender === userId && item.sendStatus === 0"
            ></div>
            <div
              class="message__error"
              v-if="item.sender === userId && item.sendStatus === 2"
            ></div>
          </div>
        </div>
        <ul class="message_dialog" v-show="cIndex == index && flag">
          <li @click="msgCollect(item)">收藏</li>
          <li>
            <input type="hidden" v-model="inputData" style="width: 400px" />
            <div @click="handleCopy(inputData, $event)">复制</div>
          </li>
          <li @click="send()">转发</li>
          <li @click="multiSend()">多选</li>
          <li @click="msgRevoke(item)">撤回</li>
          <li @click="msgDelete(item)">删除</li>
        </ul>
      </div>
    </div>

    <div class="meglist" v-show="isShowflag">
      <div class="close" @click="close">关闭</div>
      <div>
        <!-- 好友 -->
        <div
          class="friend-sec-item"
          v-for="(item, index) in friendList"
          :key="index"
        >
          <div
            class="friend-item"
            v-for="(subItem, subIndex) in item.data"
            :key="subIndex"
            @click="goChatPage(subItem, 0)"
          >
            <div class="friend-item__portrait">
              <img :src="subItem.userAvatar || defaultAvatar" />
            </div>
            <div class="friend-item__name">{{ subItem.userName }}</div>
          </div>
        </div>
        <!-- 群组 -->
        <div
          class="list-item"
          v-for="(item, index) in groupLists"
          :key="'info2-' + index"
          @click="goChatPage(item, 1)"
        >
          <div class="list__portrait">
            <img :src="item.avatar || defaultAvatar" />
          </div>
          <div class="list__name">{{ item.groupName }}</div>
        </div>
      </div>
    </div>
    <!-- <div v-show="revoke">你撤回一条消息</div> -->
  </div>
</template>

<script>
import { EventBus } from "../../event-bus";
import { mapState } from "vuex";
import { emojiMap } from "../../utils";
import clip from "../../clipboard";
export default {
  name: "xm-message",
  props: {
    item: {
      type: Object,
    },
    userId: {
      type: Number,
    },
    index: {
      type: Number,
    },
    friendList: {
      type: Array,
    },
    groupLists: {
      type: Array,
    },
    showMultiCheck: {
      type: Boolean,
    },
  },
  data() {
    return {
      flag: false,
      cIndex: -1,
      msgCon: "",
      inputData: "",
      isShowflag: false,
      defaultAvatar: require("../../assets/imgs/avatar_default.jpg"),
      revoke: false,
      reply: false,
      atContent: "",
      checked: false
    };
  },
  methods: {
    handleDialogConfirm() {
      this.$emit("update:dialogVisible", false);
    },
    handleMsgWithEmoji(content) {
      console.log(content);
      Object.keys(emojiMap).forEach(function (emoji) {
        while (content.indexOf(emoji) >= 0) {
          let index = content.indexOf(emoji);
          console.log(index);
          let emojiLen = emoji.length;
          console.log(emojiLen);
          console.log(content);
          console.log(content.substring(0, index));
          console.log(emoji);
          console.log(emojiMap[emoji]);
          console.log(content.substring(index + emojiLen));
          content =
            content.substring(0, index) +
            emojiMap[emoji] +
            content.substring(index + emojiLen);
          console.log(content);
        }
      });
      return content;
    },
    getThumbImageUrl() {
      // 缩略图
      let vm = this;
      if (vm.item.thumbUrl) {
        // 发送方会传thumbUrl
        return vm.item.thumbUrl;
      }
      const baseUrl = window.TeatalkSdk.app.dtcurl + "/download";
      // const baseUrl = 'http://jkimv1.thinkdeep.xin:8080/dtc/download'// 金融
      // const baseUrl = 'http://128.196.200.1:8080/dtc/download'// 成开
      // const baseUrl = 'http://ygimb.ccb.com:80/dtc/download'// 生产
      const fileId = vm.item.content.thumbId;
      const fileSize = vm.item.content.thumbSize;
      const token = window.TeatalkSdk.app.transferToken;
      const range = fileSize - 1;
      // const url = `${baseUrl}?file_id=${fileId}&range=0-${fileSize}&file_size=${fileSize}&token=${token}`
      const url = `${baseUrl}?file_id=${fileId}&range=0-${range}&file_size=${fileSize}&token=${token}`;
      return url;
    },
    getImageUrl() {
      // 原图
      let vm = this;
      if (vm.item.thumbUrl) {
        return vm.item.thumbUrl;
      }
      const baseUrl = sessionStorage.getItem("dtcurl") + "/download";
      // const baseUrl = 'http://jkimv1.thinkdeep.xin:8080/dtc/download'// 金融
      // const baseUrl = 'http://128.196.200.1:8080/dtc/download'// 成开
      // const baseUrl = 'http://ygimb.ccb.com:80/dtc/download'// 生产
      const fileId = vm.item.content.fileId;
      const fileSize = vm.item.content.fileSize;
      const token = window.TeatalkSdk.app.transferToken;
      const range = fileSize - 1;
      // const url = `${baseUrl}?file_id=${fileId}&range=0-${fileSize}&file_size=${fileSize}&token=${token}`
      const url = `${baseUrl}?file_id=${fileId}&range=0-${range}&file_size=${fileSize}&opr=2&token=${token}`; // &opr=2浏览器展示图片
      return url;
    },
    getFileUrl() {
      //获取文件地址
      let vm = this;
      if (vm.item.thumbUrl) {
        return vm.item.thumbUrl;
      }
      const baseUrl = sessionStorage.getItem("dtcurl") + "/download";
      const fileId = vm.item.content.fileId;
      const fileSize = vm.item.content.fileSize;
      const token = window.TeatalkSdk.app.transferToken;
      const range = fileSize - 1;
      const url = `${baseUrl}?file_id=${fileId}&range=0-${range}&file_size=${fileSize}&token=${token}`;
      return url;
    },
    formatMsgTime(time) {
      let dayList = ["日", "一", "二", "三", "四", "五", "六"];
      let msgTimeObj = new Date(time);
      let nowTimeObj = new Date();
      let msgTime = time;
      let nowTime = nowTimeObj.getTime();
      let todayZeroTime = new Date(nowTimeObj.toLocaleDateString()).getTime();
      let D = nowTime - todayZeroTime;
      let E = nowTime - msgTime;
      let F = (E - D) / (1000 * 60 * 60);
      if (F <= 0) {
        // 当天
        return msgTimeObj.Format("hh:mm");
      } else if (F > 0 && F <= 24) {
        // 昨天
        return "昨天 " + msgTimeObj.Format("hh:mm");
      } else if (F > 24 && F <= 48) {
        // 前天
        return "前天 " + msgTimeObj.Format("hh:mm");
      } else if (F > 48 && F <= 144) {
        // 一周内
        return (
          "星期" +
          dayList[msgTimeObj.getDay()] +
          " " +
          msgTimeObj.Format("hh:mm")
        );
      } else {
        // 一周外
        return msgTimeObj.Format("yyyy-MM-dd hh:mm");
      }
    },
    dialogBtn(index, item) {
      this.cIndex = index;
      this.flag = !this.flag;
      this.inputData = item.content;
    },
    // 消息收藏
    msgCollect(item) {
      let type = 0;
      let msgbyte;
      let types = item.type;
      if (types === 0) {
        msgbyte = item.content.fileSize;
      } else {
        let buf1 = new Blob([item.content]);
        msgbyte = buf1.size;
      }
      this.$store.dispatch("msgCollect", { item, msgbyte, type, types });
    },
    // 消息删除
    msgDelete(item) {
      console.log("消息删除");
      this.$el.style.display = "none";
    },
    // 消息撤回
    msgRevoke(item) {
      console.log("消息撤回");
      let vm = this;
      let msgType = 0; // 0:个人消息 1：群组消息
      let revoke = vm.$store.dispatch("msgRevoke", { item, msgType });
      console.log(revoke);
      this.revoke = revoke;
      console.log(this.revoke);
      this.$emit("revoke", this.revoke);
    },
    // 消息复制
    handleCopy(text, event) {
      clip(text, event);
    },
    // 消息转发
    send() {
      let vm = this;
      vm.isShowflag = true;
    },

    // 消息多选
    multiSend() {
      this.flag = !this.flag;
      let flag = this.showMultiCheck ? false : true;
      this.$emit("multicheck", flag);
    },

    //
    updateChecked() {
      let vm = this;
      // console.log('updateChecked', vm.item)
      this.$emit('updateChecked', vm.item, vm.checked)
    },

    // 关闭弹窗
    close() {
      let vm = this;
      vm.isShowflag = false;
    },
    // 转发到聊天
    goChatPage(item, type) {
      let vm = this;
      vm.isShowflag = false;
      if (item.groupId) {
        let userInfos = JSON.stringify(item);
        sessionStorage.setItem("userInfos", userInfos);
        vm.$store.commit("setUserInfos", { userInfos: item });
        vm.$router.push({
          path: `/groupChat/${JSON.parse(userInfos).groupId}`,
        });
      } else if (item.sessionId || item.friendUserid) {
        vm.$router.push({
          path: `/chat/${item.sessionId || item.friendUserid}`,
        });
      }
      if (!vm.inputData.length) {
        EventBus.$emit("showToast", "不能发送空消息");
        return false;
      }
      vm.$store.dispatch("sendMsg", {
        msgVal: vm.inputData,
        chatId: parseInt(vm.$route.params.id),
        type,
      });
    },
  },
  computed: {
    ...mapState({
      msgReadReplyList: (state) => state.msg.msgReadReplyList,
    }),
  },
  created() {
    let vm = this;
    if (vm.item.type && vm.item.type === 55) {
      if (Array.isArray(vm.item.content)) {
        vm.item.content.forEach((el) => {
          if (el.Body) {
            vm.atContent = el.Body;
          }
        });
      }
    }
  },
};
</script>

<style lang="scss">
.c-message {
  .meglist {
    z-index: 999999999;
    background-color: #979797;
    position: fixed;
    top: 84px;
    left: 0;
    width: 100%;
    height: 100%;
    .close {
      height: 80px;
      line-height: 80px;
      font-size: 30px;
      padding-left: 80%;
    }
    .friend-sec-item {
      background-color: #ffffff;
      .friend-sec-letter {
        width: 100%;
        height: 68px;
        line-height: 68px;
        text-align: left;
        padding: 0 20px;
        @include font(28px, #999999);
      }
      .friend-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: 108px;
        .friend-item__portrait {
          flex: 0 0 auto;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          overflow: hidden;
          background-color: $base-bg-color;
          margin: 0 20px;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .friend-item__name {
          flex: 1 1 auto;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          height: 100%;
          line-height: 108px;
          text-align: left;
          border-bottom: 1px solid #ebebeb;
          @include font(32px, #333333);
        }
      }
    }
    .list-item {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      height: 1.44rem;
      background-color: #ffffff;
      .check-box {
        flex: 0 0 auto;
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background-color: #999999;
      }
      .list__portrait {
        flex: 0 0 auto;
        width: 72px;
        height: 72px;
        border-radius: 50%;
        overflow: hidden;
        background-color: $base-bg-color;
        margin: 0 20px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .list__name {
        flex: 1 1 auto;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: 100%;
        line-height: 108px;
        text-align: left;
        border-bottom: 1px solid #ebebeb;
        @include font(32px, #333333);
      }
    }
  }
  .message {
    .message__date {
      /*display: none;*/
      display: inline-block;
      margin: 0 auto 20px;
      padding: 8px 30px;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 100px;
      @include font(24px, #ffffff);
    }
    .message__main {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      position: relative;
      .message_dialog {
        position: absolute;
        top: -40px;
        right: 10%;
        li {
          float: left;
          margin-right: 6px;
          font-size: 24px;
        }
      }
      .message__portrait {
        flex: 0 0 auto;
        width: 84px;
        height: 84px;
        border-radius: 50%;
        overflow: hidden;
        background-color: $base-bg-color;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .message__body {
        margin: 0 0 0 20px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .message__content {
          flex: 1 1 auto;
          flex-wrap: wrap;
          text-align: left;
          padding: 14px 30px;
          border-radius: 10px;
          background-color: #0096ff;
          @include font(36px, #ffffff);
          img {
            width: 100px;
            height: auto;
            vertical-align: text-bottom;
          }
        }
        .message__status {
          flex: 0 0 auto;
          margin: 0 0 0 10px;
          width: 42px;
          height: 42px;
        }
      }
    }
  }
  .message--self {
    .message__main {
      flex-direction: row-reverse;
      .multi-select {
        position: absolute;
        left: 0;
      }
      .message__body {
        flex-direction: row-reverse;
        margin: 0 20px 0 0;
        .message__content {
          background-color: $base-bg-color;
          @include font(36px, #333333);
          img {
            width: 100px;
            height: 100px;
            vertical-align: text-bottom;
          }
        }
        .message__status {
          margin: 0 10px 0 0;
          .message__loading {
            width: 100%;
            height: 100%;
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-image: url("../../assets/imgs/loading.gif");
          }
          .message__error {
            width: 100%;
            height: 100%;
            background-repeat: no-repeat;
            background-size: 100% auto;
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAOVBMVEUAAADzMDDzMTHyMjL/QED1MjLzMTHyMDDzMDDzMDDyMDD4Njb/PDz4NDT4MjLyMTHyMTHyMDDyMDBFPZJRAAAAEnRSTlMAlLt2BDO92b7+8yYRJyTcjPJi3WuyAAAAi0lEQVR4Xn3SwRKDIAwE0E0iQUDU5v8/tocWBhziXt8sh7BoKcIx58hSMCeo9WgYYKNkQxJtTY7dHtmPf6fJaL8edQC6EQCEtKIUAKityBSotiYrEI8E7BEjehSRPco+fd4eZHPCEI8E1aMyHuo6z6uLTue9gXs6L2jVopev9Afgz8Yf25zaJlobfAF/YSIcDKNJhAAAAABJRU5ErkJggg==");
          }
        }
      }
    }
  }
}
</style>
