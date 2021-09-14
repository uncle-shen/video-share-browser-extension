<template>
  <div class="overflow-hidden full-height full-width column absolute">
    <q-toolbar class="col-auto text-primary q-py-sm bg-grey-1">
      <q-icon size="md" name="message"> </q-icon>
      <q-toolbar-title> 聊天 </q-toolbar-title>

      <q-btn round dense icon="people">
        <q-badge floating>{{ onlineCount }}</q-badge>
        <q-popup-proxy transition-show="jump-down" transition-hide="jump-up">
          <user-list
            :onlineUsers="onlineUsers"
            :offlineUsers="offlineUsers"
          ></user-list>
        </q-popup-proxy>
      </q-btn>
    </q-toolbar>
    <q-separator />

    <message-scroll
      :users="users"
      class="col relative-position"
      ref="scroll"
    ></message-scroll>
    <q-banner
      v-show="offline"
      rounded
      inline-actions
      class="offline-banner text-white bg-red absolute q-mx-md"
    >
      You have lost connection to the internet. This app is offline.
      <template v-slot:action>
        <q-btn @click="handleReconnect" flat color="white" label="重连" />
      </template>
    </q-banner>
    <div class="col-auto q-px-sm vs-messgae-input">
      <q-input
        dense
        filled
        ref="message-input"
        @keypress.enter="sendMessage"
        v-model="text"
      >
        <template v-slot:before>
          <emoji-picker @pick-emoji="pickEmoji"></emoji-picker>
        </template>

        <template v-slot:append>
          <q-icon
            v-show="text !== ''"
            name="close"
            @click="text = ''"
            class="cursor-pointer"
          />
        </template>

        <template v-slot:after>
          <q-btn round flat icon="send" @click="sendMessage" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import MessageScroll from "./components/MessageScroll.vue";
import EmojiPicker from "./components/EmojiPicker.vue";
import UserList from "./components/UserList.vue";

import {
  GET_USER,
  POST_USER,
  POST_USERS,
  DELETE_USER,
  POST_MESSAGE,
  GET_PLAYER_CURRENTTIME,
  GET_PLAYER_STATUS,
  PUT_PLAYER_CURRENTTIME,
  PUT_PLAYER_STATUS,
} from "const/MessageType";

export default defineComponent({
  name: "Chat",
  components: { MessageScroll, EmojiPicker, UserList },
  data() {
    return {
      text: "",
      onlineUsers: new Map(),
      offlineUsers: new Map(),
      offline: false,
      dismissNotify: null,
      routes: new Map([
        [POST_USER, this.postUser],
        [POST_USERS, this.postUsers],
        [DELETE_USER, this.deleteUser],
        [POST_MESSAGE, this.receiveNewMessage],
        [PUT_PLAYER_CURRENTTIME, this.handlePlayerCMD],
        [PUT_PLAYER_STATUS, this.handlePlayerCMD],
      ]),
    };
  },
  computed: {
    users() {
      return new Map([...this.onlineUsers, ...this.offlineUsers]);
    },
    onlineCount() {
      return this.onlineUsers.size;
    },
  },
  created() {
    this.$q.bex.on("socket.disconnect", this.connectError);
    this.$q.bex.on("socket.reconnect", this.reconnect);
    this.$q.bex.on("socket.connected", this.connected);
    this.$q.bex.on("socket.message", this.dispatchMessages);
    this.initInfo();
    this.$q.bex
      .send("storage.get", { key: "connectInfo" })
      .then(({ data, eventResponseKey }) => {
        if (data.host) {
          this.sendMessageToBG(PUT_PLAYER_CURRENTTIME, { currentTime: 0 });
          this.sendMessageToBG(PUT_PLAYER_STATUS, { status: "pause" });
        }
        this.$q.bex.send(eventResponseKey);
      });
    window.addEventListener("message", (e) => {
      this.sendMessageToBG(e.data.path, e.data.data);
    });
  },
  unmounted() {
    this.$q.bex.off("socket.disconnect", this.connectError);
    this.$q.bex.off("socket.reconnect", this.reconnect);
    this.$q.bex.off("socket.connected", this.connected);
    this.$q.bex.off("socket.message", this.dispatchMessages);
  },
  methods: {
    dispatchMessages({ data, eventResponseKey }) {
      if (this.routes.has(data.path)) this.routes.get(data.path)(data.data);
      this.$q.bex.send(eventResponseKey);
    },
    sendMessageToBG(path, data) {
      return this.$q.bex.send("send.socket.message", { path, data });
    },
    initInfo() {
      //获取当前在线用户
      this.sendMessageToBG(GET_USER);

      //获取进度
      this.sendMessageToBG(GET_PLAYER_CURRENTTIME);
      this.sendMessageToBG(GET_PLAYER_STATUS);
    },
    handlePlayerCMD(data) {
      if (data.uid) {
        const user = this.users.get(data.uid);
        this.notify({
          avatar: user.avatar,
          message: `${user.nickname} ${
            data.status == "pause" ? "暂停" : "播放"
          }了视频`,
        });
      }
      this.postMessage(data, "controlPlayer");
    },
    connectError() {
      this.offline = true;
      this.notify({
        message: "与服务器建立连接失败",
        type: "negative",
      });
    },
    reconnect() {
      this.offline = false;
      console.log(this);
      this.notify({
        spinner: true,
        message: "断线重连中",
      });
    },
    handleReconnect() {
      this.$q.bex.send("socket.reconnect");
    },
    connected() {
      this.notify({
        type: "positive",
        message: "已恢复连接",
      });
      this.initInfo();
    },
    postUser({ user }) {
      this.onlineUsers.set(user[0], user[1]);
      const u = this.offlineUsers.get(user[0]);
      if (u) this.offlineUsers.delete(u);
      this.notify({
        color: "green",
        avatar: user[1].avatar,
        message: `${user[1].nickname}上线`,
      });
    },
    postUsers({ users }) {
      const temp = new Map([...this.onlineUsers, ...this.offlineUsers]);
      const offlineUsers = new Map();
      this.onlineUsers = new Map([...users]);
      temp.forEach((user, id) => {
        if (!this.onlineUsers.get(id)) offlineUsers.set(id, user);
      });
      this.offlineUsers = offlineUsers;
    },
    deleteUser({ uid }) {
      let user;
      if ((user = this.onlineUsers.get(uid))) {
        this.onlineUsers.delete(uid);
        this.offlineUsers.set(uid, user);
        this.notify({
          color: "grey",
          avatar: user.avatar,
          message: `${user.nickname}离线`,
        });
      }
    },
    pickEmoji(emoji) {
      const { selectionStart, selectionEnd } =
        this.$refs["message-input"].getNativeElement();
      this.text =
        this.text.slice(0, selectionStart) +
        emoji +
        this.text.slice(selectionEnd);
      this.$refs["message-input"].focus();
    },
    sendMessage() {
      if (this.text == "") return;
      this.sendMessageToBG(POST_MESSAGE, { text: [this.text] }).then(() => {
        this.text = "";
      });
    },
    postMessage(data, type = "passMessage") {
      parent.postMessage({ type, data }, "*");
    },
    notify(notifyObj) {
      if (this.dismissNotify) this.dismissNotify();
      this.dismissNotify = this.$q.notify(notifyObj);
      this.postMessage(notifyObj);
    },
    receiveNewMessage(message) {
      this.$refs.scroll.pushNewMessage(message);
    },
  },
});
</script>

<style scoped>
.offline-banner {
  top: 60px;
}

.vs-messgae-input {
  font-size: 2em;
}
</style>
