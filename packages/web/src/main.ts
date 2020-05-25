import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from 'firebase/app'

import 'firebase/analytics'
import 'firebase/auth'
import 'simplemde/dist/simplemde.min.css'

Vue.config.productionTip = false

firebase.initializeApp(require('../../../firebase.config.js'))
firebase.auth().onAuthStateChanged((user) => {
  store.commit('setUser', user)
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
