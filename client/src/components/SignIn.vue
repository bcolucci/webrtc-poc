<template>
  <div id="signIn" class="container">
    <FormulateForm>
      <fieldset>
        <legend>Sign in</legend>
        <FormulateInput
          type="text"
          label="Username"
          validation="required"
          v-model="username"
        />
        <FormulateInput
          type="password"
          label="Password"
          validation="required"
          v-model="password"
        />
        <FormulateInput
          type="submit"
          label="Sign in"
          :disabled="loading"
          @click="onSubmit()"
        />
        <p v-show="error">{{ error }}</p>
      </fieldset>
    </FormulateForm>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "SignIn",
  data() {
    return {
      error: "",
      loading: false,
      username: "",
      password: ""
    };
  },
  methods: {
    ...mapActions(["signIn", "fetchUser"]),
    async onSubmit() {
      this.error = "";
      this.loading = true;
      const { username, password } = this;
      const success = await this.signIn({ username, password });
      if (success) {
        this.fetchUser();
      } else {
        this.error = "User not found.";
      }
      this.loading = false;
    }
  }
};
</script>
