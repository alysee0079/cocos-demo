import { _decorator, Component, Node, input, Input } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
  start() {
    // input.on(Input.EventType.MOUSE_UP);
  }

  update(deltaTime: number) {}
}
