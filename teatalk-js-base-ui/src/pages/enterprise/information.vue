<template>
  <div class="page-container">
    <div class="l-header">
      <xm-top-nav :curRoute="$route"></xm-top-nav>
    </div>
    <div class="l-main">
      <div class="list-item">
        <div class="list__portrait">
          <img :src="information.portrait || defaultAvatar">
        </div>
      </div>
      <div class="sect-wrap mb-20">
        <div class="sect-item">
          <p class="sect-tit">姓名：</p>
          <p class="sect-icon">
            <span class="group-name">{{information.realname}}</span>
          </p>
        </div>
        <div class="sect-item">
          <p class="sect-tit">性别：</p>
          <p class="sect-icon">
            <span class="group-name">{{information.version}}</span>
          </p>
        </div>
        <div class="sect-item">
          <p class="sect-tit">手机号：</p>
          <p class="sect-icon">
            <span class="group-name">{{information.mp}}</span>
          </p>
        </div>
        <div class="sect-item">
          <p class="sect-tit">邮箱：</p>
          <p class="sect-icon">
            <span class="group-name">{{information.email}}</span>
          </p>
        </div>
        <div class="sect-item">
          <p class="sect-tit">部门：</p>
          <p class="sect-icon">
            <span class="group-name">{{information.deptnames}}</span>
          </p>
        </div>
        <div class="sect-item">
          <p class="sect-tit">职位：</p>
          <p class="sect-icon">
            <span class="group-name">{{information.rank}}</span>
          </p>
        </div>
        <div class="sect-item">
          <p class="sect-tit">企业：</p>
          <p class="sect-icon">
            <span class="group-name">{{information.title}}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      defaultAvatar: require('@/assets/imgs/avatar_default.jpg')
    }
  },
  computed: {
    ...mapState({
      'userId': state => state.base.userId,
      'enpInformation': state => state.enterprise.enpInformation
    }),
    information () {
      let vm = this
      return vm.enpInformation
    }
  }
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
    .list-item{
      width: 20%;
      padding: 3%;
      margin: 0 auto;
      .list__portrait{
        width: 100%;
        height: 105px;
        border-radius: 50%;
        overflow: hidden;
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
    .sect-wrap{
      color: #666666;
      .sect-item{
        height: 108px;
        line-height: 108px;
        display: flex;
        /*justify-content: space-between;*/
        align-items: center;
        padding: 0 20px;
        font-size: 28px;
        border-bottom: 1px solid #e0e0e0;
        background-color: $base-bg-color;
        .sect-tit{
          margin-right: 10px;
          flex-shrink: 0;
        }
        .sect-icon{
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .sect-btn-item{
        width: 90%;
        height: 88px;
        line-height: 88px;
        margin: 30px auto;
        color: #ffffff;
        font-size: 32px;
        background-color: #0096FF;
        border-radius: 100px;
        box-shadow: 2px 2px 3px #999999;
      }
    }
  }
}
</style>
