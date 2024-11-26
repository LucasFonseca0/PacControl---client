'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import nipplejs from 'nipplejs'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/20/solid'

export default function RemoteControl({
  params,
}: {
  params: { session: string }
}) {
  const socketRef = useRef<Socket | null>(null)
  const joystickRef = useRef<HTMLDivElement>(null)

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL as string


  useEffect(() => {
    const socket = io(serverURL, {
      withCredentials: true,
      query: { sessionId: params.session },
      transports: ['websocket'],
    })

    console.log('Conectado ao WebSocket com sessionId:', params.session)

    socket.emit('startGame', { sessionId: params.session })

    socket.on('gameAction', (action) => {
      console.log(`Ação recebida: ${action}`)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [params.session, serverURL])
 
  useEffect(() => {
    if (joystickRef.current) {
      const joystick = nipplejs.create({
        zone: joystickRef.current,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        size: 150,
        restOpacity: 1,
        color: 'gray',
      })

      joystick.on('dir', (evt, data) => {
        const direction = data.direction.angle
        handleAction(direction)
      })

      return () => {
        joystick.destroy()
      }
    }
  }, [])

  const handleAction = (direction: string) => {
    if (
      socketRef.current &&
      ['up', 'down', 'left', 'right'].includes(direction)
    ) {
      socketRef.current.emit('control', {
        action: direction,
        sessionId: params.session,
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div
        className="mr-32 flex flex-col items-center"
        style={{ width: 150, height: 150 }}
      >
        <div
          ref={joystickRef}
          className="w-full h-full"
          style={{ position: 'relative' }}
        />
      </div>

      <div className="relative w-40 h-40">
        <button
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-500 rounded-full shadow-lg border-4 border-gray-700 hover:bg-red-600 focus:outline-none flex items-center justify-center transition-transform duration-100 active:scale-95"
          onClick={() => handleAction('up')}
          type="button"
        >
          <ArrowUpIcon className="w-6 h-6 text-white" />
        </button>

        <button
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-500 rounded-full shadow-lg border-4 border-gray-700 hover:bg-red-600 focus:outline-none flex items-center justify-center transition-transform duration-100 active:scale-95"
          onClick={() => handleAction('down')}
          type="button"
        >
          <ArrowDownIcon className="w-6 h-6 text-white" />
        </button>

        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-red-500 rounded-full shadow-lg border-4 border-gray-700 hover:bg-red-600 focus:outline-none flex items-center justify-center transition-transform duration-100 active:scale-95"
          onClick={() => handleAction('left')}
          type="button"
        >
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>

        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-red-500 rounded-full shadow-lg border-4 border-gray-700 hover:bg-red-600 focus:outline-none flex items-center justify-center transition-transform duration-100 active:scale-95"
          onClick={() => handleAction('right')}
          type="button"
        >
          <ArrowRightIcon className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  )
}
