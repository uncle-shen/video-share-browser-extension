<template>
  <div ref="wrap" class="vs-video-wrap">
    <slot></slot>
  </div>
</template>

<script>
import { defineComponent, inject } from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.min.css";

import video_zhCN from "video.js/dist/lang/zh-CN.json";
videojs.addLanguage("zh-CN", video_zhCN);

import ChatButton from "./ChatButton";
import SynButton from "./SynButton";
import {
  GET_PLAYER_CURRENTTIME,
  PUT_PLAYER_STATUS,
} from "src/const/MessageType";

export default defineComponent({
  name: "VsVideo",
  setup() {
    const videoEl = inject("videoEl");
    return { videoEl };
  },
  data() {
    return {
      player: null,
      options: {
        controls: true,
        language: "zh-CN",
        controlBar: {
          height: "5em",
          currentTimeDisplay: true,
          durationDisplay: true,
          children: [
            { name: "playToggle" },
            { name: "currentTimeDisplay" },
            { name: "progressControl" },
            { name: "durationDisplay" },
            { name: "volumePanel", inline: false },
            { name: "synButton" },
            { name: "ChatButton" },
            { name: "FullscreenToggle" },
          ],
        },
      },
    };
  },
  mounted() {
    this.initVideoEl(this.videoEl);
    this.$refs.wrap.appendChild(this.videoEl);
    ChatButton.prototype.handleClick = () => {
      this.$emit("ChatButtonClick");
    };
    SynButton.prototype.handleClick = () => {
      this.$emit("putPlayerData", { path: GET_PLAYER_CURRENTTIME });
    };
    videojs.registerComponent("ChatButton", ChatButton);
    videojs.registerComponent("synButton", SynButton);
    this.player = videojs(
      this.videoEl,
      {
        ...this.options,
        sources: [
          {
            src: this.videoEl.src,
            type: "video/mp4",
          },
        ],
        userActions: {
          doubleClick: this.handleFullscreen,
        },
      },
      () => {
        this.player.controlBar.FullscreenToggle.handleClick =
          this.handleFullscreen;
        this.player.on("play", () => {
          if (this.playerStatus != "play") {
            this.$emit("putPlayerData", {
              path: PUT_PLAYER_STATUS,
              data: {
                status: "play",
              },
            });
            this.playerStatus = "play";
          }
        });
        this.player.on("pause", () => {
          if (this.playerStatus != "pause") {
            this.$emit("putPlayerData", {
              path: PUT_PLAYER_STATUS,
              data: {
                status: "pause",
              },
            });
            this.playerStatus = "pause";
          }
        });
      }
    );
  },
  methods: {
    handleControlCommand(data) {
      if (data.hasOwnProperty("current_time"))
        this.player.currentTime(data.current_time);
      else if (data.hasOwnProperty("status")) {
        this.player[data.status]();
        this.playerStatus = data.status;
      }
    },
    handleFullscreen() {
      this.$emit("fullscreenevent");
    },
    initVideoEl(el) {
      el.getAttributeNames().forEach((name) => {
        if (name != "src") el.removeAttribute(name);
      });
      el.classList.add("video-js");
    },
  },
});
</script>

<style></style>
