interface MapDrawerProps {
  pacmanMap: number[][]
  ctx: CanvasRenderingContext2D
  blockSize: number
  blankSpace: number
}

export const mapDrawer = ({
  pacmanMap,
  ctx,
  blockSize,
  blankSpace,
}: MapDrawerProps) => {
  const offset = (blockSize - blankSpace) / 2

  let i = 0
  for (const row of pacmanMap) {
    let j = 0
    for (const cell of row) {
      ctx.fillStyle = cell === 1 ? 'blue' : 'black'
      ctx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize)

      if (cell === 1 && row[j - 1] === 1) {
        ctx.fillStyle = 'black'
        ctx.fillRect(
          j * blockSize - offset,
          i * blockSize + offset,
          blockSize,
          blankSpace
        )
      }
      if (cell === 1 && row[j + 1] === 1) {
        ctx.fillStyle = 'black'
        ctx.fillRect(
          j * blockSize + offset,
          i * blockSize + offset,
          blockSize,
          blankSpace
        )
      }
      if (cell === 1 && pacmanMap[i - 1] && pacmanMap[i - 1][j] === 1) {
        ctx.fillStyle = 'black'
        ctx.fillRect(
          j * blockSize + offset,
          i * blockSize - offset,
          blankSpace,
          blockSize
        )
      }
      if (cell === 1 && pacmanMap[i + 1] && pacmanMap[i + 1][j] === 1) {
        ctx.fillStyle = 'black'
        ctx.fillRect(
          j * blockSize + offset,
          i * blockSize + offset,
          blankSpace,
          blockSize
        )
      }
      if (cell === 3) {
        ctx.fillStyle = 'pink'
        ctx.beginPath()
        ctx.fillRect(
          j * blockSize,
          i * blockSize + blockSize / 2 - blockSize / 8,
          blockSize,
          offset
        )
      }
      j++
    }
    i++
  }
}
