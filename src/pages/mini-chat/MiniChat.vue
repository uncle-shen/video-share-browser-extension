<template>
  <div class="vs-mini-chat-box"></div>
</template>

<script>
export default {
  name: "mini-chat",
  created() {
    this.$q.notify.setDefaults({
      group: false,
      position: "bottom",
      timeout: 3000,
      progress: false,
      multiLine: true,
    });
    window.addEventListener("message", (e) => {
      this.$q.notify(e.data);
    });
  },
};
</script>

<style scoped>
.vs-mini-chat-box {
  width: 100%;
  height: 100%;
}
</style>
