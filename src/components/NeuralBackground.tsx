import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  pulsePhase: number;
  color: string;
}

interface SignalPulse {
  fromNode: number;
  toNode: number;
  progress: number; // 0.0 to 1.0
  speed: number;
  color: string;
}

export const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastFrameTime = performance.now();
    let nodes: Node[] = [];
    let pulses: SignalPulse[] = [];

    // Check media queries and touch capability
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const targetFps = isTouchDevice ? 30 : 60;
    const frameInterval = 1000 / targetFps;

    // Palette for biological network: Emerald, Mint, Cyan, Warm Amber
    const colors = [
      'rgba(16, 185, 129, ',  // Emerald
      'rgba(52, 211, 153, ',  // Mint
      'rgba(6, 182, 212, ',   // Cyan
      'rgba(245, 158, 11, '   // Amber
    ];

    const initCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Populate cellular nodes based on screen area
      const area = width * height;
      const nodeCount = Math.max(20, Math.min(45, Math.floor(area / 35000)));

      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          baseRadius: 2.5 + Math.random() * 3,
          pulsePhase: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      pulses = [];
    };

    initCanvasSize();

    const spawnPulse = (connections: { from: number; to: number }[]) => {
      if (connections.length === 0 || pulses.length >= 8) return;
      const conn = connections[Math.floor(Math.random() * connections.length)];
      pulses.push({
        fromNode: conn.from,
        toNode: conn.to,
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
        color: nodes[conn.from].color
      });
    };

    const drawFrame = (time: number) => {
      const delta = time - lastFrameTime;
      if (delta < frameInterval) {
        if (!reducedMotionQuery.matches && !document.hidden) {
          animationFrameId = requestAnimationFrame(drawFrame);
        }
        return;
      }
      lastFrameTime = time - (delta % frameInterval);

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Organic background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#070a12');
      bgGrad.addColorStop(0.5, '#0b101d');
      bgGrad.addColorStop(1, '#070a12');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const connections: { from: number; to: number; dist: number }[] = [];

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!reducedMotionQuery.matches) {
          node.x += node.vx;
          node.y += node.vy;

          // Soft bounce boundaries
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }

        // Biological respiration (sine wave oscillation)
        const breathe = Math.sin(time * 0.0015 + node.pulsePhase) * 0.8;
        const currentRadius = Math.max(1, node.baseRadius + breathe);

        // Soft outer glow
        const glowGrad = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, currentRadius * 4
        );
        glowGrad.addColorStop(0, `${node.color}0.4)`);
        glowGrad.addColorStop(0.5, `${node.color}0.1)`);
        glowGrad.addColorStop(1, `${node.color}0)`);

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Node center core
        ctx.fillStyle = `${node.color}0.95)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Collect connections
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            connections.push({ from: i, to: j, dist });
            const alpha = (1 - dist / 140) * 0.22;

            ctx.strokeStyle = `${node.color}${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      // Handle signal pulses along pathways
      if (!reducedMotionQuery.matches) {
        if (Math.random() < 0.04) {
          spawnPulse(connections);
        }

        for (let p = pulses.length - 1; p >= 0; p--) {
          const pulse = pulses[p];
          pulse.progress += pulse.speed;

          if (pulse.progress >= 1) {
            pulses.splice(p, 1);
            continue;
          }

          const n1 = nodes[pulse.fromNode];
          const n2 = nodes[pulse.toNode];
          if (!n1 || !n2) continue;

          const px = n1.x + (n2.x - n1.x) * pulse.progress;
          const py = n1.y + (n2.y - n1.y) * pulse.progress;

          const pGlow = ctx.createRadialGradient(px, py, 0, px, py, 6);
          pGlow.addColorStop(0, `${pulse.color}0.9)`);
          pGlow.addColorStop(1, `${pulse.color}0)`);

          ctx.fillStyle = pGlow;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        if (!document.hidden) {
          animationFrameId = requestAnimationFrame(drawFrame);
        }
      }
    };

    // Draw initial frame
    drawFrame(performance.now());

    // Event Listeners
    const handleResize = () => {
      initCanvasSize();
      drawFrame(performance.now());
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else if (!reducedMotionQuery.matches) {
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    const handleReducedMotionChange = () => {
      if (reducedMotionQuery.matches) {
        cancelAnimationFrame(animationFrameId);
        drawFrame(performance.now());
      } else {
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Cleanup on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
};

export default NeuralBackground;
