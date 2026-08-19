import React, { useEffect, useRef } from "react";
import { BackgroundAnimMode, ThemeName } from "../types";
import { THEMES } from "../data/bankData";

interface BackgroundAnimationProps {
  mode: BackgroundAnimMode;
  themeName: ThemeName;
}

export const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ mode, themeName }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (mode === "none") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const theme = THEMES[themeName] || THEMES["Amber Gold"];
    const hexToRgb = (hex: string) => {
      let clean = hex.replace("#", "");
      if (clean.length === 3) {
        clean = clean.split("").map((c) => c + c).join("");
      }
      const num = parseInt(clean, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    };

    const rgbPrimary = hexToRgb(theme.primary);
    const rgbSecondary = hexToRgb(theme.secondary);

    // Particle system setup
    const numParticles = Math.min(Math.floor((width * height) / 18000), 75);
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // Aurora blob setup
    const blobs = [
      { x: width * 0.2, y: height * 0.3, radius: Math.max(width, height) * 0.35, vx: 0.3, vy: 0.2, phase: 0 },
      { x: width * 0.8, y: height * 0.6, radius: Math.max(width, height) * 0.4, vx: -0.25, vy: -0.15, phase: Math.PI / 2 },
      { x: width * 0.5, y: height * 0.8, radius: Math.max(width, height) * 0.3, vx: 0.15, vy: -0.3, phase: Math.PI },
    ];

    // Nebula stars setup
    const starCount = 120;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.5,
      blinkSpeed: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    // Matrix digital rain setup
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
    const matrixChars = "01CUB$£€%&89#";

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      if (mode === "particles") {
        // Constellation Particle Mesh
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, ${p.alpha})`;
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 140) {
              const lineAlpha = (1 - dist / 140) * 0.18;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${rgbSecondary.r}, ${rgbSecondary.g}, ${rgbSecondary.b}, ${lineAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      } else if (mode === "aurora") {
        // Ambient Aurora
        ctx.globalCompositeOperation = "screen";

        blobs.forEach((blob, idx) => {
          blob.phase += 0.005;
          const currentX = blob.x + Math.sin(blob.phase) * 80;
          const currentY = blob.y + Math.cos(blob.phase * 0.8) * 60;

          const grad = ctx.createRadialGradient(
            currentX,
            currentY,
            0,
            currentX,
            currentY,
            blob.radius
          );

          const rgb = idx % 2 === 0 ? rgbPrimary : rgbSecondary;
          grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`);
          grad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(currentX, currentY, blob.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalCompositeOperation = "source-over";
      } else if (mode === "wave") {
        // Sine Wave Lines
        ctx.lineWidth = 1.5;
        const waves = 4;
        for (let w = 0; w < waves; w++) {
          ctx.beginPath();
          const rgb = w % 2 === 0 ? rgbPrimary : rgbSecondary;
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.14 - w * 0.03})`;

          const yOffset = height * (0.25 + w * 0.2);
          const frequency = 0.002 + w * 0.0012;
          const amplitude = 35 + w * 18;

          for (let x = 0; x <= width; x += 12) {
            const y = yOffset + Math.sin(x * frequency + time * (1.2 + w * 0.4)) * amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (mode === "nebula") {
        // Deep Space Nebula & Twinkling Stars
        ctx.globalCompositeOperation = "screen";

        // Draw central pulsing glowing core
        const centerX = width * 0.5 + Math.sin(time * 0.5) * 40;
        const centerY = height * 0.4 + Math.cos(time * 0.4) * 30;
        const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, Math.max(width, height) * 0.5);
        grad.addColorStop(0, `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, 0.2)`);
        grad.addColorStop(0.6, `rgba(${rgbSecondary.r}, ${rgbSecondary.g}, ${rgbSecondary.b}, 0.05)`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(width, height) * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw twinkling stars
        ctx.globalCompositeOperation = "source-over";
        stars.forEach((star) => {
          star.phase += star.blinkSpeed;
          const alpha = Math.abs(Math.sin(star.phase)) * 0.7 + 0.15;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        });
      } else if (mode === "matrix") {
        // Digital Financial Rain
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Head char glow
          ctx.fillStyle = `rgba(255, 255, 255, 0.65)`;
          ctx.fillText(char, x, y);

          // Trail
          ctx.fillStyle = `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, 0.22)`;
          ctx.fillText(char, x, y - fontSize);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      } else if (mode === "grid") {
        // Perspective Cyber Grid
        ctx.strokeStyle = `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, 0.09)`;
        ctx.lineWidth = 1;

        const gridSize = 50;
        const offsetX = (time * 20) % gridSize;
        const offsetY = (time * 15) % gridSize;

        for (let x = -gridSize + offsetX; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        for (let y = -gridSize + offsetY; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, themeName]);

  if (mode === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-2] transition-opacity duration-700 ease-in-out"
      style={{ opacity: 1 }}
    />
  );
};
