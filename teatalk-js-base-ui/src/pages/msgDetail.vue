<template>
  <div class="msgDetail">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="detail">
      <div class="detailPortrait">
        <xm-portrait></xm-portrait>
      </div>
      <div class="detailMsg">
        <!-- 转发,收藏嵌套查询 -->
        <div v-if="flag">
          <div class="detailCont" v-for="(itemQuery, index1) in MergeQueryList" :key="index1">
            <div class="detailTop">
              <div v-if="itemQuery.type == 37">
                <div class="name">{{itemQuery.deviceToken}}</div>
              </div>
              <div v-else class="name">{{itemQuery.to}}</div>
              <div class="dataTime">{{formatMsgTime(itemQuery.msgSequence)}}</div>
            </div>
          <div v-if="itemQuery.type == 37">
            <div class="detailBot" @click="cont(itemCre)" v-for="(itemCre, index2) in itemQuery.content" :key="index2">
              <span v-if="itemCre.type === null || itemCre.type === undefined" v-html="handleMsgWithEmoji(itemCre.content)"></span>
              <a target="_blank" v-else-if="itemCre.type === 0">图片消息</a>
              <a target="_blank" v-else-if="itemCre.type == 6">名片消息: {{itemCre.content.name}}</a>
              <span v-else-if="itemCre.type == 37">{{itemCre.deviceToken}}</span>
              <span v-else>{{itemCre.content}}</span>
            </div>
          </div>
          <div v-else-if="itemQuery.type === null || itemQuery.type === undefined" class="detailBot" v-html="handleMsgWithEmoji(itemQuery.Headers.Request.Body)"></div>
          <div v-else-if="itemQuery.type == 0" class="detailBot">
            <a target="_blank">图片消息</a>
          </div>
          <div v-else-if="itemQuery.type == 2" class="detailBot">
            <a target="_blank">文件消息</a>
          </div>
          <div v-else-if="itemQuery.type == 3" class="detailBot">
            <a target="_blank">视频消息</a>
          </div>
          <div v-else-if="itemQuery.type == 6" class="detailBot">
            <a target="_blank">名片消息</a>
          </div>
          </div>
        </div>
        <!-- 转发第一层 -->
        <div v-else class="detailCont" v-for="(itemcon, index) in $route.query.item.content" :key="index">
          <div class="detailTop">
            <div class="name">{{itemcon.to ? itemcon.to : itemcon.To}}</div>
            <div class="dataTime">{{itemcon.serverTime ? itemcon.serverTime : itemcon.DateTime}}</div>
          </div>
          <!-- <div class="detailBot">{{itemcon.content ? itemcon.content : itemcon.Body}}</div> -->
          <div class="detailBot" v-if="itemcon.type === null || itemcon.type === undefined" v-html="handleMsgWithEmoji(itemcon.content ? itemcon.content : itemcon.Body)"></div>
          <div class="detailBot" v-else-if="itemcon.type === 0">
            <a target="_blank">图片消息</a>
          </div>
          <div class="detailBot" v-else-if="itemcon.type === 2">
            <a target="_blank">文件消息</a>
          </div>
          <div class="detailBot" v-else-if="itemcon.type === 3">
            <a target="_blank">视频消息</a>
          </div>
          <div class="detailBot" v-else-if="itemcon.type === 6">
            <a target="_blank">名片消息</a>
          </div>
        </div>

        <!-- 收藏 -->
        <div v-if="$route.query.flagCollect === 1 && !flag">
          <div class="detailCont" v-for="(itemBody, index2) in item.Body" :key="index2">
            <div class="detailTop">
              <!-- <div v-if="itemBody.type == 37">
                <div class="name">{{itemBody.deviceToken}}</div>
              </div> -->
              <div class="name">{{itemBody.to}}</div>
              <div class="dataTime">{{itemBody.msgSequence}}</div>
            </div>
            <div class="detailBot">{{itemBody.Headers.Request.Body}}</div>
            <div class="detailBot" v-if="itemBody.Headers.Request.Body=='' && itemBody.type === 37" @click="collectCon(itemBody)">{{item.DeviceToken}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { emojiMap } from '../utils'
export default {
  data () {
    return {
      item:{},
      flag: false, // 转发的标识 是转发为true
    }
  },
  mounted(){
    console.log(this.$route.query.item)
    if(this.$route.query.flagCollect === 1){
      //收藏
      this.item = this.$route.query.item
      console.log(this.item)
    }else{
      //转发
      this.item = this.$route.query.item
      let index = this.item.content.findIndex(s => s.content);
      if(index < 0 && this.userId == this.item.sender){

      }else{
        this.flag = true
        this.$store.dispatch('messageMergeQuery', {to:this.item.to,key:this.item.from,index:this.item.to,msgSequence:this.item.msgSequence})
      } 
    }
      
  },
  computed: {
    ...mapState({
      'userId': state => state.base.userId,
      'msgMergeQuery': state => state.msg.msgMergeQuery,
    }),
    MergeQueryList () {
      console.log('UI___computed-msgMergeQuery: ', this.msgMergeQuery)
      return this.msgMergeQuery
    }
  },
  methods: {
    //转发
    cont(itemcon){
      // console.log('查询转发参数------------', itemcon)
      if (itemcon.type == 37) {
        this.$store.dispatch('messageMergeQuery', { to: itemcon.to, key: itemcon.from, index: itemcon.to, msgSequence: itemcon.msgSequence })
      }
      // if(this.userId == this.item.sender){
      //   for (var value of this.item.content){
      //     console.log(value);
      //     if (itemcon.dateTime == value.serverTime) {
      //       this.$store.dispatch('messageMergeQuery', {to:value.to,key:value.from,index:value.to,dateTime:value.msgSequence})
      //     } else if (value.content) {
      //       for (let i = 0; i < value.content.length; i++) {
      //         this.$store.dispatch('messageMergeQuery', {to:value.content[i].to,key:value.content[i].from,index:value.content[i].to,dateTime:value.content[i].msgSequence})
      //       }
      //     }
      //   }
      // }else{
      //   console.log(itemcon)
      //     if(itemcon.Body == null || itemcon.Body == "" || itemcon.Body == undefined){
      //       this.$store.dispatch('messageMergeQuery', {to:itemcon.From,key:itemcon.To,index:itemcon.From,dateTime:itemcon.Version})
      //     }
      // }
    },
    //收藏
    collectCon(itemBody){
      this.flag = true
      this.$store.dispatch('messageMergeQuery', {to:itemBody.to,key:itemBody.from,index:itemBody.to,dateTime:itemBody.msgSequence})
    },
    handleMsgWithEmoji (content) {
      console.log(content)
      Object.keys(emojiMap).forEach(function (emoji) {
        while (content.indexOf(emoji) >= 0) {
          let index = content.indexOf(emoji)
          console.log(index)
          let emojiLen = emoji.length
          console.log(emojiLen)
          console.log(content)
          console.log(content.substring(0, index))
          console.log(emoji)
          console.log(emojiMap[emoji])
          console.log(content.substring(index + emojiLen))
          content = content.substring(0, index) + emojiMap[emoji] + content.substring(index + emojiLen)
          console.log(content)
        }
      })
      return content
    },
    formatMsgTime (time) {
      let dayList = ['日', '一', '二', '三', '四', '五', '六']
      let msgTimeObj = new Date(time)
      let nowTimeObj = new Date()
      let msgTime = time
      let nowTime = nowTimeObj.getTime()
      let todayZeroTime = new Date(nowTimeObj.toLocaleDateString()).getTime()
      let D = nowTime - todayZeroTime
      let E = nowTime - msgTime
      let F = (E - D) / (1000 * 60 * 60)
      if (F <= 0) { // 当天
        return msgTimeObj.Format('hh:mm')
      } else if (F > 0 && F <= 24) { // 昨天
        return '昨天 ' + msgTimeObj.Format('hh:mm')
      } else if (F > 24 && F <= 48) { // 前天
        return '前天 ' + msgTimeObj.Format('hh:mm')
      } else if (F > 48 && F <= 144) { // 一周内
        return '星期' + dayList[msgTimeObj.getDay()] + ' ' + msgTimeObj.Format('hh:mm')
      } else { // 一周外
        return msgTimeObj.Format('yyyy-MM-dd hh:mm')
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .msgDetail{
    padding-top: 88px;
    height: 100%;
    background-color: $base-bg-color;
    .l-header{
      @include l-header;
    }
    .detail{
      
      .detailPortrait{
        flex: 0 0 auto;
        width: 84px;
        height: 84px;
        border-radius: 50%;
        overflow: hidden;
        background-color: $base-bg-color;
        float: left;
      }
      .detailMsg{
        float: left;
        width: 80%;
        .detailCont{        
          border-bottom: 1px solid #333;
          padding: 20px;
          .detailTop{
            overflow: hidden; 
            .name{
              font-size: 30px;
              float: left;
            }
            .dataTime{
              float: right;
              font-size: 30px;
            }
          }
          .detailBot{
            font-size: 30px;
            font-weight: bold;
            text-align: left;
            padding-top: 20px;
            span {
              display: inline-block;
              height: 60px !important;
              img{
                width: 60px !important;
                height: auto;
                vertical-align: text-bottom;
              }
            }
          }
        }
      }
      
    }
      
        
        
    
  }
</style>
