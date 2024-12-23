import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

const AnimatedBackground = () => {
    const sketchRef = useRef();

    useEffect(() => {
        const sketch = (p) => {
            const Particles = [];

            // Helper Functions
            const deg = (a) => (p.PI / 180) * a;
            const rand = (v1, v2) => Math.floor(v1 + Math.random() * (v2 - v1));

            // Options
            const opt = {
                particles: p.windowWidth / 500 ? 1000 : 500,
                noiseScale: 0.009,
                angle: p.PI / 180 * -90,
                h1: rand(0, 360),
                h2: rand(0, 360),
                s1: rand(20, 90),
                s2: rand(20, 90),
                l1: rand(30, 80),
                l2: rand(30, 80),
                strokeWeight: 1.2,
                tail: 82,
            };

            let time = 0;

            // Particle Class
            class Particle {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.lx = x;
                    this.ly = y;
                    this.vx = 0;
                    this.vy = 0;
                    this.ax = 0;
                    this.ay = 0;
                    this.hueSemen = Math.random();
                    this.hue = this.hueSemen > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
                    this.sat = this.hueSemen > 0.5 ? opt.s1 : opt.s2;
                    this.light = this.hueSemen > 0.5 ? opt.l1 : opt.l2;
                    this.maxSpeed = this.hueSemen > 0.5 ? 3 : 2;
                }

                randomize() {
                    this.hueSemen = Math.random();
                    this.hue = this.hueSemen > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
                    this.sat = this.hueSemen > 0.5 ? opt.s1 : opt.s2;
                    this.light = this.hueSemen > 0.5 ? opt.l1 : opt.l2;
                    this.maxSpeed = this.hueSemen > 0.5 ? 3 : 2;
                }

                update() {
                    this.follow();
                    this.vx += this.ax;
                    this.vy += this.ay;

                    const p = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    const a = Math.atan2(this.vy, this.vx);
                    const m = Math.min(this.maxSpeed, p);
                    this.vx = Math.cos(a) * m;
                    this.vy = Math.sin(a) * m;

                    this.x += this.vx;
                    this.y += this.vy;
                    this.ax = 0;
                    this.ay = 0;

                    this.edges();
                }

                follow() {
                    const angle =
                        p.noise(
                            this.x * opt.noiseScale,
                            this.y * opt.noiseScale,
                            time * opt.noiseScale
                        ) *
                        p.PI *
                        0.5 +
                        opt.angle;

                    this.ax += Math.cos(angle);
                    this.ay += Math.sin(angle);
                }

                updatePrev() {
                    this.lx = this.x;
                    this.ly = this.y;
                }

                edges() {
                    if (this.x < 0) {
                        this.x = p.width;
                        this.updatePrev();
                    }
                    if (this.x > p.width) {
                        this.x = 0;
                        this.updatePrev();
                    }
                    if (this.y < 0) {
                        this.y = p.height;
                        this.updatePrev();
                    }
                    if (this.y > p.height) {
                        this.y = 0;
                        this.updatePrev();
                    }
                }

                render() {
                    p.stroke(
                        `hsla(${this.hue}, ${this.sat}%, ${this.light}%, .5)`
                    );
                    p.line(this.x, this.y, this.lx, this.ly);
                    this.updatePrev();
                }
            }

            // p5.js Setup
            p.setup = () => {
                p.createCanvas(p.windowWidth, p.windowHeight);
                for (let i = 0; i < opt.particles; i++) {
                    Particles.push(
                        new Particle(Math.random() * p.width, Math.random() * p.height)
                    );
                }
                p.strokeWeight(opt.strokeWeight);
            };

            // p5.js Draw
            p.draw = () => {
                time++;
                p.background(0, 100 - opt.tail);
                for (let particle of Particles) {
                    particle.update();
                    particle.render();
                }
            };

            // p5.js Window Resize
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        };

        const p5Instance = new p5(sketch, sketchRef.current);

        return () => {
            p5Instance.remove();
        };
    }, []);

    return <div ref={sketchRef} style={{ position: 'absolute', zIndex: -1 }} />;
};

export default AnimatedBackground;
