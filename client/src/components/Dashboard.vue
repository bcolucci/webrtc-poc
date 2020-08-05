<template>
  <div id="dashboard">
    <p>Connected as {{ user.username }}</p>
    <div class="container">
      <FormulateForm>
        <fieldset>
          <legend>Room name:</legend>
          <div class="row">
            <FormulateInput
              type="text"
              label="Room name"
              placeholder="leave blank to create one"
              v-model="roomName"
            />
            <FormulateInput
              type="submit"
              label="Join / Create"
              class="join-btn space-left"
              @click="onJoinRoom()"
            />
          </div>
        </fieldset>
      </FormulateForm>
    </div>
    <div class="container actions">
      <div class="row">
        <FormulateInput
          type="button"
          label="End call"
          :disabled="!room"
          @click="onEndCall()"
        />
        <FormulateInput
          type="button"
          label="Sign out"
          class="space-left"
          @click="onSignOut()"
        />
      </div>
    </div>
    <div class="container">
      <h2 v-if="room">Room {{ room.name }}</h2>
      <div class="row">
        <div id="localTrack"></div>
        <div id="remoteTracks"></div>
      </div>
    </div>
    <chat v-bind:channel="channel" />
  </div>
</template>

<script>
import shortid from "shortid";
import socket from "../socket";
import { mapActions } from "vuex";
import Twilio, { createLocalVideoTrack } from "twilio-video";
import TwilioChat from "twilio-chat";
import Chat from "./Chat.vue";

export default {
  name: "Dashboard",
  components: {
    Chat
  },
  data() {
    return {
      roomName: "",
      room: undefined,
      channel: undefined,
      localTrack: undefined,
      remoteTrackParticipants: {}
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  methods: {
    ...mapActions(["fetchAccessToken", "signOut"]),
    getLocalTrackContainer() {
      return document.getElementById("localTrack");
    },
    getRemoteTracksContainer() {
      return document.getElementById("remoteTracks");
    },
    createRemoteTrackContainer(participant, track) {
      const container = document.createElement("div");
      container.id = `remote-track-${track.sid}`;

      const participantName = document.createElement("h2");
      participantName.appendChild(
        document.createTextNode(participant.identity)
      );
      container.appendChild(participantName);

      const trackContainer = document.createElement("div");
      container.appendChild(trackContainer);

      trackContainer.appendChild(track.attach());

      this.getRemoteTracksContainer().appendChild(container);
    },
    removeRemoteTrackContainer(track) {
      track.detach().forEach(detachedElement => {
        detachedElement.remove();
      });
      const trackContainer = document.getElementById(
        `remote-track-${track.sid}`
      );
      if (trackContainer) {
        this.getRemoteTracksContainer().removeChild(trackContainer);
      }
    },
    trackPublished(publication, participant) {
      publication.on("subscribed", track =>
        this.createRemoteTrackContainer(participant, track)
      );
      publication.on("unsubscribed", track =>
        this.removeRemoteTrackContainer(track)
      );
    },
    participantConnected(participant) {
      participant.tracks.forEach(publication =>
        this.trackPublished(publication, participant)
      );
      participant.on("trackPublished", publication =>
        this.trackPublished(publication, participant)
      );
    },
    async initChat(accessToken) {
      const chatClient = await TwilioChat.create(accessToken);

      chatClient.on("channelInvited", async channel => {
        try {
          this.channel = await channel.join();
        } catch (err) {
          this.channel = channel;
          console.error(err.message);
        }
      });

      const createChat = async () => {
        const channel = await chatClient.createChannel({
          isPrivate: true,
          uniqueName: this.roomName
        });
        channel.imCreator = true;
        try {
          this.channel = await channel.join();
        } catch (err) {
          this.channel = channel;
          console.error(err.message);
        }
        socket.emit("chatCreated", this.roomName, () => {
          socket.on("inviteToChat", async username => {
            try {
              await this.channel.invite(username);
            } catch (err) {
              console.error(err.message);
            }
          });
        });
      };

      const tryToJoinExistingChat = async () => {
        try {
          const existingChannel = await chatClient.getChannelByUniqueName(
            this.roomName
          );
          this.channel = await existingChannel.join().catch(err => {
            console.error(err.message);
            return existingChannel;
          });
        } catch (err) {
          console.error(err.message);
          socket.emit("askChatInvitation", this.roomName, this.user.username);
        }
      };

      socket.emit("doesChatExists", this.roomName, async exists => {
        if (exists) {
          tryToJoinExistingChat();
        } else {
          createChat();
        }
      });
    },
    async initCall(accessToken) {
      this.room = await Twilio.connect(accessToken, {
        name: this.roomName,
        audio: true,
        video: true,
        tracks: [this.localTrack]
      });

      this.getLocalTrackContainer().appendChild(this.localTrack.attach());

      this.room.participants.forEach(this.participantConnected);
      this.room.on("participantConnected", this.participantConnected);
    },
    async onJoinRoom() {
      this.leaveRoomIfJoined();

      this.localTrack = await createLocalVideoTrack();

      this.roomName = this.roomName || shortid();
      const accessToken = await this.fetchAccessToken(this.roomName);

      this.initChat(accessToken);
      this.initCall(accessToken);
    },
    onSignOut() {
      this.leaveRoomIfJoined();
      this.signOut();
    },
    onEndCall() {
      this.leaveRoomIfJoined();
      this.room = null;
      this.channel = null;
    },
    leaveRoomIfJoined() {
      this.token = undefined;
      this.getLocalTrackContainer().innerHTML = "";
      this.getRemoteTracksContainer().innerHTML = "";
      if (this.channel && this.channel.imCreator) {
        socket.emit("closeChat");
        this.channel.delete();
      }
      if (this.room) {
        this.room.disconnect();
      }
    }
  },
  created() {
    socket.on("chatClosed", () => (this.channel = null));
    window.addEventListener("beforeunload", this.leaveRoomIfJoined);
  }
};
</script>

<style scoped>
#dashboard {
  padding-top: 50px;
}
.join-btn {
  margin-top: 22px;
}
.actions {
  margin-top: 20px;
}
.space-left {
  margin-left: 5px;
}
#remoteTracks {
  margin-left: -15px;
}
</style>
