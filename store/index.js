export const actions = {
  async nuxtServerInit ({ commit }, { req: { session: { token, user } } }) {
    // eslint-disable-next-line no-console
    console.log(user)
    if (user) {
      commit('auth/addUser', user)
      commit('auth/addToken', token)
    }
  }
}
