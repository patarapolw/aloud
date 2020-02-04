<template lang="pug">
article.media
  figure.media-left(style="text-align: center;")
    p.is-96x96
      img.is-rounded(:src="getGravatarUrl(entry.user.email)" style="border-radius: 50%;")
  .media-content(style="display: flex; flex-direction: column;")
    div(style="min-height: 100px; flex-grow: 1")
      .content(v-if="!isEdit" v-html="html")
      textarea(v-else v-model="value" style="width: 100%; height: 100px;")
    small
      a(@click="doLike") Like
      span {{' · '}}
      a(@click="doReply") Reply
      span(v-if="entry.user.email === $store.state.auth.user.email") {{' · '}}
      a(v-if="entry.user.email === $store.state.auth.user.email" @click="toggleEdit") {{isEdit ? 'Apply' : 'Edit'}}
      span(v-if="entry.user.email === $store.state.auth.user.email") {{' · '}}
      a(v-if="entry.user.email === $store.state.auth.user.email" @click="doDelete") Delete
      span {{' · '}}
      span Posted by {{entry.user.nickname}}
      span {{' · '}}
      span {{ pastDuration }} ago
</template>

<script>
import humanizeDuration from 'humanize-duration'

import { getGravatarUrl } from '@/assets/utils'
import { MakeHtml } from '@/assets/make-html'

export default {
  props: {
    entry: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      getGravatarUrl,
      makehtml: null,
      likes: this.entry.like,
      isEdit: false,
      value: this.entry.content
    }
  },
  computed: {
    pastDuration () {
      return humanizeDuration((+new Date()) - (+new Date(this.entry.createdAt)), { maxDecimalPoints: 0 })
    },
    html () {
      return (process.client && this.makehtml)
        ? this.makehtml.parse(this.entry.content)
        : ''
    }
  },
  created () {
    this.makehtml = new MakeHtml(this.entry._id)
  },
  methods: {
    async doLike () {
      await this.$axios.$put(`/api/post/${this.entry._id}/like`)
      this.likes++
    },
    doReply () {
      this.$emit('reply', this.entry._id)
    },
    toggleEdit () {
      this.isEdit = !this.isEdit
    },
    async doDelete () {
      await this.$axios.$delete(`/api/post/${this.entry._id}`)
      this.$el.style.display = 'none'
    }
  }
}
</script>
