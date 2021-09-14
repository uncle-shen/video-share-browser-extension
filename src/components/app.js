import { createApp } from "vue";

import App from "pages/application/App";

export default (el, data) =>
  createApp(App)
    .use((app, { videoEl }) => {
      app.provide("videoEl", videoEl);
    }, data)
    .mount(el);
