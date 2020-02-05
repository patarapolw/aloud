<template lang="pug">
.container(style="margin-bottom: 50px;")
  MainEditor(:id="id" @post="onPost" :reply-to="replyTo"
    @render="onRender")
  Entry(v-for="it in entries" :key="it._id" :entry="it" :path="id"
    @render="onRender" @delete="onDelete(it._id)")
</template>

<script>
import { lit as css } from '@/assets/utils'
import MainEditor from '@/components/MainEditor'
import Entry from '@/components/Entry'

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
    MainEditor,
    Entry
  },
  data () {
    return {
      entries: [],
      hasMore: false,
      replyTo: ''
    }
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
      `
    }
    this.fetchEntries()
  },
  methods: {
    async fetchEntries () {
      if (this.$store.state.auth.token && process.client) {
        const result = await this.$axios.$get('/api/post/', {
          params: { path: this.id, offset: this.entries.length }
        })

        this.entries = [...this.entries, ...result.data]
        this.$set(this, 'entries', this.entries)

        if (this.entries.length < result.count) {
          this.hasMore = true
        } else {
          this.hasMore = false
        }
        this.setHeight()
      }
    },
    async onPost () {
      this.$set(this, 'entries', [])
      await this.fetchEntries()
    },
    onRender () {
      this.setHeight()
    },
    setHeight () {
      this.$nextTick(() => {
        if (this.root) {
          this.root.style.height = `${this.$el.scrollHeight + 100}px`
        }
      })
    },
    onDelete (id) {
      this.$set(this, 'entries', this.entries.filter(el => el._id !== id))
      this.setHeight()
    }
  }
}
</script>

<style lang="scss">
textarea {
  font-family: 'Courier New', Courier, monospace;
}
</style>
