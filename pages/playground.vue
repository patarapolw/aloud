<template lang="pug">
.card(style="margin: 1rem; height: 500px;")
  simple-mde(:options="{ placeholder: '' }" :path="path")
</template>

<script>
import SimpleMde from '@/components/SimpleMde'

export default {
  components: {
    SimpleMde
  }
}
</script>
