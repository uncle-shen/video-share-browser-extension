<template>
  <q-list
    class="bg-white vs-user-list"
    style="min-width: 200px; max-width: 350px"
    separator
  >
    <q-item v-for="[id, user] in onlineUsers" :key="id" v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <img :src="user.avatar" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label lines="1">{{ user.nickname }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-item-label class="text-green" caption>在线</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      class="text-grey"
      v-for="[id, user] in offlineUsers"
      :key="id"
      v-ripple
    >
      <q-item-section avatar>
        <q-avatar>
          <img :src="user.avatar" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label lines="1">{{ user.nickname }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-item-label class="text-red" caption>离线</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
export default {
  props: {
    onlineUsers: Map,
    offlineUsers: Map,
  },
};
</script>

<style scoped>
.vs-user-list::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: #027be3;
}

.vs-user-list::-webkit-scrollbar {
  width: 5px;
}
</style>
