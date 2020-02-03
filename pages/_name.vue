<template lang="pug">
.card(style="margin: 1rem")
  .card-content.content(v-html="html")
</template>

<script>
import { MakeHtml } from '@/assets/make-html'

const makeHtml = new MakeHtml()

export default {
  async asyncData ({ error, params }) {
    try {
      return {
        raw: require(`@/docs/${params.name}.md`),
        html: ''
      }
    } catch (e) {
      return error({ statusCode: 404, message: e.message })
    }
  },
  created () {
    this.parse()
  },
  methods: {
    parse () {
      if (process.client) {
        this.html = makeHtml.parse(this.raw)
        this.$nextTick(() => {
          this.$el.querySelectorAll('pre code').forEach((block) => {
            window.hljs.highlightBlock(block)
          })
        })
      }
    }
  }
}
</script>
