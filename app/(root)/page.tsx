'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode.react'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'
import MyCanvas from '../components/Canvas'
import { ArcadeBackground } from '../components/ArcadeBackground'

type Actions = 'left' | 'right' | 'up' | 'down'

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [sessionId] = useState(uuidv4())
  const [socket, setSocket] = useState<any>(null)
  const [gameAction, setGameAction] = useState<Actions>('right')
  const [serverStarting, setServerStarting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(30)

  const reconnectInterval = useRef<NodeJS.Timeout | null>(null)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL as string
  const clientURL = process.env.NEXT_PUBLIC_CLIENT_URL as string

  useEffect(() => {
    const newSocket = io(serverURL, {
      query: { sessionId },
      withCredentials: true,
      transports: ['websocket'],
      reconnection: false,
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected with ID:', sessionId)
      console.log('Link:', `${clientURL}/remote/${sessionId}`)
      setServerStarting(false)
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current)
        reconnectInterval.current = null
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
        timerInterval.current = null
      }
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

    newSocket.on('connect_error', (err: any) => {
      console.log('Connection error:', err)
      setServerStarting(true)
      let timeLeft = 30

      if (!reconnectInterval.current) {
        reconnectInterval.current = setInterval(() => {
          console.log('Attempting to reconnect...')
          newSocket.connect()
        }, 3000)
      }

      if (!timerInterval.current) {
        timerInterval.current = setInterval(() => {
          timeLeft -= 1
          setTimeRemaining(timeLeft)
          if (timeLeft <= 0) {
            if (timerInterval.current) {
              clearInterval(timerInterval.current)
              timerInterval.current = null
            }
          }
        }, 1000)
      }
    })

    return () => {
      newSocket.disconnect()
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current)
        reconnectInterval.current = null
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
        timerInterval.current = null
      }
    }
  }, [sessionId, serverURL])

  return (
    <ArcadeBackground>
      <div className="flex flex-col items-center justify-center min-h-80 ">
        {!gameStarted ? (
          <div className="text-center min-h-[60vh] flex flex-col items-center justify-center p-20">
            {serverStarting ? (
              <>
                <h1 className="text-2xl font-bold mb-4 text-white">
                  The server is starting up, please wait...
                </h1>
                <p className="text-white mb-4">
                  The server is hosted on Render&apos;s free tier, so it&apos;s
                  common for it to sleep until it receives a request.
                </p>
                <p className="text-white mb-4">
                  Estimated time: {timeRemaining} seconds
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-4 text-white">
                  Scan the QR Code to start the game
                </h1>
                <QRCode
                  value={`${clientURL}/remote/${sessionId}`}
                  className="m-auto border-2 "
                  size={300}
                />
              </>
            )}
          </div>
        ) : (
          <div className="text-center">
            <MyCanvas onGameAction={gameAction} />
          </div>
        )}
      </div>
    </ArcadeBackground>
  )
}
