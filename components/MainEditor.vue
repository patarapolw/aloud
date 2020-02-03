<template lang="pug">
section
  b-field(:label="label")
  .card.toggleable-editor-main
    .card-content(v-show="!isPreview && user")
      client-only
        codemirror(
          v-model="currentValue"
          :options="{ readOnly: !user, ...cmOptions }"
          @ready="$event.setSize('100%', '100%')")
    .card-content.preview(v-if="isPreview || !user")
      .content(v-html="!user ? 'Please login to comment...' : makeHtml(currentValue)")
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
import { MakeHtml } from '@/assets/make-html'
import { cmOptions } from '@/assets/codemirror'

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
      currentValue: this.value,
      cmOptions
    }
  },
  methods: {
    /**
     * @returns {string}
     */
    makeHtml (s) {
      const makeHtml = new MakeHtml()
      return makeHtml.parse(s)
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

<style lang="scss">
.preview {
  background-color: #fcf2d4;
}

.toggleable-editor-main {
  margin: 10px;
  height: 200px;

  & > *, .vue-codemirror {
    height: 100%;
  }
}
</style>
