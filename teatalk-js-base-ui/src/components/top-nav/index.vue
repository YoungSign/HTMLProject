<template>
    <div class="c-top-nav--wrapper">
        <div class="nav__left" @click='goBack()'>&#60;</div>
        <div class="nav__mid">{{curRoute.params.id || curRoute.meta.pageTitle}}</div>
        <div class="nav__right nav__search" v-show="showSearch" @click='goSearchMembPage()'></div>
        <div class="nav__right" @click='onButton()'>{{navRight}}</div>
    </div>
</template>

<script>
export default {
  name: 'xm-top-nav',
  props: {
    curRoute: Object
  },
  data () {
    return {
      showSelect: true,
      showSearch: false
    }
  },
  methods: {
    goBack () {
      let vm = this
      vm.$router.go(-1)
    },
    onButton () {
      let vm = this
      console.log('onButton' + vm.showSelect)
      if (vm.isGroupChat) {
        vm.$router.push({name: 'groupControl'})
      }
      vm.$emit('showSelect', vm.showSelect)
    },
    goSearchMembPage () {
      let vm = this
      vm.$router.push({name: 'searchMembPage'})
    }
  },
  computed: {
    isIndexPage () {
      let vm = this
      return vm.$route.path === '/'
    },
    isGroupChat () {
      let vm = this
      return /\/groupChat\/\d/.test(vm.$route.path)
    },
    navRight () {
      let vm = this
      if (vm.isGroupChat) {
        return '...'
      } else {
        return '+'
      }
    }
  },
  created () {
    let vm = this
    if (vm.isIndexPage) {
      vm.showSearch = true
    }
  }
}
</script>

<style scoped lang="scss">
    .c-top-nav--wrapper{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        background-color: $base-bg-color;
        border-bottom: $base-border;
        width: 100%;
        height: 100%;
        .nav__left{
            width: 42px;
            height: 42px;
            line-height: 42px;
            font-size: 42px;
        }
        .nav__mid{
            width: 375px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            @include font(38px, #333333, bold);
        }
        .nav__right{
            width: 42px;
            height: 42px;
            line-height: 42px;
            font-size: 42px;
        }
        .nav__search{
          @include backgroundImg("../../assets/imgs/search_btn.png");
        }
    }
</style>
