interface IPacman {
    draw(ctx: CanvasRenderingContext2D): void;
    move(): void;
    changeDirection(direction: string): void;
    checkCollision(): void;
    checkForWin(): void;
}