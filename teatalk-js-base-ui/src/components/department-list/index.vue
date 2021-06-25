<template>
  <div class="c-list">
    <div class="list-item" v-for="(item, index) in lists" :key="index" @click="handleItem(item)">
      <div class="list__portrait">
        <!--<img :src="item.avatar || defaultAvatar">-->
      </div>
      <div class="list__name">{{item.deptname}}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'department-list',
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
    handleItem (item) {
      let vm = this
      console.log(item)
      if (item.depth === 0) {
        vm.$store.dispatch('getDepartment', { item })
        vm.$router.push({name: 'enpDepartment'})
      } else {
        vm.$store.dispatch('getEmployeeForOneDeptid', { item })
        vm.$router.push({name: 'enpAllMember'})
      }
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
  .list-item{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 1.44rem;
    padding-right: 20px;
    background-color: #ffffff;
    .check-box{
      flex: 0 0 auto;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background-color: #999999;
    }
    .list__portrait{
      flex: 0 0 auto;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      overflow: hidden;
      background-color: $base-bg-color;
      /*margin: 0 20px;*/
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
</style>
