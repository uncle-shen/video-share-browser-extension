import videojs from "video.js";

class SynButton extends videojs.getComponent("Button") {
  buildCSSClass() {
    return `vjs-syn-button ${super.buildCSSClass()}`;
  }
}

SynButton.prototype.controlText_ = "同步";
export default SynButton;
