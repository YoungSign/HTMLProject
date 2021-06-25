<template>
    <div class="c-toast" v-if="toastVisible">
        <div class="c-toast__content">{{toastText}}</div>
    </div>
</template>

<script>
export default {
  name: 'xm-toast',
  props: {
    toastText: {
      type: String,
      default: 'system error'
    },
    toastVisible: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  data () {
    return {}
  },
  methods: {},
  watch: {
    toastVisible (val) {
      let vm = this
      if (val) {
        vm.timer = window.setTimeout(() => {
          vm.$emit('update:toastVisible', false)
          window.clearTimeout(vm.timer)
        }, vm.duration)
      }
    }
  },
  computed: {}
}
</script>

<style scoped lang="scss">
    .c-toast{
        width: 100%;
        position: absolute;
        top: 50%;
        z-index: 1001;
        display: flex;
        justify-content: center;
        align-items: center;
        .c-toast__content{
            width: 600px;
            padding: 15px 40px;
            @include font(30px, #ffffff);
            text-align: center;
            border-radius: 16px;
            background-color: rgba(0, 0, 0, .5);
        }
    }
</style>
