"use strict";
class Dinosaur {
    constructor(container) {
        this.container = container;
        this.cacti = new Array();
        this.canvasSize = { width: 1200, height: 300 };
        this.cactiInterval = 0;
        this.lose = false;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'gameCanvas';
        this.canvas.width = this.canvasSize.width;
        this.canvas.height = this.canvasSize.height;
        this.container.appendChild(this.canvas);
        const res = this.canvas.getContext('2d');
        if (!res || !(res instanceof CanvasRenderingContext2D)) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = res;
        this.dino = new Dino(this);
        this.cactiInterval = setTimeout(this.onCreateCactus.bind(this), Math.random() * 300 + 700);
    }
    onCreateCactus() {
        this.cacti.push(new Cactus(this));
        this.cactiInterval = setTimeout(this.onCreateCactus.bind(this), Math.random() * 300 + 700);
    }
    init() {
        document.addEventListener('keydown', this.onKeydown.bind(this));
        document.addEventListener('keyup', this.onKeyup.bind(this));
        this.draw();
    }
    onKeydown(event) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.dino.jump();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.dino.duck();
                break;
        }
    }
    onKeyup(event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.dino.unduck();
                break;
        }
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        this.cacti = this.cacti.filter(cactus => cactus.position.x > 0);
        this.cacti.forEach(cactus => cactus.draw());
        this.dino.draw();
        this.checkCollisions();
        if (!this.lose) {
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }
    checkCollisions() {
        this.cacti.forEach(cactus => { if (this.checkCollision(cactus, this.dino))
            this.endGame(); });
    }
    endGame() {
        clearInterval(this.cactiInterval);
        this.lose = true;
        alert("Lose!");
    }
    checkCollision(cactus, dino) {
        const cactusEndX = (cactus.position.x + cactus.size.width);
        const cactusEndY = (cactus.position.y + cactus.size.height);
        const dinoEndX = (dino.position.x + dino.size.width);
        const dinoEndY = (dino.position.y + dino.size.height);
        return ((cactus.position.x >= dino.position.x && cactus.position.x <= dinoEndX)
            ||
                (cactusEndX >= dino.position.x && cactusEndX <= dinoEndX))
            && ((cactus.position.y >= dino.position.y && cactus.position.y <= dinoEndY)
                ||
                    (cactusEndY >= dino.position.y && cactusEndY <= dinoEndY));
    }
}
class Dino {
    constructor(game, position = Object.assign({}, Dino.START_POSITION)) {
        this.game = game;
        this.position = position;
        this.size = Object.assign({}, Dino.DEFAULT_SIZE);
        this.jumpStartTime = 0;
    }
    jump() {
        const time = (new Date).getTime();
        if (time - this.jumpStartTime >= Dino.JUMP_DURATION)
            this.jumpStartTime = time;
    }
    duck() {
        this.size = {
            width: Dino.DEFAULT_SIZE.width * 1.5,
            height: Dino.DEFAULT_SIZE.height / 1.5
        };
    }
    unduck() {
        this.size = Object.assign({}, Dino.DEFAULT_SIZE);
    }
    draw() {
        const ctx = this.game.ctx;
        const time = new Date();
        const timeFromJumpStart = (new Date).getTime() - this.jumpStartTime;
        const up = (timeFromJumpStart > Dino.JUMP_DURATION) ? 0 :
            (Math.sin(Math.PI * timeFromJumpStart / Dino.JUMP_DURATION) * Dino.JUMP_HEIGHT);
        this.position.y = Dino.START_POSITION.y + up;
        const cx = this.position.x + this.size.width;
        const cy = this.game.canvasSize.height - (this.position.y + this.size.height);
        ctx.beginPath();
        ctx.ellipse(cx, cy, this.size.width, this.size.height, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = Dino.COLOR;
        ctx.fill();
    }
}
Dino.DEFAULT_SIZE = { width: 25, height: 25 };
Dino.START_POSITION = { x: 50, y: 0 };
Dino.COLOR = 'green';
Dino.JUMP_HEIGHT = 100;
Dino.JUMP_DURATION = 750;
class Cactus {
    constructor(game) {
        this.game = game;
        this.position = { x: 0, y: 0 };
        this.createTime = 0;
        this.size = {
            width: Math.random() * (Cactus.MAX_SIZE.width - Cactus.MIN_SIZE.width) + Cactus.MIN_SIZE.width,
            height: Math.random() * (Cactus.MAX_SIZE.height - Cactus.MIN_SIZE.height) + Cactus.MIN_SIZE.height,
        };
        this.position.y = Math.random() * 100;
        this.createTime = (new Date).getTime();
        this.position.x = this.game.canvasSize.width;
    }
    draw() {
        const ctx = this.game.ctx;
        this.position.x = this.game.canvasSize.width - ((new Date).getTime() - this.createTime) / 2;
        const cx = this.position.x;
        const cy = this.game.canvasSize.height - this.size.height - this.position.y;
        ctx.beginPath();
        ctx.rect(cx, cy, this.size.width, this.size.height);
        ctx.closePath();
        ctx.fillStyle = Cactus.COLOR;
        ctx.fill();
    }
}
Cactus.MAX_SIZE = { width: 40, height: 60 };
Cactus.MIN_SIZE = { width: 25, height: 50 };
Cactus.COLOR = 'blue';
document.addEventListener('DOMContentLoaded', function () {
    const mainDiv = document.getElementById('main');
    if (!mainDiv || !(mainDiv instanceof HTMLDivElement)) {
        throw new Error('Missing div #main');
    }
    const game = new Dinosaur(mainDiv);
    game.init();
}, false);
