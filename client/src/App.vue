<template>
  <div id="app">
    <div v-if="user">
      <dashboard />
    </div>
    <sign-in v-show="!user" />
  </div>
</template>

<script>
import { mapActions } from "vuex";

import SignIn from "./components/SignIn.vue";
import Dashboard from "./components/Dashboard.vue";

export default {
  name: "App",
  components: {
    SignIn,
    Dashboard
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  methods: {
    ...mapActions(["fetchUser"])
  },
  created() {
    this.fetchUser();
  }
};
</script>

<style scoped>
#app {
  margin-top: 20px;
}
</style>
