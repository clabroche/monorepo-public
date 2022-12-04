import Particle from './Particle'

export default function Particles(canvas) {
  this.canvas = canvas
  this.ctx = canvas.getContext('2d')
  this.canvas.height = canvas.height
  this.particles = []
  this.distanceLink = 100,
  this.color = '255,255,255'
}

Particles.prototype.seed = function(density = 50) {
  density = 100 - density
  density = 80000
  density = (this.canvas.width * this.canvas.height) / (density);
  this.particles = Array(Math.floor(density)).fill('').map(() => new Particle(null, null, null, this.ctx))
},
Particles.prototype.drawStars = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

  this.particles.map((particle, i) => {
    const windowX = window.innerWidth
    const windowY = window.innerHeight
    if ((particle.x > 0 && particle.x < windowX) && (particle.y > 0 && particle.y < windowY))
      particle.move();
    else {
      this.particles.splice(i, 1);
      this.particles.push(new Particle(null, null, null, this.ctx))
    }
  });
  for (let i = 0; i < this.particles.length / 2; i++) {
    const particle1 = this.particles[i];
    for (let j = 0; j < this.particles.length; j++) {
      const particle2 = this.particles[j];
      const distance = distanceFun(particle1, particle2);
      if (distance < this.distanceLink) {
        this.ctx.strokeStyle = `rgba(${this.color},${1 - distance / this.distanceLink} )`
        this.ctx.beginPath();
        this.ctx.moveTo(particle1.x, particle1.y);
        this.ctx.lineTo(particle2.x, particle2.y)
        this.ctx.stroke()
      }
    }
  }
}
function distanceFun(pt1, pt2) {
  return Math.sqrt(sqr(pt2.y - pt1.y) + sqr(pt2.x - pt1.x));
}
function sqr(a) { return a * a }
