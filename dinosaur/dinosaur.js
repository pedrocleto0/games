class Dino {
    DEFAULT_SIZE = {width: 25, height: 25}
    START_POSITION = { x: 50, y: 0 }
    COLOR = 'green'
    JUMP_HEIGHT = 100
    JUMP_DURATION = 750

    size = {...this.DEFAULT_SIZE}
    posittion = { x: 0, y: 0 }
    game = null
    jumpStartTime = 0

    constructor(game) {
        this.game = game
    }

    jump() {
        const time = (new Date).getTime()
        if (time - this.jumpStartTime >= this.JUMP_DURATION)
            this.jumpStartTime = time
    }

    duck() {
        this.size = {
            width: this.DEFAULT_SIZE.width*1.5,
            height: this.DEFAULT_SIZE.height/1.5
        }
    }

    unduck() {
        this.size = {...this.DEFAULT_SIZE}
    }

    draw() {
        const ctx = this.game.ctx
        const time = new Date();
        const timeFromJumpStart = (new Date).getTime() - this.jumpStartTime
        const up = (timeFromJumpStart > this.JUMP_DURATION) ? 0 :
            (Math.sin(Math.PI * timeFromJumpStart / this.JUMP_DURATION) * this.JUMP_HEIGHT)
        const cx = this.START_POSITION.x + this.size.width
        const cy = this.game.canvasSize.height - (this.START_POSITION.y + this.size.height + up)
        ctx.beginPath();
        //ctx.arc(cx, cy, this.dinoSize, 0, Math.PI * 2, true);
        ctx.ellipse(cx, cy, this.size.width, this.size.height, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = this.COLOR;
        ctx.fill();
    }

}

class Dinosaur {
    canvasSize = { width: 800, height: 300 }
    dino = null
    ctx = null
    container = null
    canvas = null

    constructor(container) {
        this.container = container
        this.canvas = document.createElement('canvas')
        this.canvas.id = 'gameCanvas'
        this.canvas.width = this.canvasSize.width
        this.canvas.height = this.canvasSize.height
        this.container.appendChild(this.canvas)
        this.ctx = this.canvas.getContext('2d');

        this.dino = new Dino(this)
    }

    init() {
        document.addEventListener('keydown', this.onKeydown.bind(this))
        document.addEventListener('keyup', this.onKeyup.bind(this))
        this.draw()
    }

    onKeydown(event) {
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

    onKeyup(event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.dino.unduck()
                break;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height)
        this.dino.draw()
        window.requestAnimationFrame(this.draw.bind(this));
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const mainDiv = document.getElementById('main')
    game = new Dinosaur(mainDiv);
    game.init()
}, false);