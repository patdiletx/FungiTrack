'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { NetworkState } from '@/app/lote/[id]/page';

const SVGNetworkPaths = {
  simple: (
    <>
      <path d="M50 10 V 90" />
      <path d="M30 20 L 70 80" />
      <path d="M70 20 L 30 80" />
      <path d="M20 50 H 80" />
    </>
  ),
  complex: (
    <>
      <path d="M50 10 V 90" />
      <path d="M30 20 L 70 80" />
      <path d="M70 20 L 30 80" />
      <path d="M20 50 H 80" />
      <path d="M50 10 C 20 30, 20 70, 50 90" />
      <path d="M50 10 C 80 30, 80 70, 50 90" />
      <path d="M10 50 C 30 20, 70 20, 90 50" />
      <path d="M10 50 C 30 80, 70 80, 90 50" />
    </>
  ),
};

const SVGNetworkNodes = {
    simple: (
        <>
            <circle cx="50" cy="10" r="3" />
            <circle cx="50" cy="90" r="3" />
            <circle cx="30" cy="20" r="2.5" />
            <circle cx="70" cy="80" r="2.5" />
            <circle cx="70" cy="20" r="2.5" />
            <circle cx="30" cy="80" r="2.5" />
            <circle cx="20" cy="50" r="3" />
            <circle cx="80" cy="50" r="3" />
            <circle cx="50" cy="50" r="4" />
        </>
    ),
    complex: (
        <>
            <circle cx="50" cy="10" r="3.5" />
            <circle cx="50" cy="90" r="3.5" />
            <circle cx="30" cy="20" r="3" />
            <circle cx="70" cy="80" r="3" />
            <circle cx="70" cy="20" r="3" />
            <circle cx="30" cy="80" r="3" />
            <circle cx="20" cy="50" r="3.5" />
            <circle cx="80" cy="50" r="3.5" />
            <circle cx="50" cy="50" r="4.5" />
            <circle cx="35" cy="45" r="2" />
            <circle cx="65" cy="55" r="2" />
            <circle cx="45" cy="35" r="2.5" />
            <circle cx="55" cy="65" r="2.5" />
            <circle cx="50" cy="30" r="2" />
            <circle cx="50" cy="70" r="2" />
        </>
    )
}

interface MycoSoundWaveProps {
  analyser: AnalyserNode | null;
  state: NetworkState;
  isComplex: boolean;
  className?: string;
}

export function MycoSoundWave({ analyser, state, isComplex, className }: MycoSoundWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Set canvas dimensions based on its container
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;


    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let waveColor = 'hsl(var(--primary))';
      if (state === 'hydrating') waveColor = 'hsl(195, 100%, 50%)';
      if (state === 'error') waveColor = 'hsl(var(--destructive))';
      if (state === 'listening') waveColor = 'hsl(var(--accent))';
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = waveColor;
      ctx.beginPath();

      const sliceWidth = canvas.width / dpr / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvas.height / dpr) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, (canvas.height / dpr) / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyser, state]);

  return (
    <div className={cn('relative w-full h-full flex items-center justify-center', className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible absolute inset-0 opacity-30"
        data-state={state}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="network-paths" strokeWidth="0.5" fill="none" stroke="hsl(var(--primary))" filter="url(#glow)">
          {isComplex ? SVGNetworkPaths.complex : SVGNetworkPaths.simple}
        </g>
        <g className="network-nodes" fill="hsl(var(--primary))" filter="url(#glow)">
          {isComplex ? SVGNetworkNodes.complex : SVGNetworkNodes.simple}
        </g>
      </svg>
      <canvas ref={canvasRef} className="w-4/5 h-2/5 z-10" />
    </div>
  );
}
