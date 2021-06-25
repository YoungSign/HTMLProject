<template>
    <div class="c-message" @click="winBtn(item)">
        <div class="message">
            <div class="message__date">{{formatMsgTime(item.Time)}}</div>
            <div class="message__main">
                <div class="message__body">
                  <div class="message__content">{{item.Type === 0 || item.Type === 2 ? '暂不支持图片、文件消息' : item.Body}}</div>
                </div>
                <div class="message_dialog" v-show="(cId == item.Id) && flag" @click.stop="deleteBtn(item)">删除</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'xm-msgcollect',
  props: {
    item: {
      type: Object
    }
  },
  data () {
    return {
      flag: false,
      cId: -9999999
    }
  },
  methods: {
    winBtn (item) {
      this.cId = item.Id
      this.flag = !this.flag
    },
    deleteBtn (item) {
      let vm = this
      console.log(item)
      vm.$store.dispatch('msgCollectionDelete', { item })
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
  },
  computed: {}
}
</script>

<style lang="scss">
    .c-message{
        .message{
            .message__date{
                /*display: none;*/
                display: inline-block;
                margin: 0 auto 20px;
                padding: 8px 30px;
                text-align: center;
                background-color: rgba(0,0,0,.3);
                border-radius: 100px;
                @include font(24px, #ffffff);
            }
            .message__main{
                display: flex;
                justify-content: flex-start;
                align-items: flex-start;
                position: relative;
                .message__body{
                    margin: 0 0 0 20px;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    .message__content{
                        flex: 1 1 auto;
                        flex-wrap: wrap;
                        text-align: left;
                        padding: 14px 30px;
                        border-radius: 10px;
                        background-color: #0096FF;
                        @include font(36px, #ffffff);
                    }
                }
                .message_dialog{
                    position: absolute;
                    top: -40px;
                    right: 80%;
                    margin-right: 6px;
                    font-size: 24px;
                }
            }
       }
    }
</style>
