<template>
  <div class="friend-list">
    <div class="friend-sec-item">
      <div class="friend-sub-list">
        <div class="friend-item" v-for="(item, index) in lists" :key="index" @click="goInformation(item)">
          <div class="friend-item__portrait">
            <img :src="item.userAvatar || defaultAvatar">
          </div>
          <div class="friend-item__name">{{item.realname}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'enpMember-list',
  props: {
    lists: {
      type: Array
    }
  },
  data () {
    return {
      defaultAvatar: require('@/assets/imgs/avatar_default.jpg')
    }
  },
  methods: {
    goInformation (item) {
      let vm = this
      console.log(item)
      vm.$store.dispatch('queryEmployeesForPgmuserid', { item })
      // vm.$store.dispatch('queryEmployeesForUserids', { item })
      // vm.$store.dispatch('queryLoginUserInfo', { item })
      vm.$router.push({name: 'enpDetailed'})
    }
  },
  computed: {
    ...mapState({
      'baseUserId': state => state.base.userId
    })
  }
}
</script>

<style scoped lang="scss">
  .friend-list{
    padding-bottom: 20px;
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
</style>
