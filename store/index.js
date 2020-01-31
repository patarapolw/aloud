export const actions = {
  async nuxtServerInit ({ commit }, { req }) {
    commit('auth/addUser', req.session.user)
    commit('auth/addToken', req.session.token)
  }
}
