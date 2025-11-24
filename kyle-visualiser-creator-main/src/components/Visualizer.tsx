import { useEffect, useRef } from "react";
import { VisualMode, VisualizerSettings } from "@/pages/Index";

interface VisualizerProps {
  mode: VisualMode;
  settings: VisualizerSettings;
  getFrequencyData: (() => Uint8Array | null) | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

export const Visualizer = ({ mode, settings, getFrequencyData }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  const colors = [
    `hsl(310, 100%, ${settings.colorIntensity}%)`, // Pink
    `hsl(180, 100%, ${settings.colorIntensity}%)`, // Cyan
    `hsl(60, 100%, ${settings.colorIntensity}%)`, // Yellow
    `hsl(280, 100%, ${settings.colorIntensity}%)`, // Purple
  ];

  const getAudioLevel = (range: "bass" | "treble" | "mid") => {
    if (!getFrequencyData) return 0.5;
    
    const data = getFrequencyData();
    if (!data) return 0.5;

    let start = 0;
    let end = data.length;
    
    if (range === "bass") {
      start = 0;
      end = Math.floor(data.length * 0.1);
    } else if (range === "mid") {
      start = Math.floor(data.length * 0.1);
      end = Math.floor(data.length * 0.4);
    } else if (range === "treble") {
      start = Math.floor(data.length * 0.4);
      end = Math.floor(data.length * 0.8);
    }

    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += data[i];
    }
    return (sum / (end - start)) / 255;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    const particleCount = Math.floor(settings.complexity * 2);
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * (settings.speed / 10),
      vy: (Math.random() - 0.5) * (settings.speed / 10),
      size: Math.random() * 5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    const animate = () => {
      ctx.fillStyle = `rgba(15, 13, 26, ${1 - settings.blurAmount / 100})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mode === "particles") {
        drawParticles(ctx, canvas);
      } else if (mode === "waveform") {
        drawWaveform(ctx, canvas);
      } else if (mode === "kaleidoscope") {
        drawKaleidoscope(ctx, canvas);
      } else if (mode === "glitch") {
        drawGlitch(ctx, canvas);
      } else if (mode === "bloom") {
        drawBloom(ctx, canvas);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, settings]);

  const drawParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const bassLevel = getAudioLevel("bass");
    const trebleLevel = getAudioLevel("treble");
    
    particlesRef.current.forEach((particle) => {
      const audioSize = particle.size * (1 + bassLevel * (settings.bassReactivity / 50));
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, audioSize, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = (settings.bassReactivity / 2) * (1 + trebleLevel);
      ctx.shadowColor = particle.color;
      ctx.fill();

      particle.x += particle.vx * (1 + bassLevel * 0.5);
      particle.y += particle.vy * (1 + bassLevel * 0.5);

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
    });
  };

  const drawWaveform = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const time = Date.now() * 0.001 * (settings.speed / 50);
    const bassLevel = getAudioLevel("bass");
    const amplitude = (settings.bassReactivity / 100) * 200 * (1 + bassLevel * 2);
    const frequency = (settings.trebleReactivity / 100) * (1 + getAudioLevel("treble"));

    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = colors[0];

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.strokeStyle = colors[i % colors.length];
      ctx.shadowColor = colors[i % colors.length];

      for (let x = 0; x < canvas.width; x += 5) {
        const y =
          canvas.height / 2 +
          Math.sin((x * frequency + time + i) * 0.02) * amplitude +
          Math.sin((x * frequency * 2 + time * 2 + i) * 0.01) * (amplitude / 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const drawKaleidoscope = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001 * (settings.speed / 50);
    const segments = Math.floor(settings.complexity / 10) + 3;
    const bassLevel = getAudioLevel("bass");
    const trebleLevel = getAudioLevel("treble");

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < segments; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / segments);

      for (let j = 0; j < 5; j++) {
        const radius = 50 + j * 40 + Math.sin(time + j) * 20 * (1 + bassLevel);
        const circleSize = 10 + settings.bassReactivity / 10 * (1 + bassLevel * 2);
        ctx.beginPath();
        ctx.arc(radius, 0, circleSize, 0, Math.PI * 2);
        ctx.fillStyle = colors[j % colors.length];
        ctx.shadowBlur = (settings.trebleReactivity / 2) * (1 + trebleLevel);
        ctx.shadowColor = colors[j % colors.length];
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  };

  const drawGlitch = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (Math.random() < settings.glitchEffect / 100) {
      const sliceHeight = Math.random() * 50 + 10;
      const y = Math.random() * canvas.height;
      const imageData = ctx.getImageData(0, y, canvas.width, sliceHeight);
      const offset = (Math.random() - 0.5) * 100;
      ctx.putImageData(imageData, offset, y);
    }

    drawParticles(ctx, canvas);
  };

  const drawBloom = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const time = Date.now() * 0.001 * (settings.speed / 50);
    const bassLevel = getAudioLevel("bass");
    const trebleLevel = getAudioLevel("treble");

    particlesRef.current.forEach((particle, i) => {
      const scale = 1 + Math.sin(time + i) * 0.5 * (1 + bassLevel);
      const adjustedSize = particle.size * scale * (settings.bassReactivity / 80) * (1 + bassLevel);

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, adjustedSize, 0, Math.PI * 2);
      
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, adjustedSize
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = settings.trebleReactivity * (1 + trebleLevel);
      ctx.shadowColor = particle.color;
      ctx.fill();

      particle.x += particle.vx * (1 + bassLevel * 0.3);
      particle.y += particle.vy * (1 + bassLevel * 0.3);

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        filter: `blur(${settings.blurAmount / 10}px) saturate(${100 + settings.distortion}%)`,
      }}
    />
  );
};
