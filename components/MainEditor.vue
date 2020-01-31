<template lang="pug">
section
  b-field(:label="label")
    b-input(v-if="!isPreview" :disabled="!user" type="textarea" v-model="currentValue"
      :placeholder="!user ? 'Please login to comment' : 'Type in here. Markdown is supported.'")
    .card(v-else)
      .card-content
        .content(v-html="makeHtml(currentValue)")
  .buttons
    b-tooltip(v-if="!user" label="Login to comment" position="is-right")
      b-button.is-white(@click="doLogin")
        b-icon(icon="account")
    b-tooltip(v-else label="Click to logout" position="is-right")
      b-button.is-white(@click="doLogout")
        b-icon(icon="lock-outline")
    b-tooltip(label="Not displaying as expected? See Markdown tutorial" position="is-right")
      b-button.is-white
        b-icon(icon="information-outline")
    div(style="flex-grow: 1;")
    b-button.is-success(:disabled="!user || !currentValue") Send
    b-button.is-warning(:disabled="!user" @click="isPreview = !isPreview") {{ isPreview ? 'Edit' : 'Preview' }}
    b-button(:disabled="!currentValue" @click="currentValue = ''") Reset
</template>

<script>
import showdown from 'showdown'

const mdConverter = new showdown.Converter()
mdConverter.setFlavor('github')

export default {
  props: {
    label: {
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
      isPreview: false,
      currentValue: this.value
    }
  },
  methods: {
    /**
     * @returns {string}
     */
    makeHtml (s) {
      return mdConverter.makeHtml(s)
    },
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
