<template lang="pug">
section
  article.media(style="margin-top: 1rem;")
    figure.media-left(style="text-align: center;")
      p.image.avatar
        img.is-rounded(:src="getGravatarUrl(user.email)")
    .media-content(style="display: flex; flex-direction: column;")
      div(style="flex-grow: 1")
        .content(v-if="!modelIsEdit" v-html="html")
        client-only(v-else)
          simple-mde.reply-editor(v-model="value" @init="$emit('render')" :id="id")
      small
        span(v-if="isAuthorized && id")
          span(:key="likeKey")
            a(role="button" @click="toggleLike")
              | {{like['thumb-up'] && like['thumb-up'].includes(user.email) ? 'Unlike' : 'Like'}}
            span(v-if="like['thumb-up'] && like['thumb-up'].length > 0")
              b-icon(icon="thumb-up-outline" size="is-small" style="margin-left: 0.5rem;")
              span {{like['thumb-up'].length}}
            span {{' · '}}
          a(role="button" @click="doReply") Reply
          span {{' · '}}
        span(v-if="isAuthorized && isYou")
          a(role="button" @click="toggleEdit") {{modelIsEdit ? 'Post' : 'Edit'}}
          span {{' · '}}
        span(v-if="isAuthorized && isYou")
          a(role="button" @click="doDelete") Delete
          span {{' · '}}
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
    const like = this.entry.like || {}
    return {
      getGravatarUrl,
      makehtml: null,
      like,
      modelIsEdit: this.isEdit,
      hasReply: false,
      value: this.entry.content || '',
      subcomments: [],
      hasMore: false,
      likeKey: JSON.stringify(like['thumb-up'])
    }
  },
  computed: {
    isAuthorized () {
      return !!this.$store.state.auth.user
    },
    isYou () {
      return this.user.email === this.authUser.email
    },
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
          ? this.authUser
          : {}
    },
    authUser () {
      return this.$store.state.auth.user || {}
    }
  },
  created () {
    this.makehtml = new MakeHtml(this.id || `reply-${this.replyTo}`)
    if (this.id) {
      this.fetchSubcomments()
    }
  },
  methods: {
    async toggleLike () {
      if (this.id) {
        if (this.like['thumb-up'] && this.like['thumb-up'].includes(this.user.email)) {
          this.like['thumb-up'] = this.like['thumb-up'].filter(el => el !== this.user.email)

          await this.$axios.$post(`/api/post/${this.id}/setLike`, {
            path: this.path,
            like: this.like
          })
        } else {
          this.like['thumb-up'] = this.like['thumb-up'] || []
          this.like['thumb-up'].push(this.user.email)

          await this.$axios.$post(`/api/post/${this.id}/setLike`, {
            path: this.path,
            like: this.like
          })
        }
        this.$set(this.like, 'thumb-up', this.like['thumb-up'])
        this.likeKey = JSON.stringify(this.like['thumb-up'])
      }
    },
    doReply () {
      this.hasReply = true
      this.$emit('render')
    },
    async toggleEdit () {
      if (this.modelIsEdit) {
        if (this.id) {
          await this.$axios.$post(`/api/post/${this.id}`, { content: this.value, path: this.path })
        } else {
          await this.$axios.$put(`/api/post/`, {
            path: this.path,
            content: this.value,
            replyTo: this.replyTo
          })
          this.$emit('post')
          this.$emit('delete')
          this.$emit('render')
          return
        }
      }
      this.modelIsEdit = !this.modelIsEdit
    },
    async doDelete () {
      if (this.id) {
        await this.$axios.$delete(`/api/post/${this.id}`, {
          params: { path: this.path }
        })
      }
      this.$emit('delete')
    },
    async fetchSubcomments ({ reset } = {}) {
      if (this.$store.state.auth.token && process.client) {
        const result = await this.$axios.$get('/api/post/', {
          params: {
            path: this.path,
            offset: this.subcomments.length,
            replyTo: this.replyPath
          }
        })

        this.subcomments = reset ? result.data : [...this.subcomments, ...result.data]
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
      await this.fetchSubcomments({ reset: true })
    },
    onDelete (id) {
      this.$set(this, 'subcomments', this.subcomments.filter(el => el._id !== id))
      this.$emit('render')
    }
  }
}
</script>

<style lang="scss">
.reply-editor {
  margin: 10px;
  height: 200px;

  @media screen and (max-width: 600px) {
    height: 300px;
  }
}
</style>
