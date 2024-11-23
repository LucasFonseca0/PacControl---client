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
    let rowIndex = 0
    for (const row of map) {
      let colIndex = 0
      for (const cell of row) {
        if (cell === 5) {
          return { x: colIndex, y: rowIndex }
        }
        colIndex++
      }
      rowIndex++
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
    const maxDistance = this.speed
    const distanceToWall = this.calculateDistanceToWall(this.direction)

    const distanceToMove = Math.min(maxDistance, distanceToWall)

    if (distanceToMove > 0) {
      switch (this.direction) {
        case 'right':
          this.x += distanceToMove
          break
        case 'left':
          this.x -= distanceToMove
          break
        case 'up':
          this.y -= distanceToMove
          break
        case 'down':
          this.y += distanceToMove
          break
      }
    }

    this.alignWithGrid()

    if (this.directionToChangeWhenPossible) {
      if (this.canChangeDirection(this.directionToChangeWhenPossible)) {
        this.direction = this.directionToChangeWhenPossible
        this.directionToChangeWhenPossible = null
      }
    }

    this.wrapAround()
  }

  private calculateDistanceToWall(direction: Direction): number {
    const halfSize = this.size / 2
    const tolerance = this.size * 0.01
    let distance = Number.POSITIVE_INFINITY

    switch (direction) {
      case 'right': {
        const edgeX = this.x + halfSize + tolerance
        const yTop = this.y - halfSize + tolerance
        const yBottom = this.y + halfSize - tolerance

        const mapYTop = Math.floor(yTop / this.size)
        const mapYBottom = Math.floor(yBottom / this.size)
        let mapX = Math.floor(edgeX / this.size)

        while (mapX < this.map[0].length) {
          const wallX = mapX * this.size
          const tileTop = this.map[mapYTop]?.[mapX]
          const tileBottom = this.map[mapYBottom]?.[mapX]

          if (tileTop === 1 || tileBottom === 1) {
            distance = wallX - edgeX
            break
          }
          mapX++
        }
        break
      }
      case 'left': {
        const edgeX = this.x - halfSize - tolerance
        const yTop = this.y - halfSize + tolerance
        const yBottom = this.y + halfSize - tolerance

        const mapYTop = Math.floor(yTop / this.size)
        const mapYBottom = Math.floor(yBottom / this.size)
        let mapX = Math.floor(edgeX / this.size)

        while (mapX >= 0) {
          const wallX = (mapX + 1) * this.size
          const tileTop = this.map[mapYTop]?.[mapX]
          const tileBottom = this.map[mapYBottom]?.[mapX]

          if (tileTop === 1 || tileBottom === 1) {
            distance = edgeX - wallX
            break
          }
          mapX--
        }
        break
      }
      case 'up': {
        const edgeY = this.y - halfSize - tolerance
        const xLeft = this.x - halfSize + tolerance
        const xRight = this.x + halfSize - tolerance

        const mapXLeft = Math.floor(xLeft / this.size)
        const mapXRight = Math.floor(xRight / this.size)
        let mapY = Math.floor(edgeY / this.size)

        while (mapY >= 0) {
          const wallY = (mapY + 1) * this.size
          const tileLeft = this.map[mapY]?.[mapXLeft]
          const tileRight = this.map[mapY]?.[mapXRight]

          if (tileLeft === 1 || tileRight === 1) {
            distance = edgeY - wallY
            break
          }
          mapY--
        }
        break
      }
      case 'down': {
        const edgeY = this.y + halfSize + tolerance
        const xLeft = this.x - halfSize + tolerance
        const xRight = this.x + halfSize - tolerance

        const mapXLeft = Math.floor(xLeft / this.size)
        const mapXRight = Math.floor(xRight / this.size)
        let mapY = Math.floor(edgeY / this.size)

        while (mapY < this.map.length) {
          const wallY = mapY * this.size
          const tileLeft = this.map[mapY]?.[mapXLeft]
          const tileRight = this.map[mapY]?.[mapXRight]

          if (tileLeft === 1 || tileRight === 1) {
            distance = wallY - edgeY
            break
          }
          mapY++
        }
        break
      }
    }

    return Math.max(0, distance)
  }

  private canChangeDirection(direction: Direction): boolean {
    const step = this.size * 0.1
    const directionVector = this.getDirectionVector(direction)
    const testX = this.x + directionVector.x * step
    const testY = this.y + directionVector.y * step

    return !this.checkCollision(testX, testY, direction)
  }

  private getDirectionVector(direction: Direction): { x: number; y: number } {
    switch (direction) {
      case 'right':
        return { x: 1, y: 0 }
      case 'left':
        return { x: -1, y: 0 }
      case 'up':
        return { x: 0, y: -1 }
      case 'down':
        return { x: 0, y: 1 }
      default:
        return { x: 0, y: 0 }
    }
  }

  private wrapAround(): void {
    const maxX = this.map[0].length * this.size
    const maxY = this.map.length * this.size

    if (this.x >= maxX) {
      this.x = 0
    } else if (this.x < 0) {
      this.x = maxX - this.size / 2
    }

    if (this.y >= maxY) {
      this.y = 0
    } else if (this.y < 0) {
      this.y = maxY - this.size / 2
    }
  }

  private updateMouthAngle(): void {
    const maxOpenAngle = 0.25
    const minOpenAngle = 0.01
    const angleStep = 0.02

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
    const tolerance = 1
    const dir = direction ?? this.direction

    let frontLeftX: number
    let frontLeftY: number
    let frontRightX: number
    let frontRightY: number

    switch (dir) {
      case 'right':
        frontLeftX = newX + halfSize + tolerance
        frontLeftY = newY - halfSize + tolerance
        frontRightX = newX + halfSize + tolerance
        frontRightY = newY + halfSize - tolerance
        break
      case 'left':
        frontLeftX = newX - halfSize - tolerance
        frontLeftY = newY - halfSize + tolerance
        frontRightX = newX - halfSize - tolerance
        frontRightY = newY + halfSize - tolerance
        break
      case 'up':
        frontLeftX = newX - halfSize + tolerance
        frontLeftY = newY - halfSize - tolerance
        frontRightX = newX + halfSize - tolerance
        frontRightY = newY - halfSize - tolerance
        break
      case 'down':
        frontLeftX = newX - halfSize + tolerance
        frontLeftY = newY + halfSize + tolerance
        frontRightX = newX + halfSize - tolerance
        frontRightY = newY + halfSize + tolerance
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

    if (this.canChangeDirection(direction)) {
      this.alignWithGrid()
      this.direction = direction
      this.directionToChangeWhenPossible = null
    } else {
      this.directionToChangeWhenPossible = direction
    }
  }

  private alignWithGrid(): void {
    if (this.direction === 'left' || this.direction === 'right') {
      this.y =
        Math.round((this.y - this.size / 2) / this.size) * this.size +
        this.size / 2
    } else if (this.direction === 'up' || this.direction === 'down') {
      this.x =
        Math.round((this.x - this.size / 2) / this.size) * this.size +
        this.size / 2
    }
  }

  resetPosition(): void {
    this.x = this.spawnPosition.x * this.size + this.size / 2
    this.y = this.spawnPosition.y * this.size + this.size / 2
    this.direction = 'right'
    this.directionToChangeWhenPossible = null
  }
}
