"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import io from "socket.io-client";
import MyCanvas from "../components/Canvas";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionId] = useState(uuidv4());
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      query: { sessionId },
      withCredentials: true,
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Conectado ao WebSocket com sessionId:", sessionId);
      console.log("Link:", `http://localhost:3000/remote/${sessionId}`);
    });

    newSocket.on("gameStarted", () => {
      console.log("O jogo começou!");
      setGameStarted(true);
    });

    newSocket.on("gameAction", (data) => {
      console.log("Resposta do backend (pong):", data);
    });

    newSocket.on("disconnect", () => {
      console.log("Desconectado do WebSocket");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {gameStarted ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Escaneie o QR Code para começar o jogo
          </h1>
          <QRCode value={`http://localhost:3000/remote/${sessionId}`} />
        </div>
      ) : (
        <div className="text-center">
          <MyCanvas/>
        </div>
      )}
    </div>
  );
}
