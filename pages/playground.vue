<template lang="pug">
.card(style="margin: 1rem")
  simple-mde(:options="{ placeholder: '' }")
</template>

<script>
import SimpleMde from '@/components/SimpleMde'

export default {
  components: {
    SimpleMde
  }
}
</script>
