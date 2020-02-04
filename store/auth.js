import createAuth0Client from '@auth0/auth0-spa-js'
import Vue from 'vue'

export const state = () => ({
  client: null,
  token: null,
  user: null
})

export const mutations = {
  addClient (state, client) {
    state.client = client
  },
  addToken (state, token) {
    state.token = token
  },
  removeToken (state) {
    state.token = null
  },
  addUser (state, user) {
    Vue.set(state, 'user', user)
  },
  removeUser (state) {
    state.user = null
  }
}

export const actions = {
  async getClient ({ state, commit }) {
    if (state.client) {
      return state.client
    }

    const auth0 = await createAuth0Client({
      domain: process.env.auth0_domain,
      client_id: process.env.auth0_clientId,
      audience: `https://${process.env.auth0_domain}/api/v2/`
    })
    commit('addClient', auth0)

    return auth0
  },
  async getToken ({
    state: { client, token },
    commit, dispatch
  }) {
    /**
     * @type {Auth0Client}
     */
    client = client || await dispatch('getClient')

    if (!token) {
      token = await client.getTokenWithPopup()
      commit('addToken', token)

      const user = await client.getUser()
      await this.$axios.$post('/api/user/login', user)

      commit('addUser', user)

      return token
    } else {
      try {
        const r = await this.$axios.$post('/api/user/login')
        const user = r.data
        commit('addUser', user)
      } catch (e) {}
    }

    return token
  },
  isAuthenticated ({ state }) {
    return !!state.user
  },
  async login ({ state, dispatch }) {
    await dispatch('getToken')
    return state.user
  },
  async logout ({ state, commit }) {
    if (!state.token) {
      return false
    }

    await this.$axios.$delete('/api/user/logout')

    commit('removeUser')
    commit('removeToken')

    return true
  }
}
