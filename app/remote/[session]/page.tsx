"use client";

import { useEffect } from 'react';
import io from 'socket.io-client';

export default function RemoteControl({ params }: { params: { session: string } }) {
  useEffect(() => {
    const socket = io('http://localhost:3001', {
      withCredentials: true,
      query: { sessionId: params.session },
      transports: ['websocket'],
    });

    console.log('Conectado ao WebSocket com sessionId:', params.session);

    // Envia um evento ao iniciar o controle remoto
    socket.emit('startGame', { sessionId: params.session });

    // Escuta os eventos enviados pelo backend
    socket.on('gameAction', (action) => {
      console.log(`Ação recebida: ${action}`);
    });

    return () => {
      socket.disconnect(); // Desconecta ao desmontar o componente
    };
  }, [params.session]);

  const handleAction = (action: string) => {
    const socket = io('http://localhost:3001');
    socket.emit('control', { action, sessionId: params.session });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Controle Remoto para sessão: {params.session}</h1>
      <div className="space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700" onClick={() => handleAction('left')}>
          Esquerda
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700" onClick={() => handleAction('right')}>
          Direita
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700" onClick={() => handleAction('jump')}>
          Pular
        </button>
      </div>
    </div>
  );
}
