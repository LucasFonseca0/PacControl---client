interface IPacman {
  draw(ctx: CanvasRenderingContext2D): void
  move(): void
  changeDirection(direction: string): void
  checkCollision(newX: number, newY: number, direction?: Direction): boolean
}

type Direction = 'right' | 'left' | 'up' | 'down'

interface IPellets {
  draw(ctx: CanvasRenderingContext2D): void
  checkPelletCollision(pacmanX: number, pacmanY: number): void
  reset(): void
  getQuantity(): number
}

interface mapDrawerProps {
  pacmanMap: number[][]
  ctx: CanvasRenderingContext2D
  blank_space: number
  blockSize: number
}

interface IGhost {
  draw(ctx: CanvasRenderingContext2D): void
  move(pacmanX: number, pacmanY: number): void
}
