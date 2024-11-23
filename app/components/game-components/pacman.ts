export class Pacman implements IPacman {
  static nextId = 0
  id: number
  color: string
  x: number
  y: number
  size: number
  direction: Direction
  map: number[][]
  directionToChangeWhenPossible: Direction | null
  mouthOpenAngle: number
  mouthOpening: boolean
  private spawnPosition: { x: number; y: number }
  private speed: number

  constructor(
    x: number,
    y: number,
    size: number,
    map: number[][],
    speed: number
  ) {
    this.id = Pacman.nextId++
    this.size = size
    this.speed = speed
    const spawnPosition = this.findSpawnPosition(map)
    if (spawnPosition) {
      this.x = spawnPosition.x * this.size + this.size / 2
      this.y = spawnPosition.y * this.size + this.size / 2
      this.spawnPosition = spawnPosition
    } else {
      this.x = 0
      this.y = 0
      this.spawnPosition = { x: 0, y: 0 }
    }
    this.direction = 'right'
    this.map = map
    this.directionToChangeWhenPossible = null
    this.mouthOpenAngle = 0.2
    this.mouthOpening = true
    this.color = this.id === 1 ? 'yellow' : this.getRandomColor()
  }

  private findSpawnPosition(map: number[][]): { x: number; y: number } | null {
    for (const [rowIndex, row] of map.entries()) {
      for (const [colIndex, cell] of row.entries()) {
        if (cell === 5) {
          return { x: colIndex, y: rowIndex }
        }
      }
    }
    return null
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color
    this.updateMouthAngle()
    ctx.beginPath()
    ctx.arc(
      this.x,
      this.y,
      this.size / 2,
      this.mouthOpenAngle * Math.PI + this.getAngleOffset(),
      (2 - this.mouthOpenAngle) * Math.PI + this.getAngleOffset()
    )
    ctx.lineTo(this.x, this.y)
    ctx.fill()
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF'
    const color =
      '#' +
      Array.from(
        { length: 6 },
        () => letters[Math.floor(Math.random() * 16)]
      ).join('')
    return color
  }

  move(): void {
    const step = this.speed
    let newX = this.x
    let newY = this.y

    switch (this.direction) {
      case 'right':
        newX += step
        break
      case 'left':
        newX -= step
        break
      case 'up':
        newY -= step
        break
      case 'down':
        newY += step
        break
    }
    if (!this.checkCollision(newX, newY)) {
      this.x = newX
      this.y = newY
    }

    if (this.directionToChangeWhenPossible) {
      const newDirection = this.directionToChangeWhenPossible
      if (this.checkCollision(newX, newY, newDirection)) return
      this.directionToChangeWhenPossible = null
      this.changeDirection(newDirection)
    }

    this.wrapAround()
  }

  private wrapAround(): void {
    if (this.x > this.map[0].length * this.size) {
      this.x = 0
    } else if (this.x < 0) {
      this.x = this.map[0].length * this.size
    }

    if (this.y > this.map.length * this.size) {
      this.y = 0
    } else if (this.y < 0) {
      this.y = this.map.length * this.size
    }
  }

  private updateMouthAngle(): void {
    const maxOpenAngle = 0.25
    const minOpenAngle = 0.01
    const angleStep = 0.01

    if (this.mouthOpening) {
      this.mouthOpenAngle += angleStep
      if (this.mouthOpenAngle >= maxOpenAngle) {
        this.mouthOpenAngle = maxOpenAngle
        this.mouthOpening = false
      }
    } else {
      this.mouthOpenAngle -= angleStep
      if (this.mouthOpenAngle <= minOpenAngle) {
        this.mouthOpenAngle = minOpenAngle
        this.mouthOpening = true
      }
    }
  }

  checkCollision(newX: number, newY: number, direction?: Direction): boolean {
    const halfSize = this.size / 2
    const tolerance = 0.02 * this.size
    const dir = direction ?? this.direction
    let frontLeftX: number,
      frontLeftY: number,
      frontRightX: number,
      frontRightY: number

    switch (dir) {
      case 'right':
        frontLeftX = newX + halfSize - tolerance
        frontLeftY = newY - halfSize + 1
        frontRightX = newX + halfSize - tolerance
        frontRightY = newY + halfSize - 1
        break
      case 'left':
        frontLeftX = newX - halfSize
        frontLeftY = newY - halfSize + 1
        frontRightX = newX - halfSize
        frontRightY = newY + halfSize - 1
        break
      case 'up':
        frontLeftX = newX - halfSize + 1
        frontLeftY = newY - halfSize
        frontRightX = newX + halfSize - 1
        frontRightY = newY - halfSize
        break
      case 'down':
        frontLeftX = newX - halfSize + 1
        frontLeftY = newY + halfSize - tolerance
        frontRightX = newX + halfSize - 1
        frontRightY = newY + halfSize - tolerance
        break
    }

    const collision1 = this.isWallAtPosition(frontLeftX, frontLeftY)
    const collision2 = this.isWallAtPosition(frontRightX, frontRightY)

    return collision1 || collision2
  }

  private isWallAtPosition(x: number, y: number): boolean {
    const { mapX, mapY } = this.getMapPosition(x, y)
    return this.map[mapY]?.[mapX] === 1
  }

  private getMapPosition(x: number, y: number): { mapX: number; mapY: number } {
    return {
      mapX: Math.floor(x / this.size),
      mapY: Math.floor(y / this.size),
    }
  }

  private getAngleOffset(): number {
    switch (this.direction) {
      case 'right':
        return 0
      case 'left':
        return Math.PI
      case 'up':
        return -Math.PI / 2
      case 'down':
        return Math.PI / 2
      default:
        return 0
    }
  }

  changeDirection(direction: Direction): void {
    if (this.direction === direction) return
    if (!['right', 'left', 'up', 'down'].includes(direction)) return
    let simulatedX = this.x
    let simulatedY = this.y

    switch (direction) {
      case 'right':
        simulatedX += 0.1 * this.size
        break
      case 'left':
        simulatedX -= this.size / 32
        break
      case 'up':
        simulatedY -= this.size / 32
        break
      case 'down':
        simulatedY += 0.1 * this.size
        break
    }

    if (this.checkCollision(simulatedX, simulatedY, direction)) {
      this.directionToChangeWhenPossible = direction
      return
    }

    this.direction = direction
    this.directionToChangeWhenPossible = null
  }

  resetPosition(): void {
    this.x = this.spawnPosition.x * this.size + this.size / 2
    this.y = this.spawnPosition.y * this.size + this.size / 2
    this.direction = 'right'
  }
}
