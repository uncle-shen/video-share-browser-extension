<template>
  <q-form style="width: 350px" class="q-pa-lg q-gutter-md">
    <q-input
      label="昵称"
      rounded
      outlined
      v-model="nickname"
      lazy-rules
      :rules="[(val) => !!val || '必填项']"
    >
    </q-input>
    <q-input
      label="头像"
      placeholder="输入QQ获取QQ空间头像"
      debounce="500"
      rounded
      outlined
      v-model="qq"
      :rules="[(val) => !!val || '必填项']"
    >
      <template v-slot:append>
        <q-avatar v-show="qq">
          <img :src="avatar" />
        </q-avatar>
      </template>
    </q-input>
    <q-input
      label="服务器链接"
      name="url"
      rounded
      outlined
      v-model="url"
      :rules="[(val) => !!val || '必填项']"
    >
    </q-input>
    <div class="row justify-around">
      <q-btn color="primary" @click="createServer(true)" label="创建服务器" />
      <q-btn
        color="secondary"
        @click="createServer(false)"
        label="加入服务器"
      />
    </div>
  </q-form>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "popup",
  data() {
    return {
      nickname: "",
      qq: "",
      url: "",
      connectNotify: null,
      tab: null,
    };
  },
  created() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      this.tab = tabs[0];
    });
    this.$q.bex.send("storage.get", { key: "connectInfo" }).then(({ data }) => {
      this.qq = data.qq;
      this.url = data.url;
      this.nickname = data.nickname;
    });
  },
  computed: {
    avatar: function () {
      return this.qq
        ? `https://qlogo4.store.qq.com/qzone/` +
            this.qq +
            `/` +
            this.qq +
            `/100`
        : ``;
    },
  },

  methods: {
    errorHandle() {
      this.connectNotify();
      this.$q.notify({
        type: "negative",
        message: "连接失败",
      });
    },
    successHandle() {
      this.connectNotify();
      this.$q.notify({
        message: "连接服务器成功，三秒后将自动关闭该窗口，请在页面中选择视频",
        type: "positive",
        timeout: 3000,
        onDismiss: () => {
          window.close();
        },
      });
    },
    createServer(host) {
      this.connectNotify = this.$q.notify({
        spinner: true,
        message: "连接服务器中",
        timeout: 10000,
      });
      this.$q.bex
        .send("create.connect.server", {
          nickname: this.nickname,
          avatar: this.avatar,
          qq: this.qq,
          url: this.url,
          host,
          tab: this.tab,
        })
        .then(({ data }) => {
          if (data.success) {
            this.successHandle();
          } else {
            this.errorHandle();
          }
        });
    },
  },
});
</script>

<style></style>
