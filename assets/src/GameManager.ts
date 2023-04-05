import { _decorator, Component, Node, Prefab, CCInteger, instantiate, Label, Vec3 } from 'cc'
const { ccclass, property } = _decorator
import { BLOCK_SIZE, PlayerController } from './PlayerController'

enum BlockType {
  BT_NONE,
  BT_STONE
}
enum GameState {
  GS_INIT,
  GS_PLAYING,
  GS_END
}

@ccclass('GameManager')
export class GameManager extends Component {
  @property({ type: Prefab })
  public boxPrefab: Prefab | null = null

  @property({ type: CCInteger })
  public roadLength: number = 50

  private _road: BlockType[] = []

  @property({ type: Node })
  public startMenu: Node | null = null

  @property({ type: PlayerController })
  public playerCtrl: PlayerController | null = null

  @property({ type: Label })
  public stepsLabel: Label | null = null

  init() {
    if (this.startMenu) {
      this.startMenu.active = true
    }
    this.generateRoad()

    if (this.playerCtrl) {
      this.playerCtrl.setInputActive(false)
      this.playerCtrl.node.setPosition(Vec3.ZERO)
      this.playerCtrl.reset()
    }
  }

  playing() {
    if (this.startMenu) {
      this.startMenu.active = false
    }

    if (this.stepsLabel) {
      this.stepsLabel.string = '0' // 将步数重置为0
    }

    setTimeout(() => {
      //直接设置active会直接开始监听鼠标事件，做了一下延迟处理
      if (this.playerCtrl) {
        this.playerCtrl.setInputActive(true)
      }
    }, 0.1)
  }

  set curState(value: GameState) {
    switch (value) {
      case GameState.GS_INIT:
        this.init()
        break
      case GameState.GS_PLAYING:
        this.playing()
        break
      case GameState.GS_END:
        break
      default:
        break
    }
  }

  start() {
    this.curState = GameState.GS_INIT
    this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this)
  }

  update(deltaTime: number) {}

  generateRoad() {
    this.node.removeAllChildren()
    this._road = []
    this._road.push(BlockType.BT_STONE)

    for (let index = 1; index < this.roadLength; index++) {
      if (this._road[index - 1] === BlockType.BT_NONE) {
        this._road.push(BlockType.BT_STONE)
      } else {
        this._road.push(Math.floor(Math.random() * 2))
      }
    }

    let linkedBlocks = 0
    for (let indey = 0; indey < this._road.length; indey++) {
      if (this._road[indey]) {
        ++linkedBlocks
      }
      if (this._road[indey] == 0) {
        if (linkedBlocks > 0) {
          this.spawnBlockByCount(indey - 1, linkedBlocks)
          linkedBlocks = 0
        }
      }
      if (this._road.length == indey + 1) {
        if (linkedBlocks > 0) {
          this.spawnBlockByCount(indey, linkedBlocks)
          linkedBlocks = 0
        }
      }
    }
  }

  spawnBlockByType(type: BlockType) {
    if (!this.boxPrefab) return null
    if (type === BlockType.BT_STONE) {
      return instantiate(this.boxPrefab)
    }
    return null
  }

  spawnBlockByCount(lastPos: number, count: number) {
    let block: Node | null = this.spawnBlockByType(BlockType.BT_STONE)
    if (block) {
      this.node.addChild(block)
      block.setScale(count, 1, 1)
      block.setPosition((lastPos - (count - 1) * 0.5) * BLOCK_SIZE, -1.5, 0)
    }
  }

  onStartButtonClicked() {
    this.curState = GameState.GS_PLAYING
  }

  onPlayerJumpEnd(moveIndex: number) {
    if (this.stepsLabel) {
      this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex)
    }
    this.checkResult(moveIndex)
  }

  checkResult(moveIndex: number) {
    if (moveIndex < this.roadLength) {
      if (this._road[moveIndex] === BlockType.BT_NONE) {
        this.curState = GameState.GS_INIT
      }
    } else {
      this.curState = GameState.GS_INIT
    }
  }
}
