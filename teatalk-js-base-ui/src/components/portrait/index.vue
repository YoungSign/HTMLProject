<template>
    <div class="c-portrait">
        <img :src="imgList[0]">
    </div>
</template>

<script>
import avatarDefault from '../../assets/imgs/avatar_default.jpg'
export default {
  name: 'xm-portrait',
  props: {
    imgList: {
      type: Array,
      default: () => {
        return [avatarDefault]
      }
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
    .c-portrait{
        width: 100%;
        height: 100%;
        img{
            width: 100%;
            height: 100%;
        }
    }
</style>
