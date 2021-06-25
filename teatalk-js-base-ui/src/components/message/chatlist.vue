<template>
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
          @click="sendMsg(subItem, 0)"
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
        @click="sendMsg(item, 1)"
      >
        <div class="list__portrait">
          <img :src="item.avatar || defaultAvatar" />
        </div>
        <div class="list__name">{{ item.groupName }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { EventBus } from "../../event-bus";
export default {
  name: "xm-chat-list",
  props: {
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
    multiChecked: {
      type: Boolean,
    },
    msgList: {
      type: Array,
      default() {
        return [];
      },
    },
    isShowflag: {
        type: Boolean,
        default: false
    }
  },
  data() {
      return {
        defaultAvatar: require("../../assets/imgs/avatar_default.jpg")
      }
  },
  methods: {
    close() {
      this.$emit("closerelay", false);
    },
    // 转发到聊天
    sendMsg(item, type) {
      let vm = this;
      let id = "";
      if (item.groupId) {
        id = item.groupId;
        // let userInfos = JSON.stringify(item);
        // sessionStorage.setItem("userInfos", userInfos);
        // vm.$store.commit("setUserInfos", { userInfos: item });
        // vm.$router.push({
        //   path: `/groupChat/${JSON.parse(userInfos).groupId}`,
        // });
      } else if (item.sessionId || item.friendUserid) {
        id = item.sessionId || item.friendUserid;
        // vm.$router.push({
        //   path: `/chat/${item.sessionId || item.friendUserid}`,
        // });
      }
      this.$emit('closerelay', false)

      if (this.msgList.length == 0) {
        EventBus.$emit("showToast", "转发消息不能为空");
        return false;
      }

      this.msgList.forEach(function (one) {
        if (!one.content) {
          EventBus.$emit("showToast", "不能发送空消息");
        } else {
          vm.$store.dispatch("sendMsg", {
            msgVal: one.content,
            chatId: parseInt(id),
            type,
          });
        }
      });
    },
  },
};
</script>


<style lang="scss" scoped>
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
</style>