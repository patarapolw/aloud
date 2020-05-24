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
          nuxt-link(v-if="item.to" :to="item.to" exact-active-class="is-active")
            b-icon(:icon="item.icon" style="margin-right: 0.5rem;")
            | {{ item.title }}
          a(v-else :href="item.url")
            b-icon(:icon="item.icon" style="margin-right: 0.5rem;")
            | {{ item.title }}
    .container.column.is-10
      nuxt
      .container(style="text-align: center;")
        iframe.comment-iframe(:src="commentUrl" frameborder="0" sandbox="allow-scripts allow-popups allow-same-origin")
</template>

<script lang="ts">
import qs from 'querystring'
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  head() {
    return {
      link: [
        {
          rel: 'stylesheet',
          href:
            '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/default.min.css'
        }
      ],
      script: [
        {
          src:
            '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js',
          async: true
        }
      ]
    }
  }
})
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
      icon: 'help',
      to: '/guide'
    },
    {
      title: 'GitHub',
      icon: 'github',
      url: 'https://github.com/patarapolw/aloud'
    }
  ]

  get commentUrl() {
    return (
      '/comment?' +
      qs.stringify({
        url: process.env.BASE_URL + this.$route.path
      })
    )
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
