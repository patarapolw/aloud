<template lang="pug">
.container
  MainEditor(:id="id")
</template>

<script>
import { lit as css } from '@/assets/utils'
import MainEditor from '@/components/MainEditor'

export default {
  layout: 'empty',
  head: {
    link: [
      { rel: 'stylesheet', href: '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/default.min.css' }
    ],
    script: [
      { src: '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js', async: true }
    ]
  },
  components: {
    MainEditor
  },
  computed: {
    root () {
      return process.client ? frameElement : null
    },
    id () {
      return this.$route.query.id
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
