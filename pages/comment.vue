<template lang="pug">
.container(style="margin-bottom: 50px;")
  MainEditor(@post="onPost" @render="onRender")
  Entry(v-for="it in entries" :key="it._id" :entry="it"
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
      hasMore: false
    }
  },
  computed: {
    root () {
      return process.client ? frameElement : null
    },
    axios () {
      return this.$store.getters['auth/axios']
    }
  },
  created () {
    if (this.root) {
      this.root.style = css`
        max-width: 90vw;
      `
    }
    this.$store.commit('auth/addPath', this.$route.query.path)
    this.fetchEntries()
  },
  mounted () {
    if (this.root) {
      window.addEventListener('scroll', () => {
        this.setHeight()
      })
      this.setHeight()

      const axios = this.axios.interceptors.response.use((config) => {
        this.root.removeAttribute('data-error')
        return config
      }, (err) => {
        this.root.setAttribute('data-error', err)
        console.error(err)
        return err
      })
    }
  },
  methods: {
    async fetchEntries ({ reset } = {}) {
      if (process.client) {
        let result = null
        try {
          const r = await this.axios.get('/api/post/', {
            params: {
              offset: reset ? 0 : this.entries.length
            }
          })
          result = r.data
        } catch (e) {
          console.error(e)
          return
        }

        this.entries = reset ? result.data : [...this.entries, ...result.data]
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
      await this.fetchEntries({ reset: true })
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
.image.avatar {
  height: auto;
  width: 96px;

  @media screen and (max-width: 600px) {
    width: 15vw;
  }
}
</style>
