<template>
  <div ref="wrap" class="vs-app-main">
    <div
      :style="{ paddingRight: drawerRight ? 0 : drawerWidth + 'px' }"
      style="box-sizing: border-box"
      class="vs-container"
    >
      <vs-video
        ref="player"
        @fullscreenevent="fullscreenChange"
        @ChatButtonClick="ChatButtonClick"
        @putPlayerData="handlePutPlayerData"
      >
        <iframe
          ref="mini-chat"
          v-show="drawerRight"
          class="vs-mini-chat-iframe vs-iframe"
          :src="miniChatURL"
        >
        </iframe>
      </vs-video>
    </div>
    <aside
      :style="{
        transform: `translateX(${drawerRight ? drawerWidth : 0}px)`,
        width: drawerWidth + 'px',
      }"
      class="vs-chat-drawer"
    >
      <div v-if="!chatLoaded" class="vs-spinner"></div>

      <iframe
        @load="chatLoadedFn"
        ref="chat"
        class="vs-chat-frame vs-iframe"
        :src="chatURL"
      ></iframe>
    </aside>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import VsVideo from "./components/VsVideo.vue";

export default defineComponent({
  name: "App",
  components: {
    VsVideo,
  },
  data() {
    return {
      drawerRight: false,
      drawerWidth: 400,
      chatLoaded: false,
    };
  },
  computed: {
    chatURL() {
      return chrome.runtime.getURL(`www/index.html#/chat`);
    },
    miniChatURL() {
      return chrome.runtime.getURL(`www/index.html#/minichat`);
    },
  },
  created() {
    window.addEventListener("message", this.handleMessage);
  },
  methods: {
    ChatButtonClick() {
      this.drawerRight = !this.drawerRight;
    },
    fullscreenChange() {
      const fullscreen = this.$refs.wrap === document.fullscreenElement;
      if (fullscreen) {
        document.exitFullscreen();
      } else {
        this.$refs.wrap.requestFullscreen();
      }
    },
    handleMessage({ data }) {
      switch (data.type) {
        case "passMessage":
          if (this.drawerRight) this.passMessage(data.data);
          break;
        case "controlPlayer":
          this.passMessageToPlayer(data.data);
          break;
        default:
          break;
      }
    },
    passMessage(msg) {
      this.$refs["mini-chat"].contentWindow.postMessage(msg, "*");
    },
    passMessageToPlayer(cmd) {
      this.$refs["player"].handleControlCommand(cmd);
    },
    handlePutPlayerData(data) {
      this.$refs["chat"].contentWindow.postMessage(data, "*");
    },
    chatLoadedFn() {
      this.chatLoaded = true;
    },
  },
});
</script>

<style></style>
