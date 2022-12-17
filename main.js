const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const pixelRatio = window.devicePixelRatio > 1 ? 2 : 1

const bgColor = '#f1f1f1'
const mainColor = '#F94892'

const fps = 60
const interval = 1000 / fps
let now
let then = Date.now()
let delta

let box

function init() {
  canvas.width = innerWidth * pixelRatio
  canvas.height = innerHeight * pixelRatio
  ctx.scale(pixelRatio, pixelRatio)

  window.mouse = {
    isDown: false,
    x: canvas.width / 2,
    y: canvas.height / 2,
    ox: canvas.width / 2,
    oy: canvas.height / 2,
    mx: canvas.width / 2,
    my: canvas.height / 2
  }
  window.BOX_SIZE = hypotenuse(canvas.width, canvas.height) * 0.3

  box = new Box(
    canvas.width / 2 - BOX_SIZE / 2,
    canvas.height / 2 - BOX_SIZE / 2,
    BOX_SIZE,
    BOX_SIZE
  )
}

function render() {
  requestAnimationFrame(render)

  now = Date.now()
  delta = now - then
  if (delta < interval) return

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  box.animate()

  then = now - (delta % interval)
}

function onPointerDown(e) {
  if (!box.checkInsideBox(e.clientX * pixelRatio, e.clientY * pixelRatio)) return
  if (mouse.isDown) return
  mouse.isDown = true
  mouse.x = e.clientX * pixelRatio
  mouse.y = e.clientY * pixelRatio
  mouse.ox = e.clientX * pixelRatio
  mouse.oy = e.clientY * pixelRatio
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e) {
  mouse.x = e.clientX * pixelRatio
  mouse.y = e.clientY * pixelRatio
  mouse.mx = canvas.width / 2 + mouse.x - mouse.ox
  mouse.my = canvas.height / 2 + mouse.y - mouse.oy
  if (distance(mouse.x, mouse.y, canvas.width / 2, canvas.height / 2) > BOX_SIZE * 1.3) {
    onPointerUp()
  }
}

function onPointerUp() {
  backAnimation()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

function backAnimation() {
  gsap.to(mouse, {
    mx: canvas.width / 2,
    my: canvas.height / 2,
    duration: 0.4,
    ease: Elastic.easeOut.config(1, 0.1),
    onComplete: () => mouse.isDown = false
  })
}

window.addEventListener('pointerdown', onPointerDown)
window.addEventListener('resize', init)
window.addEventListener('DOMContentLoaded', () => {
  init()
  render()
})

class Box {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.corners = [
      [this.x, this.y],
      [this.x + this.width, this.y],
      [this.x + this.width, this.y + this.height],
      [this.x, this.y + this.height]
    ]
    this.points = []
    this.init()
    this.isBacking = false
  }

  divide(n, a, b) {
    for (let i = 0; i < n; i++) {
      const x = (b[0] - a[0]) * i / n + a[0]
      const y = (b[1] - a[1]) * i / n + a[1]
      this.points.push({ x, y })
    }
  }

  init() {
    this.divide(3, this.corners[0], this.corners[1])
    this.divide(3, this.corners[1], this.corners[2])
    this.divide(3, this.corners[2], this.corners[3])
    this.divide(3, this.corners[3], this.corners[0])
  }

  draw() {
    ctx.beginPath()
    ctx.moveTo(this.points[0].x, this.points[0].y)
    for (let i = 0; i < this.points.length - 1; i++) {
      ctx.quadraticCurveTo(mouse.mx, mouse.my, this.points[i + 1].x, this.points[i + 1].y)
    }
    ctx.quadraticCurveTo(mouse.mx, mouse.my, this.points[0].x, this.points[0].y)
    ctx.strokeStyle = mainColor
    ctx.strokeWidth = 5
    ctx.stroke()
    ctx.fillStyle = mainColor
    ctx.fill()
    ctx.closePath()

    const GAP = BOX_SIZE * 0.09
    const x1 = (this.corners[0][0] + mouse.mx) / 2
    const x2 = x1 + GAP
    const x3 = x1 + this.width / 2 - GAP
    const x4 = x3 + GAP
    const y1 = (this.corners[0][1] + mouse.my) / 2
    const y2 = y1 + GAP
    const y3 = y1 + this.height / 2 - GAP
    const y4 = y3 + GAP
    ctx.beginPath()
    ctx.moveTo(x2, y1)
    ctx.lineTo(x3, y1)
    ctx.quadraticCurveTo(x4, y1, x4, y2)
    ctx.lineTo(x4, y3)
    ctx.quadraticCurveTo(x4, y4, x3, y4)
    ctx.lineTo(x2, y4)
    ctx.quadraticCurveTo(x1, y4, x1, y3)
    ctx.lineTo(x1, y2)
    ctx.quadraticCurveTo(x1, y1, x2, y1)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
    ctx.font = BOX_SIZE * 0.09 + "px Jua"
    ctx.fillStyle = bgColor
    ctx.textAlign = 'center'
    ctx.fillText(
      'Drag this',
      ((this.corners[0][0] + mouse.mx) / 2 + 2 + this.width / 4),
      ((this.corners[0][1] + mouse.my) / 2 + 2 + this.height / 4)
    )
  }

  checkInsideBox(clientX, clientY) {
    return (
      clientX > (this.corners[0][0] + this.width / 4) &&
      clientX < (this.corners[0][0] + this.width / 4) + (this.width / 2) &&
      clientY > (this.corners[0][1] + this.height / 4) &&
      clientY < (this.corners[0][1] + this.height / 4) + (this.height / 2)
    )
  }

  animate() {
    this.draw()
  }
}

function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1
  const yDist = y2 - y1

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

function hypotenuse(width, height) {
  return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
}
