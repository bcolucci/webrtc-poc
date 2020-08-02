export const STORAGE_KEY = "webrtc-poc";

export const mutations = {
  signIn(state, authToken) {
    state.authToken = authToken;
  },
  signOut(state) {
    state.authToken = undefined;
    state.user = undefined;
  },
  setUser(state, user) {
    state.user = user;
  },
  login(state, user) {
    state.currentUser = user;
  },
  logout(state) {
    state.currentUser = undefined;
  }
};
