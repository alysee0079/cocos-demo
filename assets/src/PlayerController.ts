import { _decorator, Component, Node, EventMouse, Vec3, log, Animation } from 'cc'
const { ccclass, property } = _decorator
export const BLOCK_SIZE = 40 // 添加一个放大比
const oneStep = 'oneStep'
const twoStep = 'twoStep'

@ccclass('PlayerController')
export class PlayerController extends Component {
  private _startJump: boolean = false
  private _jumpStep: number = 0
  private _curJumpTime: number = 0
  private _jumpTime: number = 0.3
  private _curJumpSpeed: number = 0
  private _curPos: Vec3 = new Vec3()
  private _deltaPos: Vec3 = new Vec3(0, 0, 0)
  private _targetPos: Vec3 = new Vec3()
  private _curMoveIndex: number = 0

  @property(Animation)
  BodyAnim: Animation = null

  start() {
    // this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this)
  }

  reset() {
    this._curMoveIndex = 0
  }

  setInputActive(active: boolean) {
    if (active) {
      this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this)
    } else {
      this.node.off(Node.EventType.MOUSE_UP, this.onMouseUp, this)
    }
  }

  update(deltaTime: number) {
    if (this._startJump) {
      this._curJumpTime += deltaTime // 累计总的跳跃时间
      if (this._curJumpTime > this._jumpTime) {
        // 当跳跃时间是否结束
        // end
        this.node.setPosition(this._targetPos) // 强制位置到终点
        this._startJump = false // 清理跳跃标记
        this.onOnceJumpEnd()
      } else {
        // tween
        this.node.getPosition(this._curPos)
        this._deltaPos.x = this._curJumpSpeed * deltaTime //每一帧根据速度和时间计算位移
        Vec3.add(this._curPos, this._curPos, this._deltaPos) // 应用这个位移
        this.node.setPosition(this._curPos) // 将位移设置给角色
      }
    }
  }
  onMouseUp(event: EventMouse) {
    if (event.getButton() === 0) {
      this._jumpTime = this.BodyAnim.getState(oneStep).duration
      log(this._jumpTime)
      this.jumpByStep(1)
    } else if (event.getButton() === 2) {
      this._jumpTime = this.BodyAnim.getState(twoStep).duration
      log(this._jumpTime)
      this.jumpByStep(2)
    }
  }
  jumpByStep(step) {
    if (this._startJump) return
    this._startJump = true
    this._jumpStep = step
    this._curJumpTime = 0
    this._curJumpSpeed = (this._jumpStep * BLOCK_SIZE) / this._jumpTime
    this.node.getPosition(this._curPos)
    Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0))
    if (this.BodyAnim) {
      if (step === 1) {
        this.BodyAnim.play(oneStep)
      } else {
        this.BodyAnim.play(twoStep)
      }
    }
    this._curMoveIndex += step
  }

  onOnceJumpEnd() {
    this.node.emit('JumpEnd', this._curMoveIndex)
  }
}
