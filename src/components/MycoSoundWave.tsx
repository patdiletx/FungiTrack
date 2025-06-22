'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { NetworkState } from '@/app/lote/[id]/page';

interface MycoSoundWaveProps {
  analyser: AnalyserNode | null;
  state: NetworkState;
  className?: string;
}

export function MycoSoundWave({ analyser, state, className }: MycoSoundWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
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
      let opacity = 0.7;
      
      if (state === 'listening') {
        waveColor = 'hsl(var(--accent))';
        opacity = 1.0;
      }
      if (state === 'thinking') {
        waveColor = 'hsl(var(--primary))';
        opacity = 0.5;
      }
      if (state === 'error') {
        waveColor = 'hsl(var(--destructive))';
        opacity = 0.8
      }
      
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = `${waveColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();

      const sliceWidth = (canvas.width / dpr) / bufferLength;
      let x = 0;
      const canvasHeight = canvas.height / dpr;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // value between 0 and 2
        const y = (v * canvasHeight) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width / dpr, canvasHeight / 2);
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
      <canvas ref={canvasRef} className="w-full h-1/2 z-10" />
    </div>
  );
}
