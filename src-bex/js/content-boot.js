import createApp from "src/components/app";
import {
  getElementPosition,
  getElementWidthHeight,
  createCover,
} from "utils/domUtil";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const AppId = "vs-app";
  if (request.cmd == "initApp") initApp(AppId);
});

const initApp = (AppId) => {
  if (document.getElementById(AppId)) return;
  const body = document.body,
    App = document.createElement("div");
  App.id = AppId;
  body.appendChild(App);
  const indicators = new Set();
  const indicatorContainer = document.createElement("div");
  const refreshButton = document.createElement("button");
  refreshButton.innerHTML = `重新检测`;
  refreshButton.className = "vs-refresh";

  indicatorContainer.appendChild(refreshButton);
  const helpDiv = document.createElement("div");
  helpDiv.className = "vs-help";
  helpDiv.innerHTML = `<p>请选择你要共享的视频连接</p><p>如果没有检测到你想要共享的视频，可以点击右上角重新检测</p>`;
  helpDiv.onmouseenter = () => {
    helpDiv.classList.add("vs-help-invisible");
  };
  helpDiv.onmouseleave = () => {
    helpDiv.classList.remove("vs-help-invisible");
  };
  const indicatorClickEvent = (el) => {
    return (e) => {
      e.stopPropagation();
      body.style.overflow = "hidden";
      body.removeChild(indicatorContainer);
      createApp("#" + AppId, { videoEl: el });
    };
  };
  refreshButton.onclick = () => {
    detectVideo(indicatorContainer, indicators, indicatorClickEvent);
  };
  detectVideo(indicatorContainer, indicators, indicatorClickEvent);

  indicatorContainer.appendChild(helpDiv);
  body.appendChild(indicatorContainer);
};

const detectVideo = (container, indicators, indicatorClickEvent) => {
  const videos = document.querySelectorAll("video");
  videos.forEach((el) => {
    if (indicators.has(el) || el.readyState < 3) return;
    const { left, top } = getElementPosition(el);
    const { width, height } = getElementWidthHeight(el);
    const coverDiv = createCover(
      { left, top, width, height },
      "vs-selected-box"
    );
    coverDiv.addEventListener("click", indicatorClickEvent(el));
    container.appendChild(coverDiv);
    indicators.add(el);
  });
};
