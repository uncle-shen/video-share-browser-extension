import videojs from "video.js";

class ChatButton extends videojs.getComponent("button") {
  buildCSSClass() {
    return `vjs-subtitles-button ${super.buildCSSClass()}`;
  }
}

ChatButton.prototype.controlText_ = "聊天";
export default ChatButton;
