// Hooks added here have a bridge allowing communication between the BEX Background Script and the BEX Content Script.
// Note: Events sent from this background script using `bridge.send` can be `listen`'d for by all client BEX bridges for this BEX

// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/background-hooks

import { createConnect, getVideoUrl, putVideoUrl } from "utils/http";

import { POST_USER, PUT_USER_ID } from "const/MessageType";
import WebSocketProxy from "utils/WebSocketProxy";

let ws;

const createSocket = (bridge, tab) => {
  chrome.storage.local.get("connectInfo", ({ connectInfo }) => {
    const userInfo = {};
    const { url, avatar, nickname, host } = connectInfo;
    userInfo.avatar = avatar;
    userInfo.nickname = nickname;
    if (ws) {
      ws.close();
      ws = null;
    }
    ws = new WebSocketProxy({
      url,
      disconnect: () => {
        bridge.send("socket.disconnect");
      },
      reconnect: () => {
        console.log("socket.reconnect");
        bridge.send("socket.reconnect");
      },
      connected: () => {
        ws.sendData(POST_USER, userInfo);
        bridge.send("socket.connected");
      },
      onmessage: (m) => {
        if (m.path === PUT_USER_ID) userInfo.id = m.data.id;
        else bridge.send("socket.message", m);
      },
    });
    chrome.tabs.onRemoved.addListener(function tabclose(tabId, removeInfo) {
      console.log("onRemoved", tabId, tab.id);
      if (tabId == tab.id) {
        ws.close();
        ws = null;
        chrome.tabs.onRemoved.removeListener(tabclose);
      }
    });
  });
};

const initApp = (tab) => {
  chrome.tabs.sendMessage(tab.id, { cmd: "initApp" });
};

export default function attachBackgroundHooks(
  bridge /* , allActiveConnections */
) {
  bridge.on("create.connect.server", (event) => {
    const payload = event.data;
    createConnect(payload.url);
    //是否为创建房间
    chrome.storage.local.set({ connectInfo: payload });
    if (payload.host) {
      putVideoUrl(payload.tab.url)
        .then((d) => {
          createSocket(bridge, payload.tab);
          initApp(payload.tab);
          bridge.send(event.eventResponseKey, { success: true });
        })
        .catch((e) => {
          bridge.send(event.eventResponseKey, { success: false });
        });
    } else {
      getVideoUrl()
        .then((d) => {
          chrome.tabs.create({ url: d.url }, (tab) => {
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
              if (info.status === "complete" && tabId === tab.id) {
                createSocket(bridge, tab);
                chrome.tabs.onUpdated.removeListener(listener);
                initApp(tab);
                bridge.send(event.eventResponseKey, {
                  success: true,
                });
              }
            });
          });
        })
        .catch((e) => {
          bridge.send(event.eventResponseKey, { success: false });
        });
    }
  });

  bridge.on("send.socket.message", ({ data, eventResponseKey }) => {
    ws.sendData(data.path, data.data);
    bridge.send(eventResponseKey);
  });
  bridge.on("socket.reconnect", ({ eventResponseKey }) => {
    ws.reconnect();
    bridge.send(eventResponseKey);
  });

  bridge.on("storage.get", (event) => {
    const payload = event.data;
    if (payload.key === null) {
      chrome.storage.local.get(null, (r) => {
        const result = [];
        // Group the items up into an array to take advantage of the bridge's chunk splitting.
        for (const itemKey in r) {
          result.push(r[itemKey]);
        }
        bridge.send(event.eventResponseKey, result);
      });
    } else {
      chrome.storage.local.get([payload.key], (r) => {
        bridge.send(event.eventResponseKey, r[payload.key]);
      });
    }
  });

  bridge.on("storage.set", (event) => {
    const payload = event.data;
    chrome.storage.local.set({ [payload.key]: payload.data }, () => {
      bridge.send(event.eventResponseKey, payload.data);
    });
  });

  bridge.on("storage.remove", (event) => {
    const payload = event.data;
    chrome.storage.local.remove(payload.key, () => {
      bridge.send(event.eventResponseKey, payload.data);
    });
  });

  /*
  // EXAMPLES
  // Listen to a message from the client
  bridge.on('test', d => {
    console.log(d)
  })

  // Send a message to the client based on something happening.
  chrome.tabs.onCreated.addListener(tab => {
    bridge.send('browserTabCreated', { tab })
  })

  // Send a message to the client based on something happening.
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      bridge.send('browserTabUpdated', { tab, changeInfo })
    }
  })
   */
}
