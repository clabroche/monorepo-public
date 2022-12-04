export default function Particle(
  x,
  y,
  rayon,
  ctx
) {
  this.ctx = ctx
  this.x = x || Math.random() * window.innerWidth;
  this.y = y || Math.random() * window.innerHeight;
  this.rayon = rayon || 1;
  this.angle = Math.random() * 360;
  this.speed = Math.floor((Math.random() * 2)) + 1;
}
Particle.prototype.draw = function () {
  this.ctx.beginPath()
  this.ctx.arc(this.x, this.y, this.rayon, 0, Math.PI * 2)
  this.ctx.fill()
}
Particle.prototype.move = function () {
  this.ctx.fillStyle = `rgb(255, 255, 255)`
  this.x += this.speed * Math.cos(this.angle * Math.PI / 180);
  this.y += this.speed * Math.sin(this.angle * Math.PI / 180);
  this.draw()
}
