import "./main.scss";

import Vue from "vue";
import VueFormulate from "@braid/vue-formulate";
import App from "./App.vue";
import store from "./store";

Vue.config.productionTip = false;

Vue.use(VueFormulate);

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
