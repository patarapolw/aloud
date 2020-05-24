import { MutationTree, ActionTree } from 'vuex'
import { User } from 'firebase/app'
import { g } from '~/assets/schema'

export const state = () => ({
  user: null as User | null
})

export type RootState = ReturnType<typeof state>

export const mutations: MutationTree<RootState> = {
  setUser(state, user) {
    state.user = JSON.parse(JSON.stringify(user))
  }
}

export const actions: ActionTree<RootState, RootState> = {
  async login({ commit }, user = null) {
    await g.stitch!.login(user)
    commit('setUser', user)
  },
  async logout({ commit }) {
    commit('setUser', null)
    await g.stitch!.logout()
  }
}
