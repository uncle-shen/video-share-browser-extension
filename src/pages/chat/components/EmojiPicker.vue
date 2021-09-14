<template>
  <span style="width: 36px" class="vs-emoji-pick text-black">
    {{ emoji[0].emoji[0] }}
    <q-popup-proxy
      ref="emojiPicker"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <div class="column no-wrap" style="height: 528px; width: 300px">
        <q-tab-panels class="col" v-model="emojiTab" swipeable animated>
          <q-tab-panel
            class="q-pa-none"
            v-for="e in emoji"
            :key="e.key"
            :name="e.key"
          >
            <q-scroll-area :thumb-style="thumbStyle" class="full-height">
              <div class="row wrap text-h5">
                <span
                  @click="pickEmoji(ee)"
                  class="q-pa-sm col-2"
                  v-for="ee in e.emoji"
                  :key="ee"
                  >{{ ee }}</span
                >
              </div>
            </q-scroll-area>
          </q-tab-panel>
        </q-tab-panels>

        <q-tabs
          v-model="emojiTab"
          class="bg-grey-3 col-auto font-24px"
          align="justify"
          narrow-indicator
        >
          <q-tab
            v-for="e in emoji"
            :key="e.key"
            :name="e.key"
            :label="e.emoji[0]"
          />
        </q-tabs>
      </div>
    </q-popup-proxy>
  </span>
</template>

<script>
import emoji from "const/emoji";

export default {
  name: "emojiPicker",
  data() {
    return {
      emoji,
      emojiTab: "face",
      thumbStyle: {
        right: "2px",
        borderRadius: "5px",
        backgroundColor: "#027be3",
        width: "5px",
        opacity: 0.75,
      },
    };
  },
  created() {
    this.$q.bex.send("storage.get", { key: "recentEmoji" }).then(({ data }) => {
      if (data) {
        this.emoji.unshift(data);
        this.emojiTab = "recent";
      }
    });
  },
  methods: {
    pickEmoji(emoji) {
      if (this.emoji[0].key != "recent")
        this.emoji.unshift({
          key: "recent",
          emoji: [emoji],
        });
      else {
        const emojiIndex = this.emoji[0].emoji.indexOf(emoji);
        if (emojiIndex != -1) this.emoji[0].emoji.splice(emojiIndex, 1);
        this.emoji[0].emoji.unshift(emoji);
        if (this.emoji[0].emoji.length > 60) this.emoji[0].emoji.pop();
      }
      this.$q.bex.send("storage.set", {
        key: "recentEmoji",
        data: this.emoji[0],
      });
      this.$refs.emojiPicker.hide();
      this.emojiTab = "recent";
      this.$emit("pick-emoji", emoji);
    },
  },
};
</script>

<style scoped>
span {
  cursor: pointer;
  user-select: none;
}

.vs-emoji-pick {
  width: 36px;
  text-align: center;
}

.font-24px {
  font-size: 24px;
}
</style>
