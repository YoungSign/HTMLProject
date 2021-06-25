<template>
  <div class="c-portrait-list">
    <div class="list-item" v-for="(item, index) in groupMembers" :key="index" @click="goMembDetail(item)">
      <div class="list__portrait">
        <img :src="item.avatar || defaultAvatar">
      </div>
      <div class="list__name">{{item.name || '未命名'}}</div>
    </div>
    <div class="list-item">
      <div class="list__portrait icon" @click="add()">+</div>
      <div class="list__name"></div>
    </div>
    <div class="list-item">
      <div class="list__portrait icon" v-if="isGroupControl && isGroupLeader" @click="minus()">-</div>
      <div class="list__name"></div>
    </div>

    <div class="select-wrap" v-if="isGoSetAdmin && showOperateAdmin">
      <div v-show="isMinus">
        <div class="item" v-for="(item, index) in groupMembers" :key="index">
          {{item.name}} {{item.userId || '未命名'}}
        </div>
      </div>
      <input type="text" placeholder="请输入设置权限的userid" class="friendid" v-model="friendid" @keyup.enter="operateAdmin()">
      <button class="confirmBtn" @click="operateAdmin()">确定</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { EventBus } from '../../event-bus'

export default {
  name: 'xm-portrait-list',
  props: {
    itemInfo: {
      type: Object
    }
  },
  data () {
    return {
      defaultAvatar: require('@/assets/imgs/avatar_default.jpg'),
      friendid: '',
      isAdd: false,
      isMinus: false,
      addOrMinus: false,
      showOperateAdmin: false
    }
  },
  methods: {
    goMembDetail (item) {
      let vm = this
      if (vm.baseUserId === item.userId) {} else {
        vm.$router.push({
          name: 'membDetail',
          params: {
            detailId: item.userId
          }
        })
      }
    },
    add () {
      let vm = this
      // vm.isGroupControl && vm.showAddOrMinus(1)
      vm.isGroupControl && (function () {
        vm.$router.push({path: '/addOrMinusMemb', query: { type: 1 }})
      }())
      vm.isGoSetAdmin && (function () {
        vm.isAdd = true
        vm.isMinus = false
        vm.showOperateAdmin = true
      }())
    },
    minus () {
      let vm = this
      vm.isGoSetAdmin && (function () {
        vm.isAdd = false
        vm.isMinus = true
        vm.showOperateAdmin = true
      }())
      // vm.isGroupControl && vm.showAddOrMinus(0)
      vm.isGroupControl && (function () {
        vm.$router.push({path: '/addOrMinusMemb', query: { type: 0 }})
      }())
    },
    operateAdmin () {
      let vm = this
      let param = {
        from: vm.itemInfo.userId,
        to: vm.itemInfo.groupId,
        userId: vm.friendid,
        status: vm.isAdd ? 0 : 1
      }
      vm.$store.dispatch('changeOrgManager', { param, vm })
      vm.showOperateAdmin = false
    }
  },
  computed: {
    ...mapState({
      'baseUserId': state => state.base.userId
    }),
    groupMembers () {
      let vm = this
      return vm.itemInfo.orgUserInfo || []
    },
    isGroupControl () {
      let vm = this
      return vm.$route.path === '/groupControl'
    },
    isGoSetAdmin () {
      let vm = this
      return vm.$route.path === '/groupAdmin'
    },
    isGroupLeader () {
      let vm = this
      return vm.itemInfo.createuserId && vm.itemInfo.createuserId === vm.itemInfo.userId
    }
  }
}
</script>

<style scoped lang="scss">
  .c-portrait-list{
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    width: 100%;
    padding: 20px 0;
    background-color: #ffffff;
    .list-item{
      width: 20%;
      padding: 0 3%;
      .list__portrait{
        width: 100%;
        height: 105px;
        border-radius: 6px;
        background-color: #e0e0e0;
        img{
          width: 100%;
          height: 100%;
        }
        &.icon{
          height: 105px;
          line-height: 105px;
          border: 1px dashed #e0e0e0;
          font-size: 60px;
          font-weight: normal;
          color: #999999;
          background-color: $base-bg-color;
        }
      }
      .list__name{
        width: 100%;
        padding: 10px 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .select-wrap{
      width: 100%;
      display: flex;
      justify-content: flex-start;
      .confirmBtn{
        padding: 6px 8px;
        font-size: 20px;
      }
      .item{
        display: inline-block;
        margin: 0 20px;
      }
      .inputs{
        padding: 0 10px;
        border: 1px solid #aaaaaa;
      }
    }
  }
</style>
