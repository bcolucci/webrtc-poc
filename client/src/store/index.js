import Vue from "vue";
import Vuex from "vuex";
import { mutations, STORAGE_KEY } from "./mutations";
import actions from "./actions";
import plugins from "./plugins";

Vue.use(Vuex);

const persistedData = JSON.parse(
  window.localStorage.getItem(STORAGE_KEY) || "{}"
);

export default new Vuex.Store({
  state: {
    authToken: undefined,
    ...persistedData,
    user: undefined
  },
  actions,
  mutations,
  plugins
});
