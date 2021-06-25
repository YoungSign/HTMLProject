<template>
  <div class="uploading-chunk" :class="{pending: status == 'pending', reading: status == 'reading', uploading: status == 'uploading', success: status == 'success', error: status == 'error'}"></div>
</template>

<script>
export default {
  name: 'Testupload',
  props: {
    chunk: Object
  },
  computed: {
    status: function () {
      return this.chunk.status()
    }
  }
}
</script>

<style scoped>
  .uploading-chunk {
      width: 100%;
      height: 100%;
  }
  .uploading-chunk.pending {
      background: gray;
  }
  .uploading-chunk.reading {
      background: blue;
  }
  .uploading-chunk.uploading {
      background: yellow;
  }
  .uploading-chunk.success {
      background: green;
  }
  .uploading-chunk.error {
      background: red;
  }
</style>
