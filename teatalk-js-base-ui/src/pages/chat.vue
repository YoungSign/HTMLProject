<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="chat-section" id="chatSection">
        <div class="chat-section__content">
          <!-- <div v-if="!isGroupChat" @click="historyMsg">获取历史记录</div>
          <div v-if="isGroupChat" @click="groupOfflineMsg">获取离线消息</div> -->
          <button @click="clearHistoryMsg">清除消息</button>
          <button @click="historyMsg">获取历史消息</button>
          <button @click="offlineMsg">获取离线消息</button>
          <button @click="CollectMsg">获取收藏消息</button>
          <button @click="getGW">获取GW地址</button>
          <button @click="quit">退出登陆</button>
          <button @click="changeOrgManager">变更管理员权限</button>
          <button @click="quitOrg">踢人</button>
          <button @click="changeOrgCreater">转让群主</button>
          <button @click="pullOfflineMsg">拉取离线推送</button>
          <button @click="getPPFocusList">获取关注的公众号</button>
          <button @click="setPPFocus">关注</button>
          <div class="log-params-list">
            <div class="input-label">
              <span>传入key：</span>
              <input type="text" style="border: 1px solid #000" v-model="key" />
            </div>
            <div>
              <span>传入channel：</span>
              <input
                type="text"
                style="border: 1px solid #000"
                v-model="channel"
              />
            </div>
            <div>
              <span>传入userid：</span>
              <input
                type="text"
                style="border: 1px solid #000"
                v-model="userid"
              />
            </div>
            <div>
              <span>传入from：</span>
              <input
                type="text"
                style="border: 1px solid #000"
                v-model="from"
              />
            </div>
            <div>
              <span>传入to：</span>
              <input type="text" style="border: 1px solid #000" v-model="to" />
            </div>
            <div>
              <span>传入status：</span>
              <input
                type="text"
                style="border: 1px solid #000"
                v-model="status"
              />
            </div>
            <div>
              <span>传入friendid：</span>
              <input
                type="text"
                style="border: 1px solid #000"
                v-model="friendid"
              />
            </div>
            <div>
              <span>传入accountId：</span>
              <input
                type="text"
                style="border: 1px solid #000"
                v-model="accountId"
              />
            </div>
            <div>
              <span>传入versionId：</span>
              <input
                type="text"
                style="border: 1px solid #000"
                v-model="versionId"
              />
            </div>
            <div>
              <span>传入frriendid：</span>
              <input
                type="text"
                style="border: 1px solid #000"
                v-model="friendid"
              />
            </div>
            <div>
              <span>传入frriendname：</span>
              <input
                type="text"
                style="border: 1px solid #000"
                v-model="friendname"
              />
            </div>
          </div>
          <div
            class="message-wrapper"
            v-for="(item, index) in msgList"
            :key="index"
          >
            <xm-message
              @revoke="change(newrevoke)"
              @multicheck="showMultiCheckFn"
              @updateChecked="updateRelayList"
              :item="item"
              :userId="parseInt(userId)"
              :index="index"
              :friendList="friendList"
              :groupLists="groupLists"
              :showMultiCheck="showMultiCheck"
            ></xm-message>
          </div>
          <div
            class="message-wrapper"
            v-for="item in msgCollectLists"
            :key="item.id"
          >
            <xm-msgcollect :item="item"></xm-msgcollect>
          </div>
          <div v-show="newrevoke">你撤回一条消息</div>
        </div>
      </div>
      <div class="bottom-section">
        <div class="bottom-section__input" v-show="!showMultiCheck">
          <div class="input__input-box">
            <input
              type="text"
              :value="msgVal"
              @focus="handleInputFocus"
              @input="checkInputVal($event)"
            />
          </div>
          <div class="input__btn-box">
            <div class="input__emoji-btn" @click="showEmojiList"></div>
            <div class="input__tool-btn" @click="showToolList"></div>
            <button class="input__sent-btn" @click="sendMsg">发送</button>
          </div>
        </div>
        <div class="bottom-section__input" v-show="showMultiCheck">
          <div class="input__btn-box" @click="isShowRelay(true)">合并转发</div>
          <div class="input__btn-box" @click="showMultiCheckFn(false)">
            取消多选
          </div>
        </div>
        <div class="bottom-section__emoji-list" v-show="isShowEmojiList">
          <div
            class="emoji-wrapper"
            v-for="(item, index) in emojiList"
            :key="index"
            :emoji="item.name"
            v-html="item.val"
            @click="selectEmoji(item)"
          ></div>
        </div>
        <div class="bottom-section__tool-list" v-show="isShowToolList">
          <div
            class="tool-wrapper"
            v-for="(item, index) in toolList"
            :key="index"
            @click="clickToolItem(item, $event)"
          >
            <img :src="item.imgUrl" alt="" />
            <p>{{ item.name }}</p>
          </div>
        </div>
      </div>
    </div>
    <chat-list
      :userId="parseInt(userId)"
      :friendList="friendList"
      :groupLists="groupLists"
      :showMultiCheck="showMultiCheck"
      :isShowflag="showRelay"
      :msgList="relayMsgList"
      @closerelay="isShowRelay"
    ></chat-list>
  </div>
</template>

<script>
import { EventBus } from "../event-bus";
import { mapState } from "vuex";
import { emojiMap, doMultiTasks } from "../utils";
import portrait from "../assets/imgs/avatar_01.jpg";
import portrait02 from "../assets/imgs/avatar_02.jpg";
import child from "../components/message/index";
import ChatList from "../components/message/chatlist.vue";
export default {
  components: { child, ChatList },
  data() {
    return {
      msgVal: "",
      portrait,
      portrait02,
      chatId: "",
      isShowEmojiList: false,
      isShowToolList: false,
      isMute: false,
      toolList: [
        {
          name: "语音通话",
          imgUrl: require("../assets/imgs/btn_audio.png"),
        },
        {
          name: "视频通话",
          imgUrl: require("../assets/imgs/btn_camera.png"),
        },
        {
          name: "图片",
          imgUrl: require("../assets/imgs/btn_chat_picture_normal.png"),
        },
        // {
        //   name: '文件',
        //   imgUrl: require('../assets/imgs/btn_chat_file_normal.png')
        // }
        {
          name: "群语音通话",
          imgUrl: require("../assets/imgs/btn_audio.png"),
        },
        {
          name: "群视频通话",
          imgUrl: require("../assets/imgs/btn_camera.png"),
        },
        {
          name: "名片",
          imgUrl: require("../assets/imgs/btn_chat_picture_normal.png"),
        },
        {
          name: "文件",
          imgUrl: require("../assets/imgs/btn_chat_file_normal.png"),
        },
        {
          name: "位置",
          imgUrl: require("../assets/imgs/btn_location.png"),
        },
      ],
      newrevoke: false,
      showMultiCheck: false,
      showRelay: false,
      relayMsgList: [],

      key: "",
      userid: "",
      from: "",
      channel: "",
    };
  },
  beforeRouteLeave(to, from, next) {
    if (to.name !== "chooseAtMemb") {
      sessionStorage.setItem("orgMsgVal", "");
    }
    next();
  },
  methods: {
    change(newrevoke) {
      console.log(newrevoke);
    },
    // 展示多选
    showMultiCheckFn(flag) {
      this.showMultiCheck = flag;
    },
    //多选转发
    isShowRelay(flag) {
      let vm = this;
      vm.showRelay = flag;
    },

    //处理多选的数据
    updateRelayList(item, checked) {
      let vm = this;
      if (checked) {
        vm.relayMsgList.push(item);
      } else {
        let index = vm.relayMsgList.findIndex(
          (one) => one.messageId == item.messageId
        );
        vm.relayMsgList.splice(index, 1);
      }
      console.log(vm.relayMsgList);
    },

    handleInputFocus() {
      let vm = this;
      vm.isShowEmojiList = false;
    },
    sendMsg() {
      let vm = this;
      let type = 0;
      let msgVal = vm.msgVal;
      if (!msgVal.length) {
        EventBus.$emit("showToast", "不能发送空消息");
        return false;
      }
      if (vm.isGroupChat) {
        type = 1; // 群聊
      }
      // vm.$store.dispatch('sendMsg', { msgVal, type })
      vm.$store.dispatch("sendMsg", { msgVal, chatId: vm.chatId, type });
      vm.msgVal = "";
    },

    selectEmoji(item) {
      let vm = this;
      vm.msgVal = vm.msgVal + item.name;
    },
    showEmojiList() {
      let vm = this;
      vm.isShowToolList = false;
      vm.isShowEmojiList = !vm.isShowEmojiList;
    },
    showToolList() {
      let vm = this;
      vm.isShowEmojiList = false;
      vm.isShowToolList = !vm.isShowToolList;
    },
    clickToolItem(item, event) {
      let vm = this;
      if (item.name === "语音通话" || item.name === "视频通话") {
        vm.handleAvInvite(item.name);
      } else if (item.name === "图片") {
        vm.handleOpenPic(event);
      } else if (item.name === "文件") {
        vm.handleOpenFile(event);
      } else if (item.name === "名片") {
        vm.handleSendCard(event);
      } else if (item.name === "视频(先选图片后录视频)") {
        vm.handleSendVideo(event);
      } else if (item.name === "位置") {
        vm.handleLocation();
      } else if (item.name === "语音消息") {
        vm.handleAudio();
      }
    },
    handleAvInvite(name) {
      // let vm = this
      let mediaType;
      if (name === "语音通话") {
        mediaType = 1;
      } else if (name === "视频通话") {
        mediaType = 2;
      }
      // vm.isShowToolList = false
      // vm.$store.commit('setMediaType', {mediaType})
      // vm.$store.commit('setIsFromUser', {isFromUser: true})
      // vm.$store.commit('setToUserIdVoip', {toUserIdVoip: vm.toUserId})
      // vm.$store.dispatch('sendPeerAvInvite', {from: vm.userId, to: vm.toUserId, mediaType, vm})
      EventBus.$emit("showVoipSingle");

      this.$store
        .dispatch("av/startCall", {
          invitee: [this.toUserId],
          mediaType,
          sessionType: 1,
        })
        .then(
          (res) => {
            // EventBus.$emit('showVoipSingle')
          },
          (reason) => {
            EventBus.$emit("showToast", reason.message);
          }
        );
    },
    handleOpenPic(event) {
      let vm = this;
      let type = 0;
      if (vm.isGroupChat) {
        type = 1; // 群聊
      }
      window.TeatalkSdk.MediaUtil.runGetFiles(
        event,
        2,
        async function (imgFileQueue) {
          // 1 获取文件缩略图
          const getImgThumbResults = await doMultiTasks(
            imgFileQueue,
            function (imgFile) {
              console.log(imgFileQueue);
              const subTreatTask = [];
              subTreatTask.push(
                window.TeatalkSdk.MediaUtil.getTransferThumb(
                  imgFile,
                  null,
                  "image/jpeg",
                  true
                )
              );
              return subTreatTask;
            }
          );
          console.log(getImgThumbResults);
          // 2 处理结果并发送
          for (let i = 0; i < getImgThumbResults.length; i++) {
            const imgFile = getImgThumbResults[i].target;
            console.log(imgFile.name);
            const imgThumbBlob = getImgThumbResults[i].result[0]["blob"];
            console.log(imgThumbBlob);
            const imgThumbUrl = getImgThumbResults[i].result[0]["dataUrl"];
            console.log(imgThumbUrl, typeof imgThumbUrl);
            const imgThumbFile = window.TeatalkSdk.MediaUtil.blobToFile(
              imgThumbBlob,
              imgFile.name || imgFile.fileName,
              imgFile.type,
              imgFile.lastModified,
              imgFile.relativePath || imgFile.webkitRelativePath
            );
            console.log(imgThumbFile);
            // vm.$store.dispatch('sendImg', { file: imgFile, thumb: imgThumbFile, thumbUrl: imgThumbUrl, type: type })
            vm.$store.dispatch("sendImg", {
              file: imgFile,
              thumb: imgThumbFile,
              thumbUrl: imgThumbUrl,
              chatId: vm.chatId,
              type: type,
            });
          }
        }
      );
      console.log("UI___打开相册");
    },
    handleOpenFile(event) {
      // TODO
      let vm = this;
      let type = 0;
      if (vm.isGroupChat) {
        type = 1; // 群聊
      }
      window.TeatalkSdk.MediaUtil.runGetFiles(
        event,
        1,
        async function (fileQueue) {
          // vm.$store.dispatch('sendFile', { file: fileQueue, thumb: '', thumbUrl: '', chatId: vm.chatId, type: type })
          // 1 获取文件缩略图
          // const getImgThumbResults = await doMultiTasks(fileQueue, function (file) {
          //   const subTreatTask = []
          //   subTreatTask.push(window.TeatalkSdk.MediaUtil.getTransferThumb(file, null, 'image/jpeg', true))
          //   return subTreatTask
          // })

          // // 2 处理结果并发送
          for (let i = 0; i < fileQueue.length; i++) {
            const file = fileQueue[i];
            // const imgThumbBlob = getImgThumbResults[i].result[0]['blob']
            // const imgThumbUrl = getImgThumbResults[i].result[0]['dataUrl']
            // const imgThumbFile = window.TeatalkSdk.MediaUtil.blobToFile(imgThumbBlob, imgFile.name || imgFile.fileName, imgFile.type, imgFile.lastModified, imgFile.relativePath || imgFile.webkitRelativePath)
            // vm.$store.dispatch('sendImg', { file: imgFile, thumb: imgThumbFile, thumbUrl: imgThumbUrl, type: type })
            vm.$store.dispatch("sendFile", {
              file: file,
              thumb: "",
              thumbUrl: "",
              chatId: vm.chatId,
              type: type,
            });
          }
        }
      );
      console.log("UI___打开文件");
    },
    handleSendCard(event) {
      let vm = this;
      let type = 0;
      if (vm.isGroupChat) {
        type = 1; // 群聊
      }
      vm.$store.dispatch("cardInfo", { chatId: vm.chatId, type });
    },
    quit() {
      let userid = this.userid;
      EventBus.$emit("showDialog", "退出成功！");
      window.TeatalkSdk.invoke("logout", {
        options: {
          from: userid,
        },
        callback: (success, result, reason) => {
          console.log("UI___logoutCallback-res:", result);
          if (!success) {
            console.warn("登出失败！", result, reason);
            return;
          }
        },
      });
      this.$router.push("/login");
    },
    clearHistoryMsg() {
      // let vm = this;
      this.msgList = [];
    },
    historyMsg() {
      let vm = this;
      let index = new Date().getTime();
      let pageSize = 10;
      let msgType = "WEBIM";
      let type = 0; // 1为离线 0为历史记录
      vm.$store.dispatch("historyMsg", {
        index,
        pageSize,
        msgType,
        chatId: vm.chatId,
        type,
        vm,
      });
    },
    getUserId() {
      let params = {
        options: {
          key: this.key,
          channel: this.channel,
          from: 1,
        },
        callback: (success, result, reason) => {
          if (!success) {
            console.warn("通信连接失败", result, reason);
            return;
          }
          console.log("callbackSuccess");
          console.log("result: ", result);
        },
      };
      console.log("params--------------", params);
      window.TeatalkSdk.invoke("takeUserInfoByPhoneNum", params);
    },
    getToken() {
      let params = {
        options: {
          to: this.userid,
        },
        callback: (success, result, reason) => {
          if (!success) {
            console.warn("通信连接失败", result, reason);
            return;
          }
          console.log("callbackSuccess");
          console.log("result: ", result);
        },
      };
      console.log("params--------------", params);
      window.TeatalkSdk.invoke("getTokenByUserId", params);
    },
    getGW() {
      let params = {
        options: {
          channel: this.channel,
          to: 1,
        },
        callback: (success, result, reason) => {
          if (!success) {
            console.warn("通信连接失败", result, reason);
            return;
          }
          console.log("callbackSuccess");
          console.log("result: ", result);
        },
      };
      console.log("params--------------", params);
      window.TeatalkSdk.invoke("getGWAddress", params);
    },
    friendOfflineNotify() {
      let vm = this;
      let userid = vm.chatId;
      let friendid = this.friendid;
      console.log(userid);
      window.TeatalkSdk.invoke("msgSocialOffLineNtf", {
        options: {
          from: userid,
          to: userid,
        },
        callback: (success, result, reason) => {
          console.log(success);
          console.log("UI___msgSocialOffLineNtf -Callback-res:", result);
          if (!success) {
            console.log(reason);
            console.log("获取好友离线失败！");
            return;
          }
          console.warn("好友离线！", result, reason);
        },
      });
    },
    changeOrgManager() {
      let vm = this;
      let from = this.from;
      let to = this.to;
      let userid = this.userid;
      let status = this.status;

      window.TeatalkSdk.invoke("changeOrgManager", {
        options: {
          from: from,
          to: to,
          userId: userid,
          status: status,
        },
        callback: (success, result, reason) => {
          console.log("UI___changeOrgManager -Callback-res:", result);
          if (!success) {
            console.warn("变更管理员权限", result, reason);
            return;
          }
          console.warn("变更管理员权限", result, reason);
        },
      });
    },
    quitOrg() {
      let vm = this;
      let userid = this.userid;
      let from = this.from;
      let to = this.to;
      let quitedName = this.userid;
      window.TeatalkSdk.invoke("quitOrg", {
        options: {
          from: from,
          to: to,
          quitedName: "CAKE88220220",
          orgUserInfo: [
            {
              userId: userid,
              name: "CAKE88220221",
            },
          ],
        },
        callback: (success, result, reason) => {
          console.log("UI___msgSocialOffLineNtf -Callback-res:", result);
          if (!success) {
            console.warn("获取好友离线失败！", result, reason);
            return;
          }
          console.warn("好友离线！", result, reason);
        },
      });
    },
    changeOrgCreater() {
      let vm = this;
      let from = this.from;
      let to = this.to;
      let userid = this.userid;
      window.TeatalkSdk.invoke("changeOrgCreater", {
        options: {
          orgId: to,
          originCreater: from,
          curCreater: userid,
        },
        callback: (success, result, reason) => {
          console.log("UI___changeOrgCreater -Callback-res:", result);
          if (!success) {
            console.warn("获取好友离线失败！", result, reason);
            return;
          }
          console.warn("好友离线！", result, reason);
        },
      });
    },
    pullOfflineMsg() {
      let from = this.from;
      window.TeatalkSdk.invoke("pullOfflineMsg", {
        options: {
          from: from,
          offLineMsg: [
            {
              accountId: this.accountId,
              versionId: this.versionId,
            },
          ],
        },
        callback: (success, result, reason) => {
          console.log("UI___changeOrgCreater -Callback-res:", result);
          if (!success) {
            console.warn("获取好友离线失败！", result, reason);
            return;
          }
          console.warn("好友离线！", result, reason);
        },
      });
    },
    // 拒绝加好友通知
    refuseFriendNotify() {
      let vm = this;
      let friendid = vm.chatId;
      let friendname = this.friendname;
      let userid = this.userid;
      console.log(friendid, userid);
      window.TeatalkSdk.invoke("isAddFriend", {
        options: {
          from: userid,
          type: 2,
          friendUserId: friendid,
          nickname: "1111",
        },
        callback: (success, result, reason) => {
          console.log(success);
          console.log("UI__refuseFriendNotify -Callback-res:", result);
          if (!success) {
            console.log(reason);
            console.log("拒绝失败！");
            return;
          }
          console.warn("已拒绝！", result, reason);
        },
      });
    },
    offlineMsg() {
      let vm = this;
      let index = new Date().getTime();
      let pageSize = 10;
      let msgType = "WEBIM";
      let type = 1; // 1为离线 0为历史记录
      vm.$store.dispatch("historyMsg", {
        index,
        pageSize,
        msgType,
        chatId: vm.chatId,
        type,
        vm,
      });
      EventBus.$emit("showDialog", "离线消息获取成功！详情查看控制台");
    },
    getPPFocusList() {
      let from = this.from;
      // let accountType = 1;
      let params = {
        options: {
          from: from,
          // accountType: accountType,
        },
        callback: (success, result, reason) => {
          if (!success) {
            console.warn("通信连接失败", result, reason);
            return;
          }
          console.log("callbackSuccess");
          console.log("result: ", result);
        },
      };
      console.log("params--------------", params);
      window.TeatalkSdk.invoke("getPPFocusList", params);
    },
    setPPFocus() {
      let from = this.from;
      let to = this.to;
      let params = {
        options: {
          from: from,
          to: to,
          eventType: 1,
          channelId: 2,
        },
        callback: (success, result, reason) => {
          if (!success) {
            console.warn("通信连接失败", result, reason);
            return;
          }
          console.log("callbackSuccess");
          console.log("result: ", result);
        },
      };
      console.log("params--------------", params);
      window.TeatalkSdk.invoke("setPPFocus", params);
    },
    CollectMsg() {
      let vm = this;
      vm.$store.dispatch("msgCollectId", { vm });
    },
    checkInputVal(e) {
      let vm = this;
      vm.msgVal = e.target.value.trim();
      if (vm.isGroupChat && e.data === "@") {
        sessionStorage.setItem("orgMsgVal", vm.msgVal);
        vm.$router.push({ name: "chooseAtMemb" });
      }
    },
    // 视频消息
    handleSendVideo(event) {
      let vm = this;
      // 先选图片再录视频
      window.TeatalkSdk.MediaUtil.runGetFiles(
        event,
        2,
        async function (imgFileQueue) {
          // 1 获取图片缩略图
          const getImgThumbResults = await doMultiTasks(
            imgFileQueue,
            function (imgFile) {
              const subTreatTask = [];
              subTreatTask.push(
                window.TeatalkSdk.MediaUtil.getTransferThumb(
                  imgFile,
                  null,
                  "image/jpeg",
                  true
                )
              );
              return subTreatTask;
            }
          );
          console.log(getImgThumbResults);
          // 2 处理结果并发送
          for (let i = 0; i < getImgThumbResults.length; i++) {
            const imgFile = getImgThumbResults[i].target;
            const imgThumbBlob = getImgThumbResults[i].result[0]["blob"];
            const imgThumbFile = window.TeatalkSdk.MediaUtil.blobToFile(
              imgThumbBlob,
              imgFile.name || imgFile.fileName,
              imgFile.type,
              imgFile.lastModified,
              imgFile.relativePath || imgFile.webkitRelativePath
            );
            vm.videoImgThumbFile = imgThumbFile;
            vm.recordingVideo = true;
          }
        }
      );
    },
    // 发送位置
    handleLocation(event) {
      this.onSuccess({
        coords: {
          longitud: 115.7,
          latitude: 39.4,
        },
      });

      return false;

      // 获取当前位置
      var options = {
        enableHighAccuracy: true,
        maximumAge: 1000,
      };
      if (navigator.geolocation) {
        //浏览器支持geolocation
        navigator.geolocation.getCurrentPosition(
          this.onSuccess,
          this.onError,
          options
        );
      } else {
        //浏览器不支持geolocation
        alert("浏览器不支持geolocation");
      }
    },
    onSuccess(position) {
      let vm = this;
      let type = 0;
      if (vm.isGroupChat) {
        type = 1; // 群聊
      }
      //经度
      this.longitude = position.coords.longitude;
      //纬度
      this.latitude = position.coords.latitude;
      // this.showMap = true
      let lat = Number(this.latitude) * Math.pow(10, 6);
      let lng = Number(this.longitude) * Math.pow(10, 6);
      alert("当前位置：经度" + this.longitud + ", 纬度" + this.latitude);
      window.TeatalkSdk.MediaUtil.runGetFiles(
        event,
        2,
        async function (imgFileQueue) {
          // 1 获取文件缩略图
          const getImgThumbResults = await doMultiTasks(
            imgFileQueue,
            function (imgFile) {
              console.log(imgFileQueue);
              const subTreatTask = [];
              subTreatTask.push(
                window.TeatalkSdk.MediaUtil.getTransferThumb(
                  imgFile,
                  null,
                  "image/jpeg",
                  true
                )
              );
              return subTreatTask;
            }
          );
          console.log(getImgThumbResults);
          // 2 处理结果并发送
          for (let i = 0; i < getImgThumbResults.length; i++) {
            const imgFile = getImgThumbResults[i].target;
            const imgThumbBlob = getImgThumbResults[i].result[0]["blob"];
            const imgThumbUrl = getImgThumbResults[i].result[0]["dataUrl"];
            const imgThumbFile = window.TeatalkSdk.MediaUtil.blobToFile(
              imgThumbBlob,
              imgFile.name || imgFile.fileName,
              imgFile.type,
              imgFile.lastModified,
              imgFile.relativePath || imgFile.webkitRelativePath
            );
            vm.$store.dispatch("sendLocation", {
              latitude: lat,
              longitude: lng,
              descFileId: "",
              thumb: imgThumbFile,
              chatId: vm.chatId,
              type: type,
            });
          }
        }
      );
      console.log("UI___打开相册");
    },
    onError(error) {
      console.log("获取位置信息失败：", error);
      switch (error.code) {
        case 1:
          alert("位置服务被拒绝");
          break;

        case 2:
          alert("暂时获取不到位置信息");
          break;

        case 3:
          alert("获取信息超时");
          break;

        case 4:
          alert("未知错误");
          break;
      }
    },

    handleAudio() {
      //录制语音
      let that = this;
      that.recordingAudio = true;
    },
    onRecordAudioClose(file, duration) {
      let vm = this;
      vm.recordingAudio = false;
      let type = 0;
      if (vm.isGroupChat) {
        type = 1; // 群聊
      }
      // 处理并发送录音
      if (file) {
        vm.$store.dispatch("sendAudio", {
          file: file,
          filetype: 1,
          bitrate: 4,
          totalTime: duration,
          chatId: vm.chatId,
          type: type,
        });
      }
    },
    onRecordVideoClose(file) {
      let vm = this;
      vm.recordingVideo = false;
      let type = 0;
      if (vm.isGroupChat) {
        type = 1; // 群聊
      }
      if (file) {
        vm.$store.dispatch("sendVideo", {
          file: file,
          thumb: vm.videoImgThumbFile,
          thumbUrl: "",
          chatId: vm.chatId,
          type: type,
        });
      }
    },
  },
  computed: {
    ...mapState({
      userId: (state) => state.base.userId,
      toUserId: (state) => state.base.toUserId,
      msgListMap: (state) => state.msg.msgListMap,
      // 'msgList': state => state.msg.msgList
      msgCollectLists: (state) => state.msg.msgCollectLists,
      friendList: (state) => state.friend.friendList,
      groupLists: (state) => state.group.orgList,
      userInfos: (state) => state.group.userInfos,
    }),
    msgList: {
      get: function () {
        let vm = this;
        console.log("UI___computed-msgList: ", vm.msgListMap);
        console.log(vm.chatId);
        return vm.msgListMap && vm.msgListMap[vm.chatId];
      },
      set: function (items) {
        this.msgListMap[this.chatId] = items;
      },
    },
    emojiList() {
      let list = [];
      Object.keys(emojiMap).forEach((key) => {
        let obj = {};
        obj.name = key;
        obj.val = emojiMap[key];
        list.push(obj);
      });
      return list;
    },
    isGroupChat() {
      let vm = this;
      return /\/groupChat\/\d/.test(vm.$route.path);
    },
    notifyList() {
      let vm = this;
      console.log("UI___computed-notifyList: ", vm.notifyList);
      return vm.notifyList;
    },
  },
  created() {
    let vm = this;
    vm.chatId = parseInt(vm.$route.params.id);
    vm.msgVal = sessionStorage.getItem("orgMsgVal") || "";
    console.log("UI___store: ", vm.$store);
  },
};
</script>

<style lang="scss">
.page-container {
  height: 100%;
  background-color: $base-bg-color;
  .l-header {
    @include l-header;
  }
  .l-main {
    width: 100%;
    height: 100%;
    @include displayFlex("", "", column);
    .chat-section {
      width: 100%;
      flex: 1 1 auto;
      overflow-y: auto;
      padding-top: 88px;
      background-color: $app-bg-color;
      -webkit-overflow-scrolling: touch;
      .chat-section__content {
        padding: 10px 24px;
        .message-wrapper {
          margin: 30px auto;
        }
        button {
          background: lightblue;
          margin: 6px;
          border-radius: 3px;
        }
      }
    }
    .bottom-section {
      flex: 0 0 auto;
      background-color: $base-bg-color;
      .bottom-section__input {
        @include displayFlex(space-between);
        padding: 16px 20px;
        .input__input-box {
          width: 566px;
          height: 66px;
          border: $base-border;
          border-radius: 100px;
          padding: 0 20px;
          input {
            width: 100%;
            height: 100%;
            @include font(30px, #353535);
          }
        }
        .input__btn-box {
          @include displayFlex(flex-end);
          height: 100%;
          .input__emoji-btn {
            width: 52px;
            height: 52px;
            background-image: url("../assets/imgs/btn_emoji-n.png");
            background-repeat: no-repeat;
            background-size: 100%;
            position: relative;
            margin-left: 20px;
          }
          .input__tool-btn {
            width: 52px;
            height: 52px;
            background-image: url("../assets/imgs/input_other.png");
            background-repeat: no-repeat;
            background-size: 100%;
            position: relative;
            margin: 0 20px;
          }
          .input__sent-btn {
            width: 110px;
            height: 66px;
            line-height: 66px;
            text-align: center;
            @include font(26px, #ffffff);
            background-color: #0096ff;
            border-radius: 100px;
          }
        }
      }
      .bottom-section__emoji-list {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        width: 100%;
        height: 422px;
        padding: 16px 0 30px 14px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        border-top: $base-border;
        .emoji-wrapper {
          position: relative;
          width: 70px;
          height: 70px;
          margin: 10px;
          img {
            width: 100%;
            height: 100%;
          }
        }
      }
      .bottom-section__tool-list {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        width: 100%;
        height: 422px;
        padding: 48px 0 30px 65px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        border-top: $base-border;
        .tool-wrapper {
          position: relative;
          width: 110px;
          margin-right: 60px;
          img {
            width: 100%;
          }
          p {
            margin-top: 10px;
            @include font(24px, #999999);
          }
        }
      }
    }
  }
  .log-params-list {
    display: flex;
    flex-direction: column;
    div {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      padding: 5px;
      span {
        width: 30%;
        white-space: nowrap;
        text-align: right;
      }
      input {
        padding: 5px;
      }
    }
  }
  .multi-select {
    position: absolute;
    left: 0;
  }
}
</style>
