import Vue from 'vue'
import Vuex from 'vuex'
import { User } from 'firebase/app'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null as User | null
  },
  mutations: {
    setUser (state, user) {
      // state.user = JSON.parse(JSON.stringify(user))
      state.user = user
    }
  },
  actions: {
    async getApi ({ state }, url) {
      const api = axios.create({
        transformResponse: [
          (d) => {
            try {
              return JSON.parse(d)
            } catch (_) {}
            return d
          }
        ],
        headers: {
          'X-Aloud-Url': url
        }
      })

      if (state.user) {
        api.defaults.headers.Authorization = `Bearer ${await state.user.getIdToken()}`
      }

      api.interceptors.response.use((r) => {
        if (r.data.error) {
          return Promise.reject(new Error(r.data.error))
        }

        return r
      })

      return api
    }
  }
})
