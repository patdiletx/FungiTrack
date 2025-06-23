'use client';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectToStore() {
  useEffect(() => {
    redirect('/tienda');
  }, []);
  return null; 
}
