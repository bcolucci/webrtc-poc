<template>
  <div id="chat">
    <div id="messages" class="container">
      <p v-for="message in messages" :key="message.sid">
        <span class="message-author">{{ message.author }}:</span>
        <span class="message-body">{{ message.body }}</span>
      </p>
    </div>
    <div class="container">
      <div class="row">
        <FormulateInput
          id="message"
          type="text"
          v-model="message"
          :disabled="!channel"
        />
        <FormulateInput
          type="button"
          label="Send"
          :disabled="!channel"
          @click="onSendMessage"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Chat",
  props: ["channel"],
  data() {
    return {
      message: "",
      messages: []
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  methods: {
    getMessagesContainer() {
      return document.getElementById("messages");
    },
    onMessageAdded(message) {
      if (!this.channel) {
        return;
      }
      const { author, body } = message;
      this.messages.push({ author, body });
    },
    async loadMessages() {
      console.log("load messages");
      const messages = await this.channel.getMessages();
      messages.items.forEach(this.onMessageAdded);
    },
    async onSendMessage() {
      await this.channel.sendMessage(this.message);
      this.message = "";
    }
  },
  watch: {
    channel(val) {
      console.log("channel changed");
      if (val) {
        if (this.messages.length) {
          this.getMessagesContainer().innerHTML = "";
        }
        this.loadMessages();
        this.channel.on("messageAdded", this.onMessageAdded);
      }
    }
  },
  created() {
    console.log("created");
  }
};
</script>

<style scoped>
#chat {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 400px;
  width: 40%;
  background-color: #eee;
  opacity: 0.8;
}
.formulate-input {
  margin-bottom: 0;
}
[data-classification="text"] {
  width: 80%;
  margin-right: 5px;
}
.message-author {
  font-weight: bold;
}
.message-body {
  display: block;
}
</style>
