const routes = [
  {
    path: "/popup",
    component: () => import("src/pages/popup/Popup.vue"),
  },
  {
    path: "/chat",
    component: () => import("src/pages/chat/Chat.vue"),
  },
  {
    path: "/minichat",
    component: () => import("src/pages/mini-chat/MiniChat.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("src/pages/404/Error404.vue"),
  },
];

export default routes;
