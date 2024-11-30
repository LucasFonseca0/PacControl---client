'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode.react'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'
import MyCanvas from '../components/Canvas'
import { ArcadeBackground } from '../components/ArcadeBackground'

type Actions = 'left' | 'right' | 'up' | 'down'

const MobileMessage = () => (
  <div className="flex flex-col items-center justify-center min-h-80">
    <h1 className="text-2xl font-bold mb-4 text-white">
      Please use a device with a larger screen to access this content.
    </h1>
  </div>
)

const ServerStarting = ({ timeRemaining }: { timeRemaining: number }) => (
  <div className="text-center min-h-[60vh] flex flex-col items-center justify-center p-20">
    <h1 className="text-2xl font-bold mb-4 text-white">
      The server is starting up, please wait...
    </h1>
    <p className="text-white mb-4">
      The server is hosted on Render's free tier, so it's common for it to sleep
      until it receives a request.
    </p>
    <p className="text-white mb-4">Estimated time: {timeRemaining} seconds</p>
  </div>
)

const QRCodeDisplay = ({ value }: { value: string }) => (
  <div className="text-center min-h-[60vh] flex flex-col items-center justify-center p-20">
    <h1 className="text-2xl font-bold mb-4 text-white">
      Scan the QR Code to start the game
    </h1>
    <QRCode value={value} className="m-auto border-2" size={300} />
  </div>
)

const GameCanvas = ({ onGameAction }: { onGameAction: Actions }) => (
  <div className="text-center">
    <MyCanvas onGameAction={onGameAction} />
  </div>
)

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [sessionId] = useState(uuidv4())
  const [gameAction, setGameAction] = useState<Actions>('right')
  const [serverStarting, setServerStarting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(30)

  const reconnectInterval = useRef<NodeJS.Timeout | null>(null)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)
  const timeLeftRef = useRef(30)

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL as string
  const clientURL = process.env.NEXT_PUBLIC_CLIENT_URL as string

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth <= 760)
    }

    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
    return () => {
      window.removeEventListener('resize', updateIsMobile)
    }
  }, [])

  useEffect(() => {
    const newSocket = io(serverURL, {
      query: { sessionId },
      withCredentials: true,
      transports: ['websocket'],
      reconnection: false,
    })

    const clearReconnectInterval = () => {
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current)
        reconnectInterval.current = null
      }
    }

    const clearTimerInterval = () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
        timerInterval.current = null
      }
    }

    newSocket.on('connect', () => {
      console.log('Connected with ID:', sessionId)
      console.log('Link:', `${clientURL}/remote/${sessionId}`)
      setServerStarting(false)
      clearReconnectInterval()
      clearTimerInterval()
    })

    newSocket.on('gameStarted', () => {
      setGameStarted(true)
    })

    newSocket.on('gameAction', (data: Actions) => {
      setGameAction(data)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    newSocket.on('connect_error', (err: Error) => {
      console.log('Connection error:', err)
      setServerStarting(true)
      timeLeftRef.current = 30
      setTimeRemaining(timeLeftRef.current)

      if (!reconnectInterval.current) {
        reconnectInterval.current = setInterval(() => {
          console.log('Attempting to reconnect...')
          newSocket.connect()
        }, 3000)
      }

      if (!timerInterval.current) {
        timerInterval.current = setInterval(() => {
          timeLeftRef.current -= 1
          setTimeRemaining(timeLeftRef.current)
          if (timeLeftRef.current <= 0) {
            clearTimerInterval()
          }
        }, 1000)
      }
    })

    return () => {
      newSocket.disconnect()
      clearReconnectInterval()
      clearTimerInterval()
    }
  }, [sessionId, serverURL, clientURL])

  return (
    <ArcadeBackground>
      {isMobile ? (
        <MobileMessage />
      ) : !gameStarted ? (
        serverStarting ? (
          <ServerStarting timeRemaining={timeRemaining} />
        ) : (
          <QRCodeDisplay value={`${clientURL}/remote/${sessionId}`} />
        )
      ) : (
        <GameCanvas onGameAction={gameAction} />
      )}
    </ArcadeBackground>
  )
}
