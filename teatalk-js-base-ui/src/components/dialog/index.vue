<template>
    <div class="c-dialog" v-show="dialogVisible">
        <div class="c-dialog__wrapper">
            <div class="c-dialog__content">
                <p class="c-dialog__msg">{{dialogText}}</p>
                <button class="c-dialog__button" @click="handleDialogConfirm">确认</button>
            </div>
        </div>
        <div class="c-dialog__mask"></div>
    </div>
</template>

<script>
export default {
  name: 'xm-dialog',
  props: {
    dialogText: {
      type: String,
      default: 'system error'
    },
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {}
  },
  methods: {
    handleDialogConfirm () {
      this.$emit('update:dialogVisible', false)
    }
  },
  computed: {}
}
</script>

<style scoped lang="scss">
    .c-dialog{
        .c-dialog__wrapper{
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1001;
            display: flex;
            justify-content: center;
            align-items: center;
            .c-dialog__content{
                width: 600px;
                height: auto;
                background-color: $base-bg-color;
                border-radius: 16px;
                .c-dialog__msg{
                    padding: 40px;
                    text-align: center;
                    @include font(30px)
                }
                .c-dialog__button{
                    width: 100%;
                    padding: 20px;
                    text-align: center;
                    @include font(30px, #009AFF);
                    border: 0;
                    border-top: $base-border;
                    border-radius: 16px;
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                    background-color: $base-bg-color;
                }
            }
        }
        .c-dialog__mask{
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1000;
            height: 100%;
            background-color: rgba(0, 0, 0, .65);
        }
    }
</style>
