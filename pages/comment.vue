<template lang="pug">
.container(style="margin-bottom: 50px;")
  MainEditor(@post="onPost" @render="onRender")
  Entry(v-for="it in entries" :key="it.id" :entry="it" :source="null" :depth="0"
    @render="onRender" @delete="onDelete(it)")
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import MainEditor from '@/components/MainEditor.vue'
import Entry from '@/components/Entry.vue'
import { IEntry, g, StitchOp } from '@/assets/schema'

@Component({
  components: {
    MainEditor,
    Entry
  },
  head() {
    return {
      link: [
        {
          rel: 'stylesheet',
          href:
            '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/default.min.css'
        }
      ],
      script: [
        {
          src:
            '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js',
          async: true
        }
      ]
    }
  }
})
export default class Comment extends Vue {
  entries: IEntry[] = []
  hasMore = false
  stitch = g.stitch

  get root() {
    return process.client ? (frameElement as HTMLIFrameElement) : null
  }

  async created() {
    this.$fireAuth.onAuthStateChanged((user) => {
      this.$store.commit('setUser', user)
    })

    if (this.root) {
      this.root.style.maxWidth = '90vw'
    }

    if (process.client) {
      g.stitch = new StitchOp(this)
      await g.stitch!.login()

      this.fetchEntries()
    }
  }

  mounted() {
    if (this.root) {
      window.addEventListener('scroll', () => {
        this.setHeight()
      })
      this.setHeight()
    }
  }

  async fetchEntries() {
    const r = await g.stitch!.read(null, this.entries)
    this.$set(this, 'entries', r.data)
    if (this.entries.length < r.count) {
      this.hasMore = true
    } else {
      this.hasMore = false
    }
    this.setHeight()
  }

  async onPost() {
    this.entries = []
    await this.fetchEntries()
  }

  onRender() {
    this.setHeight()
  }

  setHeight() {
    this.$nextTick(() => {
      if (this.root) {
        this.root.style.height = `${this.$el.scrollHeight + 100}px`
      }
    })
  }

  async onDelete(entry: IEntry) {
    await g.stitch!.delete(entry)
    this.entries = []
    await this.fetchEntries()
  }
}
</script>

<style lang="scss">
.image.avatar {
  height: auto;
  width: 96px;
  @media screen and (max-width: 600px) {
    width: 15vw;
  }
}
</style>
