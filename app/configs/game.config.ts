const blockSize = 28
export const getGameConfig = ({ pacmanMap }: { pacmanMap: number[][] }) => {
  const gameConfig = {
    general: {
      blockSize,
      canvasWidth: blockSize * pacmanMap[0].length,
      canvasHeight: blockSize * pacmanMap.length,
      blankSpace: blockSize * 0.7,
      fps: 60,
      lives: 3,
    },
    ghost: {
      maxGhosts: 4,
      speed: blockSize / 32,
      vulnerableTime: 600,
    },
    pacman: {
      speed: 2, // max: 4
    },
    scoring: {
      normalPellet: 10,
      powerPellet: 50,
      ghostPoints: 200,
    },
  }

  return gameConfig
}



export const levels = [
  {
    ghost: {
      maxGhosts: 4,
      speed: blockSize / 32,
      vulnerableTime: 600,
    },
  },
  {
    ghost: {
      maxGhosts: 4,
      speed: blockSize / 30,
      vulnerableTime: 550,
    },
  },
  {
    ghost: {
      maxGhosts: 4,
      speed: blockSize / 28,
      vulnerableTime: 500,
    },
  },
  {
    ghost: {
      maxGhosts: 5,
      speed: blockSize / 26,
      vulnerableTime: 450,
    },
  },
  {
    ghost: {
      maxGhosts: 5,
      speed: blockSize / 24,
      vulnerableTime: 400,
    },
  },
  {
    ghost: {
      maxGhosts: 5,
      speed: blockSize / 22,
      vulnerableTime: 350,
    },
  },
  {
    ghost: {
      maxGhosts: 5,
      speed: blockSize / 20,
      vulnerableTime: 300,
    },
  },
  {
    ghost: {
      maxGhosts: 6,
      speed: blockSize / 18,
      vulnerableTime: 250,
    },
  },
  {
    ghost: {
      maxGhosts: 6,
      speed: blockSize / 16,
      vulnerableTime: 200,
    },
  },
  {
    ghost: {
      maxGhosts: 6,
      speed: blockSize / 14,
      vulnerableTime: 150,
    },
  },
] as LevelsType[]
