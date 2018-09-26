/**
* Basic Particle Class Object
* WIP - pjkarlik@gmail.com
**/
export default class Particle {
  constructor(config) {
    this.size = config.size;
    this.ref = config.ref;
    this.life = 0;
    this.x = config.x;
    this.y = config.y;
    this.z = config.z;
    const min = config.min || 2;
    const max = config.max || 4;
    this.vx = config.vx || (Math.abs(Math.random() * max) - min);
    this.vy = config.vy || (Math.abs(Math.random() * max) - min);
    this.vz = config.vz || (Math.abs(Math.random() * max) - min);
    this.decay = config.decay || 0.0002;
    this.settings = config.settings || { gravity: 0, bounce: 0 };
    this.box = config.box;
    this.update();
  }

  update = () => {
    const { gravity, bounce } = this.settings;
    if (this.y > this.box.top + this.size) {
      this.vy *= -bounce;
      this.y = this.box.top;
    }
    if (this.y < this.box.bottom - this.size) {
      this.vy *= -bounce;
      this.y = this.box.bottom;
    }
    if (this.x < this.box.left - this.size) {
      this.vx *= -bounce;
      this.x = this.box.left;
    }
    if (this.x > this.box.right + this.size) {
      this.vx *= -bounce;
      this.x = this.box.right;
    }
    if (this.z < this.box.back - this.size) {
      this.vz *= -bounce;
      this.z = this.box.left;
    }
    if (this.z > this.box.front + this.size) {
      this.vz *= -bounce;
      this.z = this.box.right;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;

    this.vy -= gravity;
    this.vz;

    this.size -= (this.life * this.decay);
    this.life++;
  }
}
