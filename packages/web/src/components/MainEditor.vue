<template lang="pug">
article.media
  figure.media-left(style="text-align: center; position: relative;")
    .popup(ref="login" v-show="isLoggingIn")
    p.image.avatar(style="margin-top: 1rem;")
      b-tooltip(v-if="user" :label="'Logged in as ' + (user.displayName || 'Anonymous') + '. Click to logout'" position="is-right")
        img.is-rounded.cursor-pointer(:src="getGravatarUrl(user.email)" :alt="user.given_name"
          @click="doLogout" role="button")
      b-tooltip(v-else label="Click to login" position="is-right")
        img.is-rounded.cursor-pointer(:src="getGravatarUrl()"
          @click="isLoggingIn = true" role="button")
  .media-content
    .toggleable-editor-main
      client-only(v-if="user")
        SimpleMde(
          v-model="currentValue"
          @init="$emit('render')")
      b-input(v-else type="textarea" disabled placeholder="Please login to comment.")
    .buttons(style="margin-left: 1rem;")
        b-button.is-success(:disabled="!user || !currentValue" @click="doPost") Post Comment
</template>

<script lang="ts">
import { Vue, Component, Emit, Watch } from 'vue-property-decorator'
import SimpleMde from './SimpleMde.vue'
import { getGravatarUrl } from '../assets/util'
import { AxiosInstance } from 'axios'
import firebase from 'firebase/app'
import { auth } from 'firebaseui'

import 'firebase/auth'
import 'firebaseui/dist/firebaseui.css'

@Component({
  components: {
    SimpleMde
  }
})
export default class MainEditor extends Vue {
  currentValue = ''
  getGravatarUrl = getGravatarUrl
  isLoggingIn = false
  authUI: any = null
  get user () {
    return this.$store.state.user
  }

  @Watch('isLoggingIn')
  async doLogin () {
    const { login } = this.$refs as any
    this.authUI =
        this.authUI ||
        auth.AuthUI.getInstance() ||
        new auth.AuthUI(firebase.auth())
    this.authUI.start(login, {
      signInFlow: 'popup',
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // this.$fireAuthObj.FacebookAuthProvider.PROVIDER_ID,
        // this.$fireAuthObj.TwitterAuthProvider.PROVIDER_ID,
        // this.$fireAuthObj.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // this.$fireAuthObj.PhoneAuthProvider.PROVIDER_ID,
        auth.AnonymousAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        signInSuccessWithAuthResult: (r: any) => {
          this.$store.dispatch('login', r.user)
          this.isLoggingIn = false
          return true
        }
      }
    })
    const onClickOutside = (evt: any) => {
      const { login } = this.$refs as any
      if (login && !login.contains(evt.target)) {
        this.isLoggingIn = false
      }
      this.$el.removeEventListener('click', onClickOutside)
    }
    this.$el.addEventListener('click', onClickOutside)
  }

  async doLogout () {
    await firebase.auth().signOut()
    this.$store.dispatch('logout')
  }

  @Emit('post')
  async doPost () {
    const api = await this.$store.dispatch('getApi') as AxiosInstance
    await api.put('/api/comment/', {
      content: this.currentValue,
      path: '_root',
      like: {
        'thumb-up': []
      }
    })
    this.currentValue = ''
  }
}
</script>

<style lang="scss" scoped>
.preview {
  background-color: #fcf2d4;
}
.toggleable-editor-main {
  margin: 10px;
  height: 200px;
  @media screen and (max-width: 600px) {
    height: 250px;
  }
}
.cursor-pointer {
  cursor: pointer;
}
.popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  z-index: 100;
  left: 50%;
  top: 1em;
  width: 250px;
}
</style>
