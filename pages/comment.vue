<template lang="pug">
.container
  MainEditor(label="Comment")
</template>

<script>
import { lit as css } from '@/assets/utils'
import MainEditor from '@/components/MainEditor'

export default {
  layout: 'empty',
  components: {
    MainEditor
  },
  computed: {
    root () {
      return process.client ? frameElement : null
    }
  },
  created () {
    if (this.root) {
      this.root.style = css`
        min-width: 500px;
        max-width: 90vw;
        min-height: 50vh;
      `
    }
  }
}
</script>

<style lang="scss">
textarea {
  font-family: 'Courier New', Courier, monospace;
}
</style>
