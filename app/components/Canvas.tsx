import React, { useRef, useEffect } from "react";

const MyCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const blockSize = 32;
  const canvasWidth = blockSize * 21;
  const canvasHeight = blockSize * 23;
  const blank_space = blockSize * 0.7;
  const fps = 30; // Set the desired frames per second

  const pacmanMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 3, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
    [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let animationFrameId: number;

    const render = () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        pacmanMap.forEach((row, i) => {
          row.forEach((cell, j) => {
            ctx.fillStyle = cell === 1 ? "blue" : "black";
            ctx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);

            const offset = (blockSize - blank_space) / 2;
            if (cell === 1 && pacmanMap[i][j - 1] === 1) {
              ctx.fillStyle = "black";
              ctx.fillRect(
                j * blockSize - offset,
                i * blockSize + offset,
                blockSize,
                blank_space
              );
            }
            if (cell === 1 && pacmanMap[i][j + 1] === 1) {
              ctx.fillStyle = "black";
              ctx.fillRect(
                j * blockSize + offset,
                i * blockSize + offset,
                blockSize,
                blank_space
              );
            }
            if (cell === 1 && !!pacmanMap[i - 1] && pacmanMap[i - 1][j] === 1) {
              ctx.fillStyle = "black";
              ctx.fillRect(
                j * blockSize + offset,
                i * blockSize - offset,
                blank_space,
                blockSize
              );
            }
            if (cell === 1 && !!pacmanMap[i + 1] && pacmanMap[i + 1][j] === 1) {
              ctx.fillStyle = "black";
              ctx.fillRect(
                j * blockSize + offset,
                i * blockSize + offset,
                blank_space,
                blockSize
              );
            }
            if (cell === 3) {
              ctx.fillStyle = "pink";
              ctx.beginPath();
              ctx.fillRect(
                j * blockSize ,
                i * blockSize + blockSize / 2 - blockSize / 8,
                blockSize,
                offset
                
              );
              ("");
            }
          });
        });

        animationFrameId = requestAnimationFrame(render);
      }
    };

    const interval = 1000 / fps;
    let lastTime = 0;

    const frameController = (time: number) => {
      if (time - lastTime >= interval) {
        render();
        lastTime = time;
      } else {
        animationFrameId = requestAnimationFrame(frameController);
      }
    };

    animationFrameId = requestAnimationFrame(frameController);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
};

export default MyCanvas;
