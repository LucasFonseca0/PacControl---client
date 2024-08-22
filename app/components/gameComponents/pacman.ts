import React, { useRef, useEffect } from "react";

export class Pacman implements IPacman {
  x: number;
  y: number;
  size: number;
  direction: string;
  map: number[][];

  constructor(x: number, y: number, size: number,map: number[][]) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.direction = "right";
    this.map = map;
    
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      this.size / 2,
      0.2 * Math.PI + this.getAngleOffset(),
      1.8 * Math.PI + this.getAngleOffset()
    );
    ctx.lineTo(this.x, this.y);
    ctx.fill();
  }

  move(): void {
    const step = this.size / 8; 
    console.log(this.x)
    
   if (this.x > this.map[0].length * this.size) {
      this.x = 0;
    }else if (this.x < 0) {
      this.x = this.map[0].length * this.size;
    }

    switch (this.direction) {
      case "right":
        this.x += step;
        break;
      case "left":
        this.x -= step;
        break;
      case "up":
        this.y -= step;
        break;
      case "down":
        this.y += step;
        break;
    }
  }

  changeDirection(direction: string): void {
    this.direction = direction;
  }

  checkCollision(): void {
    // TODO 
  }

  checkForWin(): void {
    // TODO
  }

  getAngleOffset(): number {
    switch (this.direction) {
      case "right":
        return 0;
      case "left":
        return Math.PI;
      case "up":
        return -Math.PI / 2;
      case "down":
        return Math.PI / 2;
      default:
        return 0;
    }
  }
}
