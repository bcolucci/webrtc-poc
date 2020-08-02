<template>
  <div id="dashboard">
    <div class="container">
      <h1>Hello {{ user.username }}!</h1>
      <FormulateForm>
        <fieldset>
          <legend>Room name (leave empty to create one)</legend>
          <div class="row">
            <FormulateInput type="text" label="Room name" v-model="roomName" />
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
      </div>
    </div>
    <div class="container">
      <div id="remoteTracks"></div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import Twilio, { createLocalVideoTrack } from "twilio-video";

export default {
  name: "Dashboard",
  data() {
    return {
      roomName: "",
      room: undefined,
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
    ...mapActions(["fetchVideoToken", "signOut"]),
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
    async onJoinRoom() {
      this.leaveRoomIfJoined();

      const { roomName, token } = await this.fetchVideoToken(this.roomName);

      this.localTrack = await createLocalVideoTrack();

      this.room = await Twilio.connect(token, {
        name: roomName,
        audio: true,
        video: true,
        tracks: [this.localTrack]
      });

      this.getLocalTrackContainer().appendChild(this.localTrack.attach());

      this.room.participants.forEach(this.participantConnected);
      this.room.on("participantConnected", this.participantConnected);
    },
    created() {
      window.addEventListener("beforeunload", this.leaveRoomIfJoined);
    },
    onSignOut() {
      this.leaveRoomIfJoined();
      this.signOut();
    },
    onEndCall() {
      this.leaveRoomIfJoined();
      this.room = null;
    },
    leaveRoomIfJoined() {
      this.getLocalTrackContainer().innerHTML = "";
      this.getRemoteTracksContainer().innerHTML = "";
      if (this.room) {
        this.room.disconnect();
      }
    }
  }
};
</script>

<style scoped>
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
