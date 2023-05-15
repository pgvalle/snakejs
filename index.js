// canvas setup
const canvas = document.getElementById('canvas')
canvas.width = 32
canvas.height = 32
// context for drawing stuff
const ctx = canvas.getContext('2d')

// utilities
// random integer numbers
function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1) + a)
}

// entities
// fruit
const fruit = {
  x: 0,
  y: 0,
  msSpawnTimeout: 0,

  reset: function () {
    // random initial position
    this.x = randInt(0, canvas.width  - 1)
    this.y = randInt(0, canvas.height - 1)
    // time until spawning
    this.msSpawnTimeout = 1000
  },

  update: function (msDelta) {
    if (this.msSpawnTimeout > 0) {
      this.msSpawnTimeout -= msDelta
    }
  },

  draw: function () {
    if (this.msSpawnTimeout <= 0) {
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(this.x, this.y, 1, 1)
    }
  }
}

const snake = {
  body: [], // index 0 is the head
  // direction head should follow
  dx: 0,
  dy: 0,

  reset: function () {
    // head in random position
    this.body = [{
      x: randInt(0, canvas.width - 1),
      y: randInt(0, canvas.width - 1)
    }]
    // growing body to size 4
    for (let _ = 1; _ < 4; _++) {
      this.grow()
    }
    // start stopped
    this.dx = 0
    this.dy = 0
  },

  crawl: function () {
    if (this.dx == 0 && this.dy == 0) return;

    // move body
    for (let i = this.body.length - 1; i > 0; i--) {
      this.body[i].x = this.body[i - 1].x
      this.body[i].y = this.body[i - 1].y
    }
    // move head
    this.body[0].x += this.dx
    this.body[0].y += this.dy
  },

  grow: function () {
    this.body.push({ x: -1, y: -1 })
    console.log(this.body)
  },

  draw: function () {
    // draw entire body
    ctx.fillStyle = '#00dd00' // green head
    this.body.forEach(function (bodyPart) {
      ctx.fillRect(bodyPart.x, bodyPart.y, 1, 1)
    })
  }
}
// configuring entities
snake.reset()
fruit.reset()

// state machine setup
// states
const gameStates = {
  MENU:     Symbol('menu'),
	GAMEPLAY: Symbol('gameplay'),
	PAUSED:   Symbol('paused'),
	OVER:     Symbol('over')
}
let gameState = gameStates.GAMEPLAY

// keypress actions
// GAMEPLAY
const GameplayKeyPressActions = {
  Escape: function () {
    gameState = gameStates.PAUSED
  },

  ArrowUp: function () {
    snake.dx =  0
    snake.dy = -1
  },

  ArrowDown: function() {
    snake.dx = 0
    snake.dy = 1
  },

  ArrowLeft: function () {
    snake.dx = -1
    snake.dy =  0
  },

  ArrowRight: function () {
    snake.dx = 1
    snake.dy = 0
  }
}
// OVER
const OverKeyPressActions = {
  
}

// setup keypress handling
window.onkeydown = function (event) {
  switch (gameState) {
    case gameStates.GAMEPLAY:
      const gameplayAction = GameplayKeyPressActions[event.key]
      if (gameplayAction) gameplayAction()
      break
    case gameStates.OVER:
      const overAction = OverKeyPressActions[event.key]
      if (overAction) overAction()
      break
  }
}

// interactions
function processInteractions() {
  // 1. snake eats fruit
  if (snake.body[0].x == fruit.x &&
      snake.body[0].y == fruit.y && fruit.msSpawnTimeout <= 0) {
    fruit.reset()
    snake.grow()
  }

  // 2. snake hits itself
  for (let i = 1; i < snake.body.length; i++) {
    if (snake.body[0].x == snake.body[i].x &&
        snake.body[0].y == snake.body[i].y) {
      // game over
      gameState = gameStates.OVER
      break
    }
  }
}


const FPS = 10;
function frame() {
  // clear canvas
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  switch (gameState) {
    case gameStates.GAMEPLAY:
      processInteractions()
      snake.crawl()
      fruit.update(1000 / FPS)
      break
  }

  fruit.draw();
  snake.draw();
    
  // request redrawing
  setTimeout(function () {
    requestAnimationFrame(frame);
  }, 1000 / FPS);
}

frame();