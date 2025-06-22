'use client';

import Image from 'next/image';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrCode({ value, size = 100, className }: QrCodeProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(value)}&size=${size}x${size}&bgcolor=F5F5DC`;

  return (
    <Image
      src={qrUrl}
      width={size}
      height={size}
      alt={`QR Code for ${value}`}
      className={className}
    />
  );
}
