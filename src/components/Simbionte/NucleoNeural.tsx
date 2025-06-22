'use client';

import { cn } from "@/lib/utils";
import { MycoMindOutput } from "@/ai/flows/myco-mind-flow";
import { useEffect, useState } from "react";

type NucleoState = 'idle' | 'listening' | 'thinking';

interface NucleoNeuralProps {
  mood: MycoMindOutput['mood'];
  state: NucleoState;
  className?: string;
}

const moodColors: Record<MycoMindOutput['mood'], string> = {
  'Enfoque': '250, 80%, 95%',   // White
  'Euforia': '45, 100%, 70%',  // Gold
  'Letargo': '240, 10%, 50%', // Grey
  'Estrés': '15, 100%, 60%',   // Red-orange
};

export function NucleoNeural({ mood, state, className }: NucleoNeuralProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY, currentTarget } = event;
      if (currentTarget instanceof HTMLElement) {
          const { left, top, width, height } = currentTarget.getBoundingClientRect();
          const x = (clientX - left) / width - 0.5;
          const y = (clientY - top) / height - 0.5;
          setMousePos({ x, y });
      }
    };

    const container = document.getElementById('nucleo-container');
    container?.addEventListener('mousemove', handleMouseMove);

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const rotationStyle = {
    transform: `rotateY(${mousePos.x * 20}deg) rotateX(${-mousePos.y * 20}deg)`,
  };

  const baseColor = moodColors[mood] || moodColors['Enfoque'];

  return (
    <div id="nucleo-container" className={cn("absolute inset-0 flex items-center justify-center perspective-[1000px]", className)}>
      <div 
        className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] relative transition-transform duration-300 ease-out" 
        style={rotationStyle}
      >
        <div 
            className={cn(
                "w-full h-full rounded-full absolute transform-style-3d transition-all duration-500",
                state === 'listening' ? 'animate-pulse' : '',
                state === 'thinking' ? 'animate-spin-slow' : ''
            )}
            style={{ 
                backgroundImage: `radial-gradient(circle at center, hsla(${baseColor}, 0.2) 0%, hsla(${baseColor}, 0) 60%)`,
                transform: `scale(${state === 'listening' ? 1.1 : 1})`,
            }}
        >
            {/* Particle Layers */}
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="w-full h-full rounded-full absolute"
                    style={{
                        backgroundImage: `radial-gradient(circle at center, hsla(${baseColor}, 0.1) 0%, hsla(${baseColor}, 0) 70%)`,
                        transform: `rotateZ(${i * 72}deg) rotateX(${i * 36}deg) scale(${1 - i * 0.1})`,
                        animation: `spin ${(10 + i * 5)}s linear infinite ${i % 2 === 0 ? 'reverse' : ''}`,
                    }}
                />
            ))}
        </div>
      </div>
      <style jsx>{`
        .perspective-\[1000px\] {
            perspective: 1000px;
        }
        .transform-style-3d {
            transform-style: preserve-3d;
        }
        .animate-spin-slow {
            animation: spin 5s linear infinite;
        }
        @keyframes spin {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
