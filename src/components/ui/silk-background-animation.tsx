'use client';

import React, { useEffect, useRef, useState } from 'react';

export const SilkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const speed = 0.02;
    const scale = 2;
    const noiseIntensity = 0.8;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      // We want it to cover the entire scrollable height if possible,
      // but canvas is typically heavy, so we fix it to window height and make it sticky/fixed
      // Or we can just set it to window.innerHeight and use position: fixed.
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Simple noise function
    const noise = (x: number, y: number) => {
      const G = 2.71828;
      const rx = G * Math.sin(G * x);
      const ry = G * Math.sin(G * y);
      return (rx * ry * (1 + x)) % 1;
    };

    const animate = () => {
      const { width, height } = canvas;
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0a0a0b');
      gradient.addColorStop(0.5, '#0d1117');
      gradient.addColorStop(1, '#0a0a0b');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Create silk-like pattern
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Optimize by rendering at half resolution or skipping pixels? 
      // We will render every 2nd pixel to save performance
      for (let x = 0; x < width; x += 3) {
        for (let y = 0; y < height; y += 3) {
          const u = (x / width) * scale;
          const v = (y / height) * scale;
          
          const tOffset = speed * time;
          let tex_x = u;
          let tex_y = v + 0.03 * Math.sin(8.0 * tex_x - tOffset);

          const pattern = 0.6 + 0.4 * Math.sin(
            5.0 * (tex_x + tex_y + 
              Math.cos(3.0 * tex_x + 5.0 * tex_y) + 
              0.02 * tOffset) +
            Math.sin(20.0 * (tex_x + tex_y - 0.1 * tOffset))
          );

          const rnd = noise(x, y);
          const intensity = Math.max(0, pattern - rnd / 15.0 * noiseIntensity);
          
          // Bluish silk color (adjusting RGB values for a dark blue tint)
          const r = Math.floor(40 * intensity);
          const g = Math.floor(90 * intensity);
          const b = Math.floor(180 * intensity);
          const a = 255;

          // Fill 3x3 block to optimize performance
          for(let dx = 0; dx < 3; dx++) {
            for(let dy = 0; dy < 3; dy++) {
              if (x+dx < width && y+dy < height) {
                const index = ((y+dy) * width + (x+dx)) * 4;
                if (index < data.length) {
                  data[index] = r;
                  data[index + 1] = g;
                  data[index + 2] = b;
                  data[index + 3] = a;
                }
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Add subtle overlay for depth
      const overlayGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
      overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, width, height);

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        .silk-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
        }
      `}</style>
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {/* Animated Silk Background */}
        <canvas 
          ref={canvasRef}
          className="silk-canvas"
        />

        {/* Gradient Overlay to blend with the app's dark theme */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-[#0a0a0b]/50 to-[#0a0a0b] pointer-events-none" />
      </div>
    </>
  );
};
