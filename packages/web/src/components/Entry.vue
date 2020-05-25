<template lang="pug">
section
  article.media(style="margin-top: 1rem;")
    figure.media-left(style="text-align: center;")
      p.image.avatar
        img.is-rounded(:src="(entry && entry.createdBy) ? getGravatarUrl(entry.createdBy.email) : getGravatarUrl()")
    .media-content(style="display: flex; flex-direction: column;")
      div(style="min-height: 50px; flex-grow: 1")
        .content(v-if="!modelIsEdit" v-html="html")
        SimpleMde.reply-editor(v-else v-model="value" @init="$emit('render')")
      small
        span(v-if="entry")
          a(role="button" @click="toggleLike" v-if="isYours(entry)")
            | {{entry.like['thumb-up'].includes(email) ? 'Unlike' : 'Like'}}
          span(v-if="entry.like['thumb-up'].length > 0")
            b-icon(icon="thumb-up-outline" size="is-small" style="margin-left: 0.5rem;")
            span {{entry.like['thumb-up'].length}}
          span(v-if="user || entry.like['thumb-up']") {{' · '}}
        span(v-if="entry && user")
          a(role="button" @click="doReply") Reply
          span {{' · '}}
        span(v-if="!entry || (entry && isYours(entry))")
          a(role="button" @click="toggleEdit") {{modelIsEdit ? 'Post' : 'Edit'}}
          span {{' · '}}
        span(v-if="!entry || (entry && isYours(entry))")
          a(role="button" @click="doDelete") Delete
          span {{' · '}}
        span(v-if="entry")
          span Posted by {{nickname(entry) || 'Anonymous'}}
          span {{' · '}}
          span {{ pastDuration }} ago
      section(v-if="entry && depth < 3")
        Entry(v-if="hasReply" :source="path" :is-edit="true"
          @delete="hasReply = false" @render="$emit('render')" @post="onPost")
        Entry(v-for="it in subcomments" :key="it._id" :source="path"
            :entry="it" @render="$emit('render')" @delete="onDelete(it)")
  section(v-if="entry && depth >= 3")
    Entry(v-if="hasReply" :source="path" :is-edit="true"
        @delete="hasReply = false" @render="$emit('render')" @post="onPost")
    Entry(v-for="it in subcomments" :key="it._id" :source="path"
        :entry="it" @render="$emit('render')" @delete="onDelete(it)")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import humanizeDuration from 'humanize-duration'
import { User } from 'firebase/app'
import { MakeHtml } from '../assets/make-html'
import SimpleMde from './SimpleMde.vue'
import { getGravatarUrl } from '../assets/util'
import { AxiosInstance } from 'axios'

@Component({
  components: {
    SimpleMde
  }
})
export default class Entry extends Vue {
  @Prop() entry?: any
  @Prop({ default: false }) isEdit!: boolean
  @Prop({ required: true }) source!: string
  makehtml: MakeHtml | null = null
  modelIsEdit = this.isEdit
  hasReply = false
  value = this.entry ? this.entry.content : ''
  subcomments: any[] = []
  hasMore = false
  getGravatarUrl = getGravatarUrl
  html = ''

  get id () {
    return this.entry ? this.entry._id : null
  }

  get user () {
    return this.$store.state.user as User | null
  }

  get email () {
    return this.user ? this.user.email : null
  }

  get depth () {
    return this.source ? this.source.split('/').length : 0
  }

  get path () {
    return `${this.source}/${this.id}`
  }

  get pastDuration () {
    return this.entry
      ? humanizeDuration(+new Date() - +new Date(this.entry.createdAt), {
        round: true,
        largest: 2
      })
      : ''
  }

  created () {
    this.makehtml = new MakeHtml(this.source)
    this.getHtml()
    if (this.entry) {
      this.fetchSubcomments()
    }
  }

  async getApi () {
    return await this.$store.dispatch('getApi', this.$route.query.url) as AxiosInstance
  }

  isYours (entry: any) {
    return !!entry && this.email === (entry.createdBy || {}).email
  }

  nickname (entry: any) {
    return (
      (entry && entry.createdBy ? entry.createdBy.displayName : null) ||
      'Anonymous'
    )
  }

  async getHtml () {
    if (this.makehtml) {
      this.html = await this.makehtml.parse(this.value)
      this.$emit('render')
    }
  }

  async toggleLike () {
    if (!this.id || !this.entry || !this.$store.state.email) {
      return
    }
    if (this.entry.like['thumb-up'].includes(this.$store.state.email)) {
      this.entry.like['thumb-up'] = this.entry.like['thumb-up'].filter(
        (el: any) => el !== this.$store.state.email
      )
    } else {
      this.entry.like['thumb-up'].push(this.$store.state.email)
    }

    const api = await this.getApi()
    await api.patch('/api/comment/', { like: this.entry.like }, {
      params: {
        id: this.id
      }
    })
    this.$set(this.entry, 'like', this.entry.like)
  }

  doReply () {
    this.hasReply = true
    this.$emit('render')
  }

  async toggleEdit () {
    if (this.modelIsEdit) {
      const api = await this.getApi()
      if (this.id) {
        await api.patch('/api/comment/', { comment: this.value }, {
          params: {
            id: this.id
          }
        })

        await this.getHtml()
        this.$emit('render')
      } else {
        await api.put('/api/comment/', {
          content: this.value,
          path: this.source
        })
        this.$emit('post')
        this.doDelete()
      }
    }
    this.modelIsEdit = !this.modelIsEdit
  }

  async doDelete () {
    if (!this.entry) {
      this.$emit('delete')
    } else {
      const api = await this.getApi()
      await api.delete('/api/comment/', {
        params: {
          id: this.entry._id,
          path: this.entry.path
        }
      })
      this.$emit('delete')
    }
  }

  async fetchSubcomments (opts: any = {}) {
    if (!this.entry) {
      return
    }

    const api = await this.getApi()
    const r = (await api.get('/api/comment/', {
      params: {
        path: this.path,
        offset: opts.reset ? 0 : this.subcomments.length
      }
    })).data

    this.subcomments = r.data
    if (this.subcomments.length < r.count) {
      this.hasMore = true
    } else {
      this.hasMore = false
    }
    this.$emit('render')
  }

  async onPost () {
    await this.fetchSubcomments({ reset: true })
  }

  onDelete (entry: any) {
    this.$set(
      this,
      'subcomments',
      this.subcomments.filter((el) => el._id !== entry._id)
    )
    this.$emit('render')
  }
}
</script>

<style lang="scss">
.reply-editor {
  margin: 10px;
  height: 200px;
  @media screen and (max-width: 600px) {
    height: 250px;
  }
}
</style>
