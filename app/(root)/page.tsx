'use client'

import { useState, useEffect } from 'react'
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

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL as string
  const clientURL = process.env.NEXT_PUBLIC_CLIENT_URL as string

  useEffect(() => {
    const newSocket = io(serverURL, {
      query: { sessionId },
      withCredentials: true,
      transports: ['websocket'],
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('connect with ID:', sessionId)
      console.log('Link:', `${clientURL}/remote/${sessionId}`)
    })

    newSocket.on('gameStarted', () => {
      setGameStarted(true)
    })

    newSocket.on('gameAction', (data: Actions) => {
      setGameAction(data)
    })

    newSocket.on('disconnect', () => {
      console.log('desconnect from server')
    })

    return () => {
      newSocket.disconnect()
    }
  }, [sessionId, serverURL])

  return (
    <ArcadeBackground>
      <div className="flex flex-col items-center justify-center min-h-80 ">
        {!gameStarted ? (
          <div className="text-center min-h-[60vh] flex flex-col items-center justify-center p-20">
            <h1 className="text-2xl font-bold mb-4 text-white">
              Scan the QR Code to start the game
            </h1>
            <QRCode
              value={`${clientURL}/remote/${sessionId}`}
              className="m-auto border-2 "
              size={300}
            />
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
