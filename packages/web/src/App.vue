<template lang="pug">
#App
  component(v-if="layout" :is="layout")
    router-view
  router-view(v-else)
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  get layout () {
    const layout = this.$route.meta.layout
    return layout ? `${layout}-layout` : null
  }
}
</script>
