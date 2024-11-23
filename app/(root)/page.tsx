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
      console.log('Conectado ao WebSocket com sessionId:', sessionId)
      console.log('Link:', `${clientURL}/remote/${sessionId}`)
    })

    newSocket.on('gameStarted', () => {
      console.log('O jogo começou!')
      setGameStarted(true)
    })

    newSocket.on('gameAction', (data: Actions) => {
      console.log('Resposta do backend (pong):', data)
      setGameAction(data)
    })

    newSocket.on('disconnect', () => {
      console.log('Desconectado do WebSocket')
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
              Escaneie o QR Code para começar o jogo
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
