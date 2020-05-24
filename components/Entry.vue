<template lang="pug">
section
  article.media(style="margin-top: 1rem;")
    figure.media-left(style="text-align: center;")
      p.image.avatar
        img.is-rounded(:src="getGravatarUrl(user.email)")
    .media-content(style="display: flex; flex-direction: column;")
      div(style="min-height: 50px; flex-grow: 1")
        .content(v-if="!modelIsEdit" v-html="html")
        client-only(v-else)
          SimpleMde.reply-editor(v-model="value" @init="$emit('render')")
      small
        span(v-if="entry")
          a(role="button" @click="toggleLike" v-if="isYours(entry)")
            | {{entry.like['thumb-up'].includes(user.email) ? 'Unlike' : 'Like'}}
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
      section(v-if="entry && depth < 2")
        Entry(v-if="hasReply" :source="id" :is-edit="true"
          @delete="hasReply = false" @render="$emit('render')" @post="onPost" :depth="depth + 1")
        Entry(v-for="it in subcomments" :key="it._id" :source="id"
            :entry="it" @render="$emit('render')" @delete="onDelete(it)" :depth="depth + 1")
  section(v-if="entry && depth >= 2")
    Entry(v-if="hasReply" :source="id" :is-edit="true"
        @delete="hasReply = false" @render="$emit('render')" @post="onPost" :depth="depth + 1")
    Entry(v-for="it in subcomments" :key="it._id" :source="id"
        :entry="it" @render="$emit('render')" @delete="onDelete(it)" :depth="depth + 1")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import humanizeDuration from 'humanize-duration'
import { User } from 'firebase/app'
import { MakeHtml } from '../assets/make-html'
import SimpleMde from './SimpleMde.vue'
import { getGravatarUrl } from '@/assets/util'
import { g, IEntry } from '@/assets/schema'

@Component({
  components: {
    SimpleMde
  }
})
export default class Entry extends Vue {
  @Prop() entry?: IEntry
  @Prop({ default: false }) isEdit!: boolean
  @Prop({ required: true }) source!: string | null
  @Prop({ required: true }) depth!: number

  makehtml: MakeHtml | null = null
  modelIsEdit = this.isEdit
  hasReply = false
  value = this.entry ? this.entry.content : ''
  subcomments: IEntry[] = []
  hasMore = false
  getGravatarUrl = getGravatarUrl
  html = ''

  get id() {
    return this.entry ? this.entry._id : null
  }

  get user() {
    return this.$store.state.user as User
  }

  get path() {
    return this.source && this.id ? `${this.source}/${this.id}` : this.id
  }

  get pastDuration() {
    return this.entry
      ? humanizeDuration(+new Date() - +new Date(this.entry.createdAt), {
          round: true,
          largest: 2
        })
      : ''
  }

  created() {
    this.makehtml = new MakeHtml(this.path || undefined)
    this.getHtml()
    if (this.entry) {
      this.fetchSubcomments()
    }
  }

  isYours(entry: IEntry) {
    return (
      entry &&
      this.user &&
      this.user.email &&
      this.user.email === (entry.createdBy || {}).email
    )
  }

  nickname(entry: IEntry) {
    return (
      (entry && entry.createdBy ? entry.createdBy.displayName : null) ||
      'Anonymous'
    )
  }

  async getHtml() {
    if (process.client && this.makehtml) {
      this.html = await this.makehtml.parse(this.value)
      this.$emit('render')
    }
  }

  async toggleLike() {
    if (!this.id || !this.entry || !g.stitch!.email) {
      return
    }

    if (this.entry.like['thumb-up'].includes(g.stitch!.email)) {
      this.entry.like['thumb-up'] = this.entry.like['thumb-up'].filter(
        (el: any) => el !== g.stitch!.email
      )
    } else {
      this.entry.like['thumb-up'].push(g.stitch!.email)
    }
    await g.stitch!.update(this.id, { like: this.entry.like })
    this.$set(this.entry, 'like', this.entry.like)
  }

  doReply() {
    this.hasReply = true
    this.$emit('render')
  }

  async toggleEdit() {
    if (this.modelIsEdit) {
      if (this.id) {
        await g.stitch!.update(this.id, { content: this.value })
      } else {
        await g.stitch!.create({
          content: this.value,
          path: this.path,
          like: {
            'thumb-up': []
          }
        })
        this.$emit('render')
      }

      await this.getHtml()
    }

    this.modelIsEdit = !this.modelIsEdit
  }

  async doDelete() {
    if (!this.entry) {
      return
    }

    await g.stitch!.delete(this.entry)
    this.$emit('delete')
  }

  async fetchSubcomments() {
    if (!this.entry) {
      return
    }

    const r = await g.stitch!.read(this.id, this.subcomments)
    this.subcomments = r.data

    if (this.subcomments.length < r.count) {
      this.hasMore = true
    } else {
      this.hasMore = false
    }
    this.$emit('render')
  }

  async onPost() {
    this.$set(this, 'subcomments', [])
    await this.fetchSubcomments()
  }

  onDelete(entry: IEntry) {
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
