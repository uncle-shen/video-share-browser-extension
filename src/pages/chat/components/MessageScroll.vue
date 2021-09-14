<template>
  <div>
    <q-scroll-area
      :thumb-style="thumbStyle"
      class="q-px-sm full-height"
      :delay="0"
      ref="scroll"
      @scroll="scroll"
    >
      <q-chat-message
        v-for="message in messages"
        :key="message.id"
        :name="getUserInfo(message.uid).nickname"
        :avatar="getUserInfo(message.uid).avatar"
        :text="message.text"
        :sent="message.sent"
        :stamp="timeFormat(message.stamp)"
      />
    </q-scroll-area>

    <q-chip
      @click="scrollToTheNew"
      v-show="newMessages"
      clickable
      class="absolute-bottom-right q-mr-sm"
    >
      <q-avatar color="red" dense text-color="white">{{
        newMessages
      }}</q-avatar>
      新消息
    </q-chip>
  </div>
</template>

<script>
import { date } from "quasar";

export default {
  name: "messageScroll",
  props: {
    users: Map,
  },
  data() {
    return {
      thumbStyle: {
        right: "2px",
        borderRadius: "5px",
        backgroundColor: "#027be3",
        width: "5px",
        opacity: 0.75,
      },
      messages: [],
      refNow: 0,
      refCountNow: 0,
      newMessages: 0,
      needScrollToBottom: true,
      verticalPosition: 0,
    };
  },
  computed: {
    //获取第一个未读消息的元素位置
    firstNewMessageTop() {
      const dom = this.getTextDom()[this.refCountNow];
      return dom.offsetTop;
    },
    messagesDom() {
      //获取当前所有消息的messageDom
      return this.$refs.scroll.getScrollTarget().children[0].children;
    },
    timeFormat() {
      return function (stamp) {
        return date.formatDate(stamp, "YYYY-MM-DD HH:mm:ss");
      };
    },
  },
  watch: {
    needScrollToBottom(newValue) {
      //当向上滑动时，将未读标记指向最后一个
      if (!newValue) {
        this.refNow = this.messagesDom.length - 1;
        this.refCountNow = this.getTextDom().length - 1;
      }
    },
    newMessages(newValue, oldValue) {
      /**
       * 当old为0即首次添加未读信息、
       * 或者当未读信息减少(即向下滚动使得首条未读消息已读)时
       * 变更未读标记为下一个
       */
      if (oldValue == 0 || newValue < oldValue) {
        if (this.refCountNow + 1 == this.getTextDom().length) {
          this.refNow += 1;
          this.refCountNow = 0;
        } else {
          this.refCountNow++;
        }
      }
    },
  },
  methods: {
    getUserInfo(uid) {
      if (this.users.has(uid)) {
        return this.users.get(uid);
      } else return {};
    },
    scrollToTheNew() {
      /**
       * 滚动到第一个未读消息处
       * 将第一个未读消息的顶部与滚动区域顶部对齐
       */
      this.$refs.scroll.setScrollPosition(
        "vertical",
        this.firstNewMessageTop,
        300
      );
    },
    scrollToBottom(delay = 20) {
      this.$refs.scroll.setScrollPercentage("vertical", 1, delay);
    },
    scroll({ verticalPosition, verticalContainerSize }) {
      const containerBottom = verticalPosition + verticalContainerSize;
      /**
       * 当滚动区域和滚动内容的底部对齐(小于1px)时
       * 将自动滚动变为true
       */
      if (
        this.$refs.scroll.getScrollTarget().children[0].offsetHeight -
          containerBottom <
        1
      )
        this.needScrollToBottom = true;
      //当向上滚动时，自动滚动置false
      else if (this.verticalPosition > verticalPosition)
        this.needScrollToBottom = false;
      else if (this.needScrollToBottom) this.scrollToBottom();
      this.verticalPosition = verticalPosition;
      /**
       * 判断是否第一个未读信息的顶部与滚动区域底部对齐
       * 若对齐则使未读消息--
       */
      while (this.newMessages) {
        if (this.firstNewMessageTop < containerBottom) {
          this.newMessages--;
        } else break;
      }
    },
    pushNewMessage(message) {
      let addNewItem = true;
      //判断消息是否和上一个消息合并（是否为同一用户所发 && 间隔不超过10s && 不超过10个消息）
      if (this.messages.length) {
        const lastMessage = this.messages[this.messages.length - 1];
        const diff = date.getDateDiff(
          message.stamp,
          lastMessage.stamp,
          "seconds"
        );
        if (
          message.uid == lastMessage.uid &&
          lastMessage.text.length < 10 &&
          diff < 10
        ) {
          addNewItem = false;
          lastMessage.text.push(...message.text);
          lastMessage.stamp = message.stamp;
        }
      }
      if (addNewItem) {
        this.messages.push(message);
      }
      //当dom渲染完成之后 改变newMessages的值 防止出现因为DOM未渲染使得refNow、refCountNow 修改错误
      this.$nextTick(() => {
        if (this.newMessages || !this.needScrollToBottom) this.newMessages++;
      });
    },
    //采用method ，因为messageDOM为非响应式
    getTextDom() {
      return this.messagesDom[this.refNow].querySelectorAll(".q-message-text");
    },
  },
};
</script>

<style></style>
