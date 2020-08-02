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

const fetchVideoToken = ({ state }, roomName) =>
  api.fetchVideoToken({ authToken: state.authToken, roomName });

export default {
  fetchUser,
  signIn,
  fetchVideoToken,
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
