<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="sect-wrap mb-20">
        <div class="sect-item" @click="goAdminGroup(0)">
          <p class="sect-tit">群管理员</p>
          <p class="sect-icon">&#62;</p>
        </div>
        <div class="sect-item" @click="goAdminGroup(1)">
          <p class="sect-tit">转移群主</p>
          <p class="sect-icon">&#62;</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    goAdminGroup (removeLeader) {
      let vm = this
      // vm.$router.push({name: 'groupAdmin'})
      vm.$router.push({path: '/groupAdmin', query: { removeLeader }})
    }
  },
  computed: {}
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
      .mb-20{
        margin-bottom: 20px;
      }
      .sect-wrap{
        height: 108px;
        line-height: 108px;
        color: #666666;
        .sect-item{
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          font-size: 28px;
          border-bottom: 1px solid #e0e0e0;
          background-color: $base-bg-color;
        }
      }
    }
  }
</style>
