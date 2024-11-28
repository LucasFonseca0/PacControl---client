import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Pacman } from './game-components/pacman'
import { Pellets } from './game-components/pellets'
import { mapDrawer } from './game-components/map-drawer'
import { Ghost } from './game-components/ghost'
import { defaultPacmanMap } from './maps/pacman-maps'
import { getGameConfig, levels } from '../configs/game.config'
import {
  drawGameOver,
  drawScoreAndLives,
  initializeGameObjects,
  passLevel,
} from '../utils/canvas-utilities'

type Actions = 'left' | 'right' | 'up' | 'down'

interface MyCanvasProps {
  onGameAction?: Actions
}

const MyCanvas: React.FC<MyCanvasProps> = ({ onGameAction }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [config, setConfig] = useState(
    getGameConfig({ pacmanMap: defaultPacmanMap })
  )

  const {
    general: {
      blockSize,
      canvasWidth,
      canvasHeight,
      blankSpace,
      fps,
      lives: initialLives,
    },
    ghost: { maxGhosts, speed: ghostSpeed, vulnerableTime },
    pacman: { speed: pacmanSpeed },
    scoring,
  } = config

  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(initialLives)
  const [bestScore, setBestScore] = useState(() => {
    const savedBestScore = localStorage.getItem('bestScore')
    return savedBestScore ? Number(savedBestScore) : 0
  })

  const livesRef = useRef(lives)
  const scoreRef = useRef(score)
  const bestScoreRef = useRef(bestScore)
  const pacmanRef = useRef<Pacman | null>(null)
  const ghostsRef = useRef<Ghost[]>([])
  const pelletsRef = useRef<Pellets | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const renderRef = useRef<() => void>()

  useEffect(() => {
    bestScoreRef.current = bestScore
  }, [bestScore])

  useEffect(() => {
    livesRef.current = lives
  }, [lives])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const handleCollisions = (
    pacman: Pacman,
    ghosts: Ghost[],
    pellets: Pellets
  ) => {
    for (const ghost of ghosts) {
      if (ghost.checkCollisionWithPacman(pacman.x, pacman.y)) {
        if (ghost.isVulnerable) {
          setScore((prev) => prev + scoring.ghostPoints)
          ghost.startReturningToBase()
        } else if (!ghost.isReturning) {
          setLives((prev) => prev - 1)
          pacman.resetPosition()
          for (const g of ghosts) {
            g.resetPosition()
          }
        }
      }
    }

    const pelletConsumed = pellets.checkPelletCollision(pacman.x, pacman.y)
    if (pelletConsumed) {
      const points =
        pelletConsumed === 'power' ? scoring.powerPellet : scoring.normalPellet
      setScore((prev) => prev + points)
      if (pelletConsumed === 'power') {
        for (const ghost of ghosts) {
          ghost.makeVulnerable()
        }
      }
    }
  }

  const handleGameOver = (
    ctx: CanvasRenderingContext2D,
    setLevel: (level: number) => void
  ) => {
    if (scoreRef.current > bestScoreRef.current) {
      setBestScore(scoreRef.current)
      bestScoreRef.current = scoreRef.current
      localStorage.setItem('bestScore', String(scoreRef.current))
    }

    setLevel(1)

    drawGameOver(
      ctx,
      scoreRef.current,
      bestScoreRef.current,
      canvasWidth,
      canvasHeight
    )
    animationFrameIdRef.current = null
  }

  const resetGame = () => {
    setLives(initialLives)
    setScore(0)
    livesRef.current = initialLives
    scoreRef.current = 0
    bestScoreRef.current = bestScore
    pacmanRef.current?.resetPosition()

    for (const ghost of ghostsRef.current) {
      ghost.resetPosition()
      ghost.isVulnerable = false
      ghost.isReturning = false
    }

    pelletsRef.current?.reset()

    if (animationFrameIdRef.current === null && renderRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(renderRef.current)
    }
  }

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    const pacman = pacmanRef.current
    const ghosts = ghostsRef.current
    const pellets = pelletsRef.current

    if (ctx && pacman && ghosts && pellets) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      mapDrawer({
        pacmanMap: defaultPacmanMap,
        blankSpace,
        blockSize,
        ctx,
      })

      pellets.draw(ctx)

      const returningGhosts = ghosts.filter((ghost) => ghost.isReturning)
      const activeGhosts = ghosts.filter((ghost) => !ghost.isReturning)

      for (const ghost of returningGhosts) {
        ghost.move(pacman.x, pacman.y)
        ghost.draw(ctx)
      }

      for (const ghost of activeGhosts) {
        ghost.move(pacman.x, pacman.y)
        ghost.draw(ctx)
      }

      pellets.getQuantity() === 0 &&
        passLevel({
          level,
          levels,
          setConfig,
          setLevel,
        })

      pacman.move()
      pacman.draw(ctx)

      handleCollisions(pacman, ghosts, pellets)

      drawScoreAndLives(
        ctx,
        scoreRef.current,
        livesRef.current,
        canvasWidth,
        canvasHeight
      )

      if (livesRef.current > 0) {
        animationFrameIdRef.current = requestAnimationFrame(render)
      } else {
        handleGameOver(ctx, setLevel)
      }
    }
  }, [
    blankSpace,
    blockSize,
    canvasHeight,
    canvasWidth,
    scoring.ghostPoints,
    scoring.normalPellet,
    scoring.powerPellet,
    bestScore,
  ])

  useEffect(() => {
    const { pacman, pellets, ghosts } = initializeGameObjects(
      blockSize,
      defaultPacmanMap,
      pacmanSpeed,
      ghostSpeed,
      vulnerableTime,
      maxGhosts
    )

    pacmanRef.current = pacman
    pelletsRef.current = pellets
    ghostsRef.current = ghosts

    renderRef.current = render

    let lastTime = 0
    const interval = 1000 / fps

    const frameController = (time: number) => {
      if (time - lastTime >= interval) {
        render()
        lastTime = time
      } else {
        animationFrameIdRef.current = requestAnimationFrame(frameController)
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(frameController)

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [
    blockSize,
    defaultPacmanMap,
    fps,
    ghostSpeed,
    vulnerableTime,
    pacmanSpeed,
    render,
    maxGhosts,
  ])

  useEffect(() => {
    if (onGameAction) {
      if (livesRef.current > 0 && pacmanRef.current) {
        pacmanRef.current.changeDirection(onGameAction)
      } else if (livesRef.current <= 0) {
        resetGame()
      }
    }
  }, [onGameAction, initialLives, bestScore])

  return (
    <div>
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: canvasWidth,
        }}
      >
        <span>Score: {score}</span>
        <span>Lives: {lives}</span>
        <span>Level: {level}</span>
      </div>
    </div>
  )
}

export default MyCanvas
