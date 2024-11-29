export class Ghost implements IGhost {
  static nextId = 0
  id: number
  x: number
  y: number
  size: number
  halfSize: number
  stepSize: number
  color: string
  direction: Direction
  map: number[][]
  frame: number
  isVulnerable: boolean
  vulnerableTimer: number
  isReturning: boolean
  sprite: HTMLImageElement
  sprite2: HTMLImageElement
  chaseRadius: number
  stepsInSameDirection: number
  randomMoveCounter: number
  stuckCounter: number
  basePosition: { x: number; y: number }
  spawnPoint: { x: number; y: number }
  vulnerableTime: number

  constructor(
    size: number,
    map: number[][],
    color: string,
    spawnPoint: { x: number; y: number },
    stepSize: number,
    vulnerableTime: number
  ) {
    this.id = Ghost.nextId++
    this.size = size
    this.halfSize = size / 2
    this.stepSize = stepSize
    this.map = map
    this.direction = 'right'
    this.color = color
    this.frame = 0
    this.isVulnerable = false
    this.vulnerableTimer = 0
    this.isReturning = false
    this.sprite = new Image()
    this.sprite.src = '/ghosts-sprites.png'
    this.sprite2 = new Image()
    this.sprite2.src = '/pacman-sprites.png'
    this.chaseRadius = 5 * this.size
    this.stepsInSameDirection = 0
    this.randomMoveCounter = 0
    this.stuckCounter = 0
    this.spawnPoint = spawnPoint
    this.x = spawnPoint.x * this.size + this.halfSize
    this.y = spawnPoint.y * this.size + this.halfSize
    this.basePosition = this.findBasePosition()
    this.vulnerableTime = vulnerableTime
  }

  private findBasePosition(): { x: number; y: number } {
    let rowIndex = 0
    for (const row of this.map) {
      let colIndex = 0
      for (const cell of row) {
        if (cell === 4) {
          return { x: colIndex, y: rowIndex }
        }
        colIndex++
      }
      rowIndex++
    }
    return { x: 0, y: 0 }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.isReturning) {
      this.drawReturningGhost(ctx)
    } else {
      this.drawNormalGhost(ctx)
    }
    this.frame = (this.frame + 1) % 60
  }

  private drawReturningGhost(ctx: CanvasRenderingContext2D): void {
    const totalColumns = 42
    const totalRows = 15
    const spriteWidth = this.sprite2.width / totalColumns
    const spriteHeight = this.sprite2.height / totalRows
    const spriteY = 5
    const directionSpriteXMap: Record<Direction, number> = {
      right: 36,
      left: 37,
      up: 38,
      down: 39,
    }
    const spriteX = directionSpriteXMap[this.direction] || 36
    const sourceX = spriteX * spriteWidth
    const sourceY = spriteY * spriteHeight

    ctx.drawImage(
      this.sprite2,
      sourceX,
      sourceY,
      spriteWidth,
      spriteHeight,
      this.x - this.halfSize,
      this.y - this.halfSize,
      this.size,
      this.size
    )
  }

  private drawNormalGhost(ctx: CanvasRenderingContext2D): void {
    const totalColumns = 8
    const totalRows = 7
    const spriteWidth = this.sprite.width / totalColumns
    const spriteHeight = this.sprite.height / totalRows
    const spacingY = spriteHeight / 14
    const spacingX = spriteWidth / 14 - 4

    let spriteXBase: number
    let spriteY: number

    if (this.isVulnerable) {
      spriteXBase = this.frame < 30 ? 0 : 1
      spriteY = 4
    } else {
      const colorSpriteXMap: Record<string, number> = {
        red: 0,
        pink: 2,
        blue: 4,
        orange: 6,
      }
      spriteXBase = colorSpriteXMap[this.color] || 0

      const directionOffsets: Record<
        Direction,
        { spriteY: number; offsetX: number }
      > = {
        up: { spriteY: this.frame < 30 ? 0 : 1, offsetX: 1 },
        down: { spriteY: this.frame < 30 ? 0 : 1, offsetX: 0 },
        left: { spriteY: this.frame < 30 ? 2 : 3, offsetX: 0 },
        right: { spriteY: this.frame < 30 ? 2 : 3, offsetX: 1 },
      }

      const directionOffset = directionOffsets[this.direction]
      spriteY = directionOffset.spriteY
      spriteXBase += directionOffset.offsetX
    }

    const sourceX = Math.floor(
      spriteXBase * spriteWidth +
        (spriteXBase > 0 && spriteXBase < totalColumns
          ? spriteY % 1 === 0
            ? spacingX
            : -spacingX
          : 0)
    )
    const sourceY = Math.floor(
      spriteY * spriteHeight +
        (spriteY > 0 && spriteY < totalRows
          ? spriteY % 1 === 0
            ? spacingY
            : -spacingY
          : 0)
    )

    ctx.drawImage(
      this.sprite,
      sourceX,
      sourceY,
      spriteWidth,
      spriteHeight,
      this.x - this.halfSize,
      this.y - this.halfSize,
      this.size,
      this.size
    )
  }

  move(pacmanX: number, pacmanY: number): void {
    if (this.isVulnerable) {
      this.handleVulnerability(pacmanX, pacmanY)
    } else if (this.isReturning) {
      this.moveToBase()
    } else if (this.isInChaseRange(pacmanX, pacmanY)) {
      this.chasePacman(pacmanX, pacmanY)
    } else {
      this.moveRandomly()
    }
    this.wrapAround()
  }

  private handleVulnerability(pacmanX: number, pacmanY: number): void {
    this.vulnerableTimer--
    if (this.vulnerableTimer <= 0) {
      this.isVulnerable = false
    }
    this.runAwayFromPacman(pacmanX, pacmanY)
  }

  makeVulnerable(): void {
    this.isVulnerable = true
    this.vulnerableTimer = this.vulnerableTime
  }

  startReturningToBase(): void {
    this.isVulnerable = false
    this.isReturning = true
  }

  resetPosition(): void {
    this.x = this.spawnPoint.x * this.size + this.halfSize
    this.y = this.spawnPoint.y * this.size + this.halfSize
    this.direction = 'right'
    this.isReturning = false
    this.isVulnerable = false
    this.vulnerableTimer = 0
  }

  checkCollisionWithPacman(pacmanX: number, pacmanY: number): boolean {
    const collisionRadius = this.size * 0.75
    const distance = Math.hypot(pacmanX - this.x, pacmanY - this.y)
    return distance < collisionRadius
  }

  private isInChaseRange(pacmanX: number, pacmanY: number): boolean {
    const distance = Math.hypot(pacmanX - this.x, pacmanY - this.y)
    return distance <= this.chaseRadius
  }

  private runAwayFromPacman(pacmanX: number, pacmanY: number): void {
    if (this.isNearIntersection()) {
      const oppositeDirection = this.getOppositeDirection(this.direction)
      const validDirections = this.getValidDirections().filter(
        (dir) => dir !== oppositeDirection
      )

      if (validDirections.length > 0) {
        validDirections.sort((a, b) => {
          const distanceA = this.getDistanceInDirection(a, pacmanX, pacmanY)
          const distanceB = this.getDistanceInDirection(b, pacmanX, pacmanY)
          return distanceB - distanceA
        })
        this.alignWithGrid()
        this.moveInDirection(validDirections[0])
      } else {
        if (!this.checkCollisionInDirection(this.direction)) {
          this.moveInDirection(this.direction)
        }
      }
    } else {
      if (!this.checkCollisionInDirection(this.direction)) {
        this.moveInDirection(this.direction)
      } else {
        const validDirections = this.getValidDirections().filter(
          (dir) => dir !== this.getOppositeDirection(this.direction)
        )
        if (validDirections.length > 0) {
          this.moveInDirection(validDirections[0])
        }
      }
    }
  }

  private moveToBase(): void {
    const start = this.getMapPosition(this.x, this.y)
    const target = this.findNearestBasePosition()
    const path = this.findPath(start, target)

    if (path && path.length > 0) {
      const nextMove = path[0]

      if (this.isNearIntersection()) {
        if (this.canTurn(nextMove)) {
          this.alignWithGrid()
          this.moveInDirection(nextMove)
        } else {
          this.continueMoving()
        }
      } else {
        this.continueMoving()
      }
    } else {
      this.changeDirectionRandomly()
    }

    if (this.isAtBase(target)) {
      this.isReturning = false
    }
  }

  private chasePacman(pacmanX: number, pacmanY: number): void {
    const start = this.getMapPosition(this.x, this.y)
    const target = this.getMapPosition(pacmanX, pacmanY)
    const path = this.findPath(start, target)

    if (path && path.length > 0) {
      const nextMove = path[0]

      if (this.isNearIntersection()) {
        this.alignWithGrid()

        if (!this.checkCollisionForDirection(nextMove)) {
          this.moveInDirection(nextMove)
        } else {
          this.stuckCounter++
          if (this.stuckCounter > 5) {
            this.changeDirectionRandomly()
            this.stuckCounter = 0
          }
        }
      } else {
        this.continueMoving()
      }
    } else {
      this.changeDirectionRandomly()
    }
  }

  private moveRandomly(): void {
    this.randomMoveCounter++

    const { x: newX, y: newY } = this.getNewPosition(this.direction)

    if (this.randomMoveCounter % 30 === 0 || this.stepsInSameDirection > 15) {
      this.changeDirectionRandomly()
      this.stepsInSameDirection = 0
    }

    if (!this.checkCollision(newX, newY)) {
      this.x = newX
      this.y = newY
      this.stepsInSameDirection++
    } else {
      this.stepsInSameDirection = 0
      this.changeDirectionRandomly()
    }
  }

  private continueMoving(): void {
    const { x: newX, y: newY } = this.getNewPosition(this.direction)

    if (!this.checkCollision(newX, newY)) {
      this.x = newX
      this.y = newY
    } else {
      this.changeDirectionRandomly()
    }
  }

  private changeDirectionRandomly(): void {
    const validDirections = this.getValidDirections().filter(
      (dir) => dir !== this.getOppositeDirection(this.direction)
    )

    if (validDirections.length > 0) {
      const newDirection =
        validDirections[Math.floor(Math.random() * validDirections.length)]
      this.moveInDirection(newDirection)
    }
  }

  private moveInDirection(direction: Direction): void {
    const { x: newX, y: newY } = this.getNewPosition(direction)

    if (!this.checkCollision(newX, newY)) {
      this.x = newX
      this.y = newY
      this.direction = direction
    }
  }

  private getValidDirections(): Direction[] {
    const directions: Direction[] = ['up', 'down', 'left', 'right']
    return directions.filter((dir) => !this.checkCollisionInDirection(dir))
  }

  private getDistanceInDirection(
    direction: Direction,
    targetX: number,
    targetY: number
  ): number {
    const { x: newX, y: newY } = this.getNewPosition(direction)
    return Math.hypot(newX - targetX, newY - targetY)
  }

  private getNewPosition(direction: Direction): { x: number; y: number } {
    const directionVectors: Record<Direction, { x: number; y: number }> = {
      right: { x: this.stepSize, y: 0 },
      left: { x: -this.stepSize, y: 0 },
      up: { x: 0, y: -this.stepSize },
      down: { x: 0, y: this.stepSize },
    }
    const vector = directionVectors[direction]
    return { x: this.x + vector.x, y: this.y + vector.y }
  }

  private getOppositeDirection(direction: Direction): Direction {
    const oppositeDirections: Record<Direction, Direction> = {
      right: 'left',
      left: 'right',
      up: 'down',
      down: 'up',
    }
    return oppositeDirections[direction]
  }

  private isNearIntersection(): boolean {
    const tolerance = this.stepSize *0.01
    const remainderX = Math.abs((this.x % this.size) - this.halfSize)
    const remainderY = Math.abs((this.y % this.size) - this.halfSize)
    return remainderX < tolerance && remainderY < tolerance
  }

  private alignWithGrid(): void {
    this.x =
      Math.round((this.x - this.halfSize) / this.size) * this.size +
      this.halfSize
    this.y =
      Math.round((this.y - this.halfSize) / this.size) * this.size +
      this.halfSize
  }

  private canTurn(direction: Direction): boolean {
    return !this.checkCollisionForDirection(direction)
  }

  private checkCollisionInDirection(direction: Direction): boolean {
    const { x: newX, y: newY } = this.getNewPosition(direction)
    return this.checkCollision(newX, newY)
  }

  private checkCollisionForDirection(direction: Direction): boolean {
    const { x: newX, y: newY } = this.getNewPosition(direction)
    return this.checkCollision(newX, newY)
  }

  private findNearestBasePosition(): { mapX: number; mapY: number } {
    const basePositions: { x: number; y: number }[] = []

    this.map.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 4) {
          basePositions.push({ x: colIndex, y: rowIndex })
        }
      })
    })

    let nearestPosition = basePositions[0]
    let minDistance = Number.POSITIVE_INFINITY

    for (const position of basePositions) {
      const distance = Math.hypot(
        position.x * this.size + this.halfSize - this.x,
        position.y * this.size + this.halfSize - this.y
      )
      if (distance < minDistance) {
        minDistance = distance
        nearestPosition = position
      }
    }

    return { mapX: nearestPosition.x, mapY: nearestPosition.y }
  }

  private isAtBase(target: { mapX: number; mapY: number }): boolean {
    const { mapX, mapY } = this.getMapPosition(this.x, this.y)
    return mapX === target.mapX && mapY === target.mapY
  }

  private findPath(
    start: { mapX: number; mapY: number },
    target: { mapX: number; mapY: number }
  ): Direction[] {
    const directions: Direction[] = ['up', 'down', 'left', 'right']
    const directionVectors = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    }

    const openList = [
      { x: start.mapX, y: start.mapY, cost: 0, path: [] as Direction[] },
    ]
    const closedList: Set<string> = new Set()

    const manhattanDistance = (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ) => Math.abs(x1 - x2) + Math.abs(y1 - y2)

    const maxIterations = 1000
    let iterations = 0

    while (openList.length > 0 && iterations < maxIterations) {
      iterations++
      const current = openList.shift()
      if (!current) continue

      if (current.x === target.mapX && current.y === target.mapY) {
        return current.path
      }

      closedList.add(`${current.x},${current.y}`)

      for (const direction of directions) {
        const vector = directionVectors[direction]
        const newX = current.x + vector.x
        const newY = current.y + vector.y
        const positionKey = `${newX},${newY}`

        if (
          closedList.has(positionKey) ||
          this.map[newY]?.[newX] === 1 ||
          this.map[newY]?.[newX] === undefined
        ) {
          continue
        }

        const cost =
          current.cost +
          1 +
          manhattanDistance(newX, newY, target.mapX, target.mapY)
        openList.push({
          x: newX,
          y: newY,
          cost,
          path: [...current.path, direction],
        })
      }

      openList.sort((a, b) => a.cost - b.cost)
    }

    return []
  }

  private checkCollision(newX: number, newY: number): boolean {
    const tolerance = 0.01 * this.size

    const positions = [
      {
        x: newX - this.halfSize + tolerance,
        y: newY - this.halfSize + tolerance,
      },
      {
        x: newX + this.halfSize - tolerance,
        y: newY - this.halfSize + tolerance,
      },
      {
        x: newX - this.halfSize + tolerance,
        y: newY + this.halfSize - tolerance,
      },
      {
        x: newX + this.halfSize - tolerance,
        y: newY + this.halfSize - tolerance,
      },
    ]

    return positions.some(({ x, y }) => this.isWallAtPosition(x, y))
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

  private wrapAround(): void {
    const maxX = this.map[0].length * this.size
    const maxY = this.map.length * this.size

    if (this.x > maxX) {
      this.x = 0
    } else if (this.x < 0) {
      this.x = maxX
    }

    if (this.y > maxY) {
      this.y = 0
    } else if (this.y < 0) {
      this.y = maxY
    }
  }
}
