<template lang="pug">
article.media
  figure.media-left(style="text-align: center;")
    p.image.is-96x96(style="margin-top: 1rem;")
      b-tooltip(v-if="user" :label="'Logged in as ' + user.nickname + '. Click to logout'" position="is-right")
        img.is-rounded.cursor-pointer(:src="getGravatarUrl(user.email)" :alt="user.given_name"
          @click="doLogout" role="button")
      b-tooltip(v-else label="Click to login" position="is-right")
        img.is-rounded.cursor-pointer(:src="getGravatarUrl()"
          @click="doLogin" role="button")
  .media-content
    .toggleable-editor-main
      client-only
        simple-mde(
          :id="id"
          v-model="currentValue"
          :disabled="!user"
          disabled-html="Please login to comment.")
    .buttons(style="margin-left: 1rem;")
        b-button.is-success(:disabled="!user || !currentValue" @click="doPost") Post Comment
</template>

<script>
import SimpleMde from './SimpleMde'
import { getGravatarUrl } from '@/assets/utils'

export default {
  components: {
    SimpleMde
  },
  props: {
    id: {
      default: '',
      type: String
    },
    value: {
      default: '',
      type: String
    },
    replyTo: {
      default: '',
      type: String
    }
  },
  data () {
    return {
      user: this.$store.state.auth.user,
      currentValue: this.value,
      getGravatarUrl
    }
  },
  watch: {
    replyTo (v) {
      this.currentValue = v ? `> Replying to @${v}\n` : ''
    }
  },
  methods: {
    async doLogin () {
      this.user = await this.$store.dispatch('auth/login')
    },
    async doLogout () {
      await this.$store.dispatch('auth/logout')
      this.user = null
    },
    async doPost () {
      const r = await this.$axios.$put('/api/post/', { path: this.id, content: this.currentValue })
      this.currentValue = ''
      this.$emit('post')
    }
  }
}
</script>

<style lang="scss">
.preview {
  background-color: #fcf2d4;
}

.toggleable-editor-main {
  margin: 10px;
  height: 200px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
