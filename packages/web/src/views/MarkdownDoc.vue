<template lang="pug">
.card(style="margin: 1rem")
  .card-content.content(v-html="html")
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import hljs from 'highlight.js'
import { MakeHtml } from '../assets/make-html'

@Component
export default class MarkdownDoc extends Vue {
  @Prop({ required: true }) getMd!: () => Promise<string>
  html = ''
  makeHtml = new MakeHtml()

  created () {
    this.parse()
  }

  @Watch('getMd')
  async parse () {
    this.html = await this.makeHtml.parse(await this.getMd())
    this.$nextTick(() => {
      this.$el.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block)
      })
    })
  }
}
</script>
