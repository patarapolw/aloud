import createAuth0Client from '@auth0/auth0-spa-js'

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
    state.user = user
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
      domain: process.env.AUTH0_DOMAIN,
      client_id: process.env.AUTH0_CLIENT_ID,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
    })
    commit('addClient', auth0)

    return auth0
  },
  async getToken ({ state, commit, dispatch }) {
    if (state.token) {
      return state.token
    }

    /**
     * @type {Auth0Client}
     */
    const client = state.client || await dispatch('getClient')

    const token = await client.getTokenWithPopup()
    commit('addToken', token)

    const user = await client.getUser()
    commit('addUser', user)

    await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })

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

    await fetch('/api/user/logout', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${state.token}`
      }
    })

    commit('removeUser')
    commit('removeToken')

    return true
  }
}
