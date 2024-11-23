import { Ghost } from '../components/game-components/ghost'
import { Pacman } from '../components/game-components/pacman'
import { Pellets } from '../components/game-components/pellets'

export const findAvailableSpawnPoints = (map: number[][]) => {
  const spawnPoints: { x: number; y: number }[] = []
  for (const [rowIndex, row] of map.entries()) {
    for (const [colIndex, cell] of row.entries()) {
      if (cell === 4) {
        spawnPoints.push({ x: colIndex, y: rowIndex })
      }
    }
  }
  return spawnPoints
}

export const generateGhosts = (
  numGhosts: number,
  availableSpawnPoints: { x: number; y: number }[],
  ghostSpeed: number,
  vulnerableTime: number,
  blockSize: number,
  map: number[][]
) => {
  const ghostColors = ['red', 'blue', 'orange', 'pink']
  const ghosts: Ghost[] = []

  const spawnPoints = availableSpawnPoints.slice(0, numGhosts)

  for (const [i, spawnPoint] of spawnPoints.entries()) {
    const color = ghostColors[i % ghostColors.length]
    ghosts.push(
      new Ghost(blockSize, map, color, spawnPoint, ghostSpeed, vulnerableTime)
    )
  }

  return ghosts
}

export const initializeGameObjects = (
  blockSize: number,
  map: number[][],
  pacmanSpeed: number,
  ghostSpeed: number,
  vulnerableTime: number,
  maxGhosts: number
) => {
  const pacman = new Pacman(0, 0, blockSize, map, pacmanSpeed)
  const pellets = new Pellets(blockSize, map)
  const availableSpawnPoints = findAvailableSpawnPoints(map)
  const ghosts = generateGhosts(
    maxGhosts,
    availableSpawnPoints,
    ghostSpeed,
    vulnerableTime,
    blockSize,
    map
  )
  return { pacman, pellets, ghosts }
}

export const drawScoreAndLives = (
  ctx: CanvasRenderingContext2D,
  score: number,
  lives: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  ctx.font = '20px "Press Start 2P", Arial'
  ctx.fillStyle = 'white'
  ctx.fillText(`Score: ${score}`, 10, canvasHeight + 30)
  ctx.fillText(`Lives: ${lives}`, canvasWidth - 80, canvasHeight + 30)
}

export const drawGameOver = (
  ctx: CanvasRenderingContext2D,
  score: number,
  bestScore: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  ctx.fillStyle = 'yellow'
  ctx.font = '50px "Press Start 2P", Arial'
  ctx.textAlign = 'center'
  ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 80)

  ctx.fillStyle = 'white'
  ctx.font = '25px "Press Start 2P"'
  ctx.fillText(`Score: ${score}`, canvasWidth / 2, canvasHeight / 2 - 20)
  ctx.fillText(
    `Best Score: ${bestScore}`,
    canvasWidth / 2,
    canvasHeight / 2 + 20
  )

  ctx.fillStyle = 'grey'
  ctx.font = '15px "Press Start 2P", Arial'
  ctx.fillText(
    'Press any button to restart',
    canvasWidth / 2,
    canvasHeight / 2 + 80
  )
}

export const passLevel = ({
  level,
  levels,
  setConfig,
  setLevel,
}: {
  level: number
  levels: LevelsType[]
  setConfig: (config: any) => void
  setLevel: (level: number) => void
}) => {
  if (level < levels.length - 1) {
    setConfig((prev) => ({
      ...prev,
      ...levels[level + 1],
    }))
    setLevel((prev) => prev + 1)
  }
}
