interface Pacman {
    draw(): void;
    move(): void;
    changeDirection(): void;
    checkCollision(): void;
    checkForWin(): void;
}