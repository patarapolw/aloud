<template lang="pug">
.container(style="margin-bottom: 50px;")
  MainEditor(@post="onPost" @render="onRender")
  Entry(v-for="it in entries" :key="it.id" :entry="it" source="_root" :depth="0"
    @render="onRender" @delete="onDelete(it)")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import MainEditor from '@/components/MainEditor.vue'
import Entry from '@/components/Entry.vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { AxiosInstance } from 'axios'

@Component({
  components: {
    MainEditor,
    Entry
  }
})
export default class Comment extends Vue {
  entries: any[] = []
  hasMore = false

  get root () {
    return window.frameElement as HTMLIFrameElement
  }

  created () {
    firebase.auth().onAuthStateChanged((user) => {
      this.$store.commit('setUser', user)
    })

    if (this.root) {
      this.root.style.maxWidth = '90vw'
    }
  }

  mounted () {
    if (this.root) {
      window.addEventListener('scroll', () => {
        this.setHeight()
      })
      this.setHeight()
    }

    this.fetchEntries()
  }

  async getApi () {
    return await this.$store.dispatch('getApi', this.$route.query.url) as AxiosInstance
  }

  async fetchEntries (opts: any = {}) {
    const api = await this.getApi()
    const r = (await api.get('/api/comment/', {
      params: {
        path: '_root',
        offset: (opts.reset ? [] : this.entries).length
      }
    })).data

    this.$set(this, 'entries', opts.reset ? r.data : [...this.entries, ...r.data])
    if (this.entries.length < r.count) {
      this.hasMore = true
    } else {
      this.hasMore = false
    }
    this.setHeight()
  }

  async onPost () {
    await this.fetchEntries({ reset: true })
  }

  onRender () {
    this.setHeight()
  }

  setHeight () {
    this.$nextTick(() => {
      if (this.root) {
        this.root.style.height = `${this.$el.scrollHeight + 100}px`
      }
    })
  }

  async onDelete (entry: any) {
    const api = await this.getApi()
    await api.delete('/api/comment/', {
      params: {
        id: entry._id,
        path: entry.path
      }
    })
    await this.fetchEntries({ reset: true })
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
