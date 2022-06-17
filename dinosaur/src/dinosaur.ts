class Dinosaur {
    dino: Dino
    ctx: CanvasRenderingContext2D
    canvas: HTMLCanvasElement
    cacti: Cactus[] = new Array<Cactus>()

    canvasSize = { width: 1200, height: 300 }
    cactiInterval = 0
    lose = false

    constructor(private container: HTMLDivElement) {
        this.canvas = document.createElement('canvas')
        this.canvas.id = 'gameCanvas'
        this.canvas.width = this.canvasSize.width
        this.canvas.height = this.canvasSize.height
        this.container.appendChild(this.canvas)
        const res = this.canvas.getContext('2d');
        if (!res || !(res instanceof CanvasRenderingContext2D)) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = res;
        this.dino = new Dino(this)
        this.cactiInterval = setTimeout(this.onCreateCactus.bind(this), Math.random()*300+700)
    }
    onCreateCactus() {
        this.cacti.push(new Cactus(this))
        this.cactiInterval = setTimeout(this.onCreateCactus.bind(this), Math.random()*300+700)
    }

    init() {
        document.addEventListener('keydown', this.onKeydown.bind(this))
        document.addEventListener('keyup', this.onKeyup.bind(this))
        this.draw()
    }

    onKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.dino.jump()
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.dino.duck()
                break;
        }
    }

    onKeyup(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.dino.unduck()
                break;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height)
        this.cacti = this.cacti.filter(cactus => cactus.position.x > 0)
        this.cacti.forEach(cactus => cactus.draw())
        this.dino.draw()
        this.checkCollisions()
        if (!this.lose) {
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    checkCollisions() {
        this.cacti.forEach(cactus => { if (this.checkCollision(cactus, this.dino)) this.endGame() })
    }

    endGame() {
        clearInterval(this.cactiInterval)
        this.lose = true
        alert("Lose!")
    }

    checkCollision(cactus: Cactus, dino: Dino) {
        const cactusEndX = (cactus.position.x + cactus.size.width)
        const cactusEndY = (cactus.position.y + cactus.size.height)

        const dinoEndX = (dino.position.x + dino.size.width)
        const dinoEndY = (dino.position.y + dino.size.height)
        return (
            (cactus.position.x >= dino.position.x && cactus.position.x <= dinoEndX)
            ||
            (cactusEndX >= dino.position.x && cactusEndX <= dinoEndX)
        )
        && (
            (cactus.position.y >= dino.position.y && cactus.position.y <= dinoEndY)
            ||
            (cactusEndY >= dino.position.y && cactusEndY <= dinoEndY)
        )

    }
}

class Dino {
    static DEFAULT_SIZE = { width: 50, height: 50 }
    static START_POSITION = { x: 50, y: 0 }
    static COLOR = 'green'
    static JUMP_HEIGHT = 100
    static JUMP_DURATION = 750

    size = { ...Dino.DEFAULT_SIZE }
    jumpStartTime = 0

    constructor(private game: Dinosaur, public position = { ...Dino.START_POSITION }) { }

    jump() {
        const time = (new Date).getTime()
        if (time - this.jumpStartTime >= Dino.JUMP_DURATION)
            this.jumpStartTime = time
    }

    duck() {
        this.size = {
            width: Dino.DEFAULT_SIZE.width * 1.5,
            height: Dino.DEFAULT_SIZE.height / 1.5
        }
    }

    unduck() {
        this.size = { ...Dino.DEFAULT_SIZE }
    }

    draw() {
        const ctx = this.game.ctx
        const time = new Date();
        const timeFromJumpStart = (new Date).getTime() - this.jumpStartTime
        const up = (timeFromJumpStart > Dino.JUMP_DURATION) ? 0 :
            (Math.sin(Math.PI * timeFromJumpStart / Dino.JUMP_DURATION) * Dino.JUMP_HEIGHT)
        this.position.y = Dino.START_POSITION.y + up
        const cx = this.position.x + this.size.width/2
        const cy = this.game.canvasSize.height - (this.position.y + this.size.height/2)
        ctx.beginPath();
        ctx.ellipse(cx, cy, this.size.width/2, this.size.height/2, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = Dino.COLOR;
        ctx.fill();
    }
}

class Cactus {
    static MAX_SIZE = { width: 40, height: 60 }
    static MIN_SIZE = { width: 20, height: 40 }
    static COLOR = 'blue'

    size: { width: number, height: number }
    position = { x: 0, y: 0 }
    createTime = 0

    constructor(private game: Dinosaur) {
        this.size = {
            width: Math.random() * (Cactus.MAX_SIZE.width - Cactus.MIN_SIZE.width) + Cactus.MIN_SIZE.width,
            height: Math.random() * (Cactus.MAX_SIZE.height - Cactus.MIN_SIZE.height) + Cactus.MIN_SIZE.height,
        }

        this.position.y = Math.round(Math.random()*2)*40
        this.createTime = (new Date).getTime()
        this.position.x = this.game.canvasSize.width
    }

    draw() {
        const ctx = this.game.ctx
        this.position.x = this.game.canvasSize.width - ((new Date).getTime() - this.createTime) / 2
        const cx = this.position.x
        const cy = this.game.canvasSize.height - this.size.height - this.position.y
        ctx.beginPath();
        ctx.rect(cx, cy, this.size.width, this.size.height)
        ctx.closePath();
        ctx.fillStyle = Cactus.COLOR;
        ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const mainDiv = document.getElementById('main')
    if (!mainDiv || !(mainDiv instanceof HTMLDivElement)) {
        throw new Error('Missing div #main');
    }
    const game = new Dinosaur(mainDiv);
    game.init()
}, false);