import createAuth0Client from '@auth0/auth0-spa-js'

export const state = () => ({
  client: null
})

export const mutations = {
  addClient (state, client) {
    state.client = client
  }
}

export const actions = {
  async createClient ({ commit }) {
    const auth0 = await createAuth0Client({
      domain: process.env.AUTH0_DOMAIN,
      client_id: process.env.AUTH0_CLIENT_ID
    })
    commit('addClient', auth0)
  },
  async login ({ state, dispatch }) {
    const { client } = state
    if (client) {
      await client.loginWithPopup()
    } else {
      await dispatch('createClient')
      dispatch('login')
    }
  },
  async logout ({ state, dispatch }) {
    const { client } = state
    if (client) {
      client.logout()
    } else {
      await dispatch('createClient')
      dispatch('login')
    }
  }
}
