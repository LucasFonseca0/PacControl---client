type Actions = 'left' | 'right' | 'up' | 'down'

type LevelsType = {
    ghost: {
      maxGhosts: number
      speed: number
      vulnerableTime: number
    }
  }