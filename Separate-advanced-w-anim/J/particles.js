/**
 * Advanced Particle System for SCP Site Roleplay
 * Creates animated background particles with glow effects
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    particleCount: 30,
    minSize: 2,
    maxSize: 4,
    minSpeed: 0.2,
    maxSpeed: 0.8,
    colors: [
      'rgba(255, 30, 30, 0.6)',   // Red
      'rgba(255, 30, 30, 0.4)',   // Red lighter
      'rgba(255, 100, 100, 0.3)', // Pink
      'rgba(100, 100, 100, 0.3)'  // Gray
    ],
    glowIntensity: 15
  };

  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.size = config.minSize + Math.random() * (config.maxSize - config.minSize);
      this.speedX = (Math.random() - 0.5) * (config.maxSpeed - config.minSpeed) + config.minSpeed;
      this.speedY = (Math.random() - 0.5) * (config.maxSpeed - config.minSpeed) + config.minSpeed;
      this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
      this.opacity = 0.3 + Math.random() * 0.7;
      this.pulseSpeed = 0.01 + Math.random() * 0.02;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
      // Update position
      this.x += this.speedX;
      this.y += this.speedY;

      // Pulse effect
      this.pulsePhase += this.pulseSpeed;
      const pulse = Math.sin(this.pulsePhase);
      this.currentSize = this.size + pulse * (this.size * 0.3);

      // Wrap around edges
      if (this.x < -10) this.x = this.canvas.width + 10;
      if (this.x > this.canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = this.canvas.height + 10;
      if (this.y > this.canvas.height + 10) this.y = -10;
    }

    draw(ctx) {
      // Create gradient for glow effect
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.currentSize * config.glowIntensity
      );
      
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(0.3, this.color.replace(/[\d.]+\)$/g, '0.2)'));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Draw glow
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentSize * config.glowIntensity, 0, Math.PI * 2);
      ctx.fill();

      // Draw particle core
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class ParticleSystem {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.animationId = null;

      this.setupCanvas();
      this.createParticles();
      this.setupResizeHandler();
      this.animate();
    }

    setupCanvas() {
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '0';
      this.canvas.style.opacity = '0.6';
      
      this.resize();
      document.body.prepend(this.canvas);
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    setupResizeHandler() {
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.resize(), 250);
      });
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        this.particles.push(new Particle(this.canvas));
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Update and draw particles
      this.particles.forEach(particle => {
        particle.update();
        particle.draw(this.ctx);
      });

      // Draw connections between nearby particles
      this.drawConnections();

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
      const maxDistance = 150;
      
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.2;
            this.ctx.strokeStyle = `rgba(255, 30, 30, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.scpParticleSystem = new ParticleSystem();
    });
  } else {
    window.scpParticleSystem = new ParticleSystem();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (window.scpParticleSystem) {
      window.scpParticleSystem.destroy();
    }
  });
})();
