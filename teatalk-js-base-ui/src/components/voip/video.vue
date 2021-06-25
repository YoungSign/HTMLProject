<template>
    <video autoplay :muted="muted" playsinline ref="video"></video>
</template>

<script>

export default {
  name: 'xm-voip-video',
  props: {
    stream: {
      type: MediaStream,
      default: null
    },
    muted: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    this.setStream()
  },
  watch: {
    stream () {
      this.setStream()
    }
  },

  methods: {
    setStream () {
      if (this.$refs.video) {
        this.$refs.video.srcObject = this.stream
      }
    }
  }

}
</script>
