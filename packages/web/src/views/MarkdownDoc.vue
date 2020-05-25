<template lang="pug">
.card(style="margin: 1rem")
  .card-content.content(v-html="html")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { MakeHtml } from '../assets/make-html'

@Component
export default class PageReadme extends Vue {
  @Prop({ required: true }) raw!: string
  html = ''
  makeHtml = new MakeHtml()

  created () {
    this.parse()
  }

  async parse () {
    this.html = await this.makeHtml.parse(this.raw)
    this.$nextTick(() => {
      this.$el.querySelectorAll('pre code').forEach((block) => {
        window.hljs.highlightBlock(block)
      })
    })
  }
}
</script>
