/**
 * 
 * @param {HTMLCanvasElement} canvas 
 */
export default function Wave(canvas) {
  this.canvas = canvas
  this.ctx = canvas.getContext('2d')
  this.color1 = '#004E6A'
  this.color2 = '#002B3B'
  this.color3 = '#003C52'
  this.color4 = '#00222F'
  this.color5 = '#002B3B'
  this.color6 = '#00222F'

  this.amplitude = 100
  this.frequency = .01
  this.speed = 0
}

Wave.prototype.drawSine = function(yFun, offset = 40, color, fillColor) {
  this.ctx.beginPath();
  this.ctx.strokeStyle = fillColor;
  this.ctx.fillStyle = color;
  this.ctx.moveTo(0, this.canvas.height);
  for (let x = 0; x < this.canvas.width; x++) {
    this.y = yFun(x, this.frequency, this.speed, this.amplitude)
    this.ctx.lineTo(x, this.y + this.canvas.height - 100 - offset);
  }
  this.ctx.lineTo(this.canvas.width, this.canvas.height + this.canvas.width / 2);
  this.ctx.lineTo(0, 100);
  this.ctx.stroke();
  this.ctx.fill()
}
Wave.prototype.drawSines = function(speed) {
  this.speed = speed
  this.drawSine((x, frequency, speed, amplitude) => {
    return Math.sin(x * frequency + speed * 2) * amplitude / 4
  }, 60, this.color1, this.color2)
  this.drawSine((x, frequency, speed, amplitude) => {
    return Math.sin(x * frequency + speed * 5) * amplitude / 3
  }, 30, this.color3, this.color4)
  this.drawSine((x, frequency, speed, amplitude) => {
    return Math.sin(x * frequency + speed * 10) * amplitude / 3
  }, 0, this.color5, this.color6)
}