export const actions = {
  async nuxtServerInit ({ commit }, { req: { session: { token, user } } }) {
    if (user) {
      commit('auth/addUser', user)
      commit('auth/addToken', token)
    }
  }
}
