<template lang="pug">
div
  nav.navbar.header.has-shadow.is-primary(role="navigation" aria-label="main navigation")
    .navbar-brand
      a.navbar-item(href="/")
        strong(style="margin-right: 1rem;") Aloud
        | A self-hosted commenting engine
      .navbar-burger
        span
        span
        span
  section.main-content.columns
    aside.column.is-2.section
      p.menu-label.is-hidden-touch
        | General
      ul.menu-list
        li(v-for="(item, key) of items" :key="key")
          router-link(v-if="item.to" :to="item.to" exact-active-class="is-active")
            b-icon(:icon="item.icon" :pack="item.iconPack" style="margin-right: 0.5rem;")
            | {{ item.title }}
          a(v-else :href="item.url" target="_blank" rel="noopener")
            b-icon(:icon="item.icon" :pack="item.iconPack" style="margin-right: 0.5rem;")
            | {{ item.title }}
    .container.column.is-10
      slot
      .container(style="text-align: center;")
        iframe.comment-iframe(ref="comment"
          :src="commentUrl" frameborder="0" sandbox="allow-scripts allow-popups allow-same-origin")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class WebLayout extends Vue {
  items = [
    {
      title: 'Home',
      icon: 'home',
      to: '/'
    },
    {
      title: 'Installation',
      icon: 'cog',
      to: '/installation'
    },
    {
      title: 'Guide',
      icon: 'question',
      to: '/guide'
    },
    {
      title: 'GitHub',
      icon: 'github',
      iconPack: 'fab',
      url: 'https://github.com/patarapolw/aloud'
    }
  ]

  scrollHeight = 0

  get commentUrl () {
    const u = new URL('/comment', location.origin)
    u.searchParams.set('url', location.origin + this.$route.path)

    return u.href
  }

  mounted () {
    if (window.addEventListener) {
      window.addEventListener('message', (evt) => {
        this.setScrollHeight(evt)
      }, false)
    } else {
      // @ts-ignore
      window.attachEvent('onmessage', (evt) => {
        this.setScrollHeight(evt)
      })
    }
  }

  setScrollHeight (evt: any) {
    const { comment } = this.$refs as any
    if (!comment) {
      return
    }

    if (evt.origin === location.origin) {
      comment.style.height = `${evt.data.scrollHeight}px`
    }
  }
}
</script>

<style lang="scss">
.comment-iframe {
  width: 80%;
}
@media only screen and (max-width: 770px) {
  .comment-iframe {
    width: 100%;
  }
}
pre code {
  background-color: unset !important;
}
</style>
