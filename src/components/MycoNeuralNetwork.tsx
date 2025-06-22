'use client';

import { cn } from '@/lib/utils';
import React from 'react';

type NetworkState = 'idle' | 'listening' | 'thinking' | 'hydrating' | 'error' | 'complex';

interface MycoNeuralNetworkProps {
  state: NetworkState;
  className?: string;
}

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

export function MycoNeuralNetwork({ state, className }: MycoNeuralNetworkProps) {
    const isComplex = state === 'complex';

    return (
    <div className={cn('relative w-full h-full flex items-center justify-center', className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
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
           <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <circle cx="50" cy="50" r="50" fill="url(#center-glow)" className="listening-glow opacity-0 transition-opacity duration-500" />
        
        <g
          className="network-paths"
          strokeWidth="0.5"
          fill="none"
          stroke="hsl(var(--primary))"
          filter="url(#glow)"
        >
            {isComplex ? SVGNetworkPaths.complex : SVGNetworkPaths.simple}
        </g>
         <g className="network-nodes" fill="hsl(var(--primary))" filter="url(#glow)">
            {isComplex ? SVGNetworkNodes.complex : SVGNetworkNodes.simple}
         </g>
      </svg>
    </div>
  );
}
