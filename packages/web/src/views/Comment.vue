<template lang="pug">
.container(style="margin-bottom: 50px;")
  MainEditor(@post="onPost" @render="onRender")
  Entry(v-for="it in entries" :key="it.id + Math.random().toString(36)" :entry="it" source="_root" :depth="0"
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

  get parent () {
    return window.parent.window === window ? null : window.parent.window
  }

  created () {
    firebase.auth().onAuthStateChanged((user) => {
      this.$store.commit('setUser', user)
    })
  }

  mounted () {
    window.addEventListener('scroll', () => {
      this.setHeight()
    })
    this.setHeight()

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
      if (this.parent) {
        this.parent.postMessage({
          scrollHeight: this.$el.scrollHeight + 100
        }, this.parent.origin)
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
