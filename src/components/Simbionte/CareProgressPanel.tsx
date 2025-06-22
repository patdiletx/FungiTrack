'use client';

import { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Camera, Image as ImageIcon } from "lucide-react";
import { type PhotoEntry, type NotificationSettings } from "@/app/lote/[id]/page";
import { ScrollArea } from "../ui/scroll-area";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CareProgressPanelProps {
    isOpen: boolean;
    onClose: () => void;
    photoHistory: PhotoEntry[];
    notificationSettings: NotificationSettings;
    onPhotoUpload: (photo: PhotoEntry) => void;
    onNotificationToggle: (enabled: boolean) => void;
}

export function CareProgressPanel({
    isOpen,
    onClose,
    photoHistory,
    notificationSettings,
    onPhotoUpload,
    onNotificationToggle,
}: CareProgressPanelProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNotificationToggle = async (enabled: boolean) => {
        if (enabled && typeof window !== 'undefined' && "Notification" in window) {
            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast({
                        variant: 'destructive',
                        title: 'Permiso Denegado',
                        description: 'No se podrán enviar notificaciones de cuidado.'
                    });
                    onNotificationToggle(false); // Ensure the state is toggled back off
                    return;
                }
            }
        }
        onNotificationToggle(enabled);
        if (enabled) {
            toast({
                title: 'Alertas Activadas',
                description: 'Myco te recordará cuándo necesita cuidados.'
            });
            // Example of a test notification
            new Notification('Simbiosis Conectada', {
                body: 'Las alertas de cuidado están ahora activas.',
                icon: '/logo.png' // You might need to add a logo to your public folder
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit for localStorage friendliness
                toast({
                    variant: "destructive",
                    title: "Imagen demasiado grande",
                    description: "Por favor, elige una imagen de menos de 2MB.",
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const newPhoto: PhotoEntry = {
                    url: e.target?.result as string,
                    date: new Date().toISOString(),
                };
                onPhotoUpload(newPhoto);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="bg-[#201A30]/80 text-white border-[#A080E0]/30 backdrop-blur-lg w-[350px] sm:w-[540px] flex flex-col">
                <SheetHeader className="text-left">
                    <SheetTitle className="font-headline text-3xl text-white">Cuidados y Progreso</SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Configura alertas y registra la evolución de tu simbionte.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-grow pr-4 -mr-6 mt-4">
                    <div className="space-y-6">
                        {/* Notification Settings */}
                        <div className="p-4 rounded-lg bg-black/20 border border-white/10">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="notifications-switch" className="flex items-center gap-3">
                                    <Bell className="h-6 w-6 text-[#70B0F0]" />
                                    <span className="text-lg font-bold">Alertas de Cuidado</span>
                                </Label>
                                <Switch
                                    id="notifications-switch"
                                    checked={notificationSettings.enabled}
                                    onCheckedChange={handleNotificationToggle}
                                />
                            </div>
                            <p className="text-sm text-slate-400 mt-2">
                                Recibe recordatorios para rociar con agua y ventilar tu kit.
                            </p>
                        </div>

                        {/* Photo History */}
                        <div className="p-4 rounded-lg bg-black/20 border border-white/10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-3">
                                    <ImageIcon className="h-6 w-6 text-[#70B0F0]" />
                                    Historial de Progreso
                                </h3>
                                <Button
                                    variant="outline"
                                    className='bg-transparent hover:bg-[#70B0F0]/20'
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="mr-2 h-4 w-4" />
                                    Subir Foto
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                {photoHistory.length === 0 && (
                                    <p className="text-slate-400 text-sm col-span-full text-center py-4">
                                        Aún no has subido ninguna foto.
                                    </p>
                                )}
                                {photoHistory.slice().reverse().map((photo) => (
                                    <div key={photo.date} className="relative group aspect-square">
                                        <Image
                                            src={photo.url}
                                            alt="Progreso del cultivo"
                                            layout="fill"
                                            className="rounded-md object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs text-center p-1 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
                                            {format(new Date(photo.date), "d MMM yyyy, HH:mm", { locale: es })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
