'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';

interface ProductImageProps {
  productName: string;
  width: number;
  height: number;
  className?: string;
}

export function ProductImage({ productName, width, height, className }: ProductImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImage() {
      setLoading(true);
      try {
        const result = await generateProductImage({ productName });
        setImageUrl(result.imageDataUri);
      } catch (error) {
        console.error('Error generating product image:', error);
        // Fallback to a placeholder if generation fails
        setImageUrl(`https://placehold.co/${width}x${height}.png`);
      } finally {
        setLoading(false);
      }
    }
    fetchImage();
  }, [productName, width, height]);

  if (loading || !imageUrl) {
    return <Skeleton style={{ width, height }} className={className} />;
  }

  return (
    <Image
      src={imageUrl}
      alt={productName}
      width={width}
      height={height}
      className={className}
    />
  );
}
