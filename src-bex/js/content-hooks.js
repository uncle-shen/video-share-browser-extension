// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

//quasar带的bridge无法定向通信
import "./content-boot";

export default function attachContentHooks(bridge) {}
