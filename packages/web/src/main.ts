import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from 'firebase/app'

import 'firebase/analytics'
import 'firebase/auth'
import 'simplemde/dist/simplemde.min.css'
import './plugins/buefy'

Vue.config.productionTip = false

firebase.initializeApp(JSON.parse(process.env.VUE_APP_FIREBASE_CONFIG!))
firebase.auth().onAuthStateChanged((user) => {
  store.commit('setUser', user)
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
