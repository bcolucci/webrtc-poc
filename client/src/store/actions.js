import * as api from "../api";

const fetchUser = async ({ state, commit }) => {
  const { authToken } = state;
  if (authToken) {
    const user = await api.fetchUser(authToken);
    if (user) {
      commit("setUser", user);
      return true;
    }
  }
  commit("setUser", undefined);
  return false;
};

const signIn = async ({ commit }, { username, password }) => {
  const authToken = await api.signIn({ username, password });
  if (authToken) {
    commit("signIn", authToken);
    return true;
  }
  return false;
};

const fetchAccessToken = async ({ state, commit }, roomName) => {
  const accessToken = await api.fetchAccessToken({
    authToken: state.authToken,
    roomName
  });
  commit("setAccessToken", accessToken);
  return accessToken;
};

export default {
  fetchUser,
  signIn,
  fetchAccessToken,
  signOut({ commit }) {
    commit("signOut");
  },
  login({ commit }, user) {
    commit("login", user);
  },
  logout({ commit }) {
    commit("logout");
  }
};
