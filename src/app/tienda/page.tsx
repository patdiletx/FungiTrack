'use client';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
export default function TiendaRedirectPage() {
  useEffect(() => {
    redirect('/');
  }, []);
  return null; 
}
