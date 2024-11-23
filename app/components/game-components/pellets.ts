export class Pellets implements IPellets {
  private size: number
  private map: number[][]
  private pellets: number[][]
  private powerPellets: { x: number; y: number }[]

  constructor(size: number, map: number[][]) {
    this.size = size
    this.map = map
    this.reset()
  }

  public reset(): void {
    this.pellets = this.map.map((row) => row.map((cell) => (cell === 2 ? 1 : 0)))
    this.powerPellets = this.findPowerPellets()
  }

  public getQuantity(): number {
    return this.pellets.flat().reduce((acc, curr) => acc +
      curr, 0) + this.powerPellets.length
  }

  private findPowerPellets(): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = []

    for (const [i, row] of this.map.entries()) {
      for (const [j, cell] of row.entries()) {
        if (cell === 6) {
          positions.push({ x: j, y: i })
          this.pellets[i][j] = 0
        }
      }
    }

    return positions
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const [i, row] of this.pellets.entries()) {
      for (const [j, cell] of row.entries()) {
        if (cell === 1) {
          ctx.fillStyle = '#FAF17A'
          ctx.beginPath()
          ctx.arc(
            j * this.size + this.size / 2,
            i * this.size + this.size / 2,
            this.size / 10,
            0,
            2 * Math.PI
          )
          ctx.fill()
        }
      }
    }

    for (const position of this.powerPellets) {
      ctx.fillStyle = '#FAF17A'
      ctx.beginPath()
      ctx.arc(
        position.x * this.size + this.size / 2,
        position.y * this.size + this.size / 2,
        this.size / 4,
        0,
        2 * Math.PI
      )
      ctx.fill()
    }
  }

  checkPelletCollision(pacmanX: number, pacmanY: number): 'normal' | 'power' | null {
    const i = Math.floor(pacmanY / this.size)
    const j = Math.floor(pacmanX / this.size)

    const pelletIndex = this.powerPellets.findIndex((pellet) => pellet.x === j && pellet.y === i)
    if (pelletIndex !== -1) {
      this.powerPellets.splice(pelletIndex, 1)
      return 'power'
    }

    if (this.pellets[i][j] === 1) {
      this.pellets[i][j] = 0
      return 'normal'
    }

    return null
  }
}