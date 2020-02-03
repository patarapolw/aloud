<template lang="pug">
article.media
  figure.media-left
    p.image.is-96x96(style="margin-top: 1rem;")
      b-tooltip(v-if="user" label="Click to logout" position="is-right")
        img.is-rounded.cursor-pointer(:src="user.picture" :alt="user.given_name"
          @click="doLogout" role="button")
      b-tooltip(v-else label="Click to login" position="is-right")
        img.is-rounded.cursor-pointer(src="https://imgplaceholder.com/96x96/cccccc/757575/fa-user"
          @click="doLogin" role="button")
  .media-content
    .toggleable-editor-main
      client-only
        simple-mde(
          :id="id"
          v-model="currentValue"
          ref="mde"
          :disabled="!user"
          disabled-html="Please login to comment.")
    .buttons(style="margin-left: 1rem;")
        b-button.is-success(:disabled="!user || !currentValue" @click="currentValue = ''") Post Comment
</template>

<script>
import SimpleMde from './SimpleMde'

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
    }
  },
  data () {
    return {
      user: this.$store.state.auth.user,
      currentValue: this.value
    }
  },
  methods: {
    async doLogin () {
      this.user = await this.$store.dispatch('auth/login')
    },
    async doLogout () {
      await this.$store.dispatch('auth/logout')
      this.user = null
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
