<template lang="pug">
section
  article.media(style="margin-top: 1rem;")
    figure.media-left(style="text-align: center;")
      p.is-96x96
        img.is-rounded(:src="getGravatarUrl(user.email)" style="border-radius: 50%;")
    .media-content(style="display: flex; flex-direction: column;")
      div(style="min-height: 100px; flex-grow: 1")
        .content(v-if="!modelIsEdit" v-html="html")
        client-only(v-else)
          simple-mde(v-model="value" style="height: 200px;" @init="$emit('render')" :id="id")
      small
        a(@click="doLike" v-if="user.email !== $store.state.auth.user.email") Like
        span(v-if="user.email !== $store.state.auth.user.email") {{' · '}}
        a(@click="doReply" v-if="id") Reply
        span(v-if="id") {{' · '}}
        a(v-if="user.email === $store.state.auth.user.email" @click="toggleEdit") {{modelIsEdit ? 'Post' : 'Edit'}}
        span(v-if="user.email === $store.state.auth.user.email") {{' · '}}
        a(v-if="user.email === $store.state.auth.user.email" @click="doDelete") Delete
        span(v-if="user.email === $store.state.auth.user.email") {{' · '}}
        span Posted by {{user.nickname}}
        span {{' · '}}
        span {{ pastDuration }} ago
      section(v-if="replyDepth < 3")
        Entry(v-if="hasReply" :reply-to="replyPath" is-edit :path="path"
          @delete="hasReply = false" @render="$emit('render')" @post="onPost")
        Entry(v-for="it in subcomments" :key="it._id" :reply-to="replyPath" :path="path"
            :entry="it" @render="$emit('render')" @delete="onDelete(it._id)")
  section(v-if="replyDepth >= 3")
    Entry(v-if="hasReply" :reply-to="replyPath" is-edit :path="path"
        @delete="hasReply = false" @render="$emit('render')" @post="onPost")
    Entry(v-for="it in subcomments" :key="it._id" :reply-to="replyPath" :path="path"
        :entry="it" @render="$emit('render')" @delete="onDelete(it._id)")
</template>

<script>
import humanizeDuration from 'humanize-duration'

import SimpleMde from './SimpleMde'
import { getGravatarUrl } from '@/assets/utils'
import { MakeHtml } from '@/assets/make-html'

export default {
  name: 'Entry',
  components: {
    SimpleMde
  },
  props: {
    entry: {
      type: Object,
      default: () => ({})
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    replyTo: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      getGravatarUrl,
      makehtml: null,
      likes: this.entry.like || {},
      modelIsEdit: this.isEdit,
      hasReply: false,
      value: this.entry.content || '',
      subcomments: [],
      hasMore: false
    }
  },
  computed: {
    id () {
      return this.entry._id
    },
    replyPath () {
      return this.replyTo ? `${this.replyTo}/${this.id}` : this.id
    },
    replyDepth () {
      return this.replyPath.split('/').length
    },
    pastDuration () {
      return humanizeDuration((+new Date()) - (+new Date(this.entry.createdAt)), { maxDecimalPoints: 0 })
    },
    html () {
      this.$nextTick(() => {
        this.$emit('render')
      })

      return (process.client && this.makehtml)
        ? this.makehtml.parse(this.value)
        : ''
    },
    user () {
      return this.entry.user ? this.entry.user
        : this.replyTo
          ? (this.$store.state.auth.user || {})
          : {}
    }
  },
  created () {
    this.makehtml = new MakeHtml(this.id || `reply-${this.replyTo}`)
    if (this.id) {
      this.fetchSubcomments()
    }
  },
  methods: {
    async doLike () {
      if (this.id) {
        await this.$axios.$put(`/api/post/${this.id}/like`)
        this.$set(this.like, 'default', this.like.default || 0)
        this.$nextTick(() => {
          this.like.default++
        })
      }
    },
    doReply () {
      this.hasReply = true
      this.$emit('render')
    },
    async toggleEdit () {
      if (this.modelIsEdit) {
        if (this.id) {
          await this.$axios.$post(`/api/post/${this.id}`, { content: this.value })
        } else {
          await this.$axios.$put(`/api/post/`, {
            path: this.path,
            content: this.value,
            replyTo: this.replyTo
          })
          this.$emit('post')
          this.$emit('delete')
          return
        }
      }
      this.modelIsEdit = !this.modelIsEdit
    },
    async doDelete () {
      if (this.id) {
        await this.$axios.$delete(`/api/post/${this.id}`)
      }
      this.$emit('delete')
    },
    async fetchSubcomments () {
      if (this.$store.state.auth.token && process.client) {
        const result = await this.$axios.$get('/api/post/', {
          params: {
            path: this.path,
            offset: this.subcomments.length,
            replyTo: this.replyPath
          }
        })

        this.subcomments = [...this.subcomments, ...result.data]
        this.$set(this, 'subcomments', this.subcomments)

        if (this.subcomments.length < result.count) {
          this.hasMore = true
        } else {
          this.hasMore = false
        }
        this.$emit('render')
      }
    },
    async onPost () {
      this.$set(this, 'subcomments', [])
      await this.fetchSubcomments()
    },
    onDelete (id) {
      this.$set(this, 'subcomments', this.subcomments.filter(el => el._id !== id))
      this.$emit('render')
    }
  }
}
</script>
