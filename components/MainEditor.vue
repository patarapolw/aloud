<template lang="pug">
section
  b-field(:label="label")
    b-input(v-if="!isPreview" :disabled="!isLoggedIn" type="textarea" v-model="currentValue"
      :placeholder="!isLoggedIn ? 'Please login to comment' : 'Type in here. Markdown is supported.'")
    .card(v-else)
      .card-content
        .content(v-html="makeHtml(currentValue)")
  .buttons
    b-tooltip(v-if="!isLoggedIn" label="Login to comment" position="is-right")
      b-icon(icon="account" style="margin-right: 0.3rem;")
    b-tooltip(label="Not shown as expected? See Markdown tutorial" position="is-right")
      b-icon(icon="information-outline")
    div(style="flex-grow: 1;")
    b-button.is-success(:disabled="!isLoggedIn || !currentValue") Send
    b-button.is-warning(:disabled="!isLoggedIn" @click="isPreview = !isPreview") {{ isPreview ? 'Edit' : 'Preview' }}
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
      isLoggedIn: false,
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
    }
  }
}
</script>
