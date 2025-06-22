'use client';

import { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, Camera, Image as ImageIcon, Plus, Trash2, Network } from "lucide-react";
import { type PhotoEntry, type NotificationSettings, type Kit } from "@/app/lote/[id]/page";
import { ScrollArea } from "../ui/scroll-area";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CareProgressPanelProps {
    isOpen: boolean;
    onClose: () => void;
    photoHistory: PhotoEntry[];
    notificationSettings: NotificationSettings;
    onPhotoUpload: (photo: PhotoEntry) => void;
    onSettingsChange: (settings: NotificationSettings) => void;
    myKits: Kit[];
    currentKitId: string;
}

export function CareProgressPanel({
    isOpen,
    onClose,
    photoHistory,
    notificationSettings,
    onPhotoUpload,
    onSettingsChange,
    myKits,
    currentKitId
}: CareProgressPanelProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMasterToggle = async (enabled: boolean) => {
        if (enabled && typeof window !== 'undefined' && "Notification" in window) {
            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast({
                        variant: 'destructive',
                        title: 'Permiso Denegado',
                        description: 'No se podrán enviar notificaciones de cuidado.'
                    });
                    onSettingsChange({ ...notificationSettings, enabled: false });
                    return;
                }
            }
        }
        onSettingsChange({ ...notificationSettings, enabled });
        if (enabled) {
            new Notification('Simbiosis Conectada', {
                body: 'Las alertas de cuidado están ahora activas.',
                icon: '/logo.png' 
            });
        }
    };
    
    const handleSubToggle = (key: 'watering' | 'aeration', enabled: boolean) => {
        const newSettings = { ...notificationSettings, [key]: { ...notificationSettings[key], enabled }};
        onSettingsChange(newSettings);
    };

    const handleTimeChange = (key: 'watering', time: string) => {
        const newSettings = { ...notificationSettings, watering: { ...notificationSettings.watering, time }};
        onSettingsChange(newSettings);
    };
    
    const handleAerationTimeChange = (index: number, time: string) => {
        const newTimes = [...notificationSettings.aeration.times];
        newTimes[index] = time;
        const newSettings = { ...notificationSettings, aeration: { ...notificationSettings.aeration, times: newTimes }};
        onSettingsChange(newSettings);
    };

    const addAerationTime = () => {
        const newTimes = [...notificationSettings.aeration.times, '12:00'];
        const newSettings = { ...notificationSettings, aeration: { ...notificationSettings.aeration, times: newTimes }};
        onSettingsChange(newSettings);
    };
    
    const removeAerationTime = (index: number) => {
        const newTimes = notificationSettings.aeration.times.filter((_, i) => i !== index);
        const newSettings = { ...notificationSettings, aeration: { ...notificationSettings.aeration, times: newTimes }};
        onSettingsChange(newSettings);
    }


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
            <SheetContent className="bg-[#201A30]/80 text-white border-[#A080E0]/30 backdrop-blur-lg w-[90vw] sm:w-[540px] flex flex-col">
                <SheetHeader className="text-left">
                    <SheetTitle className="font-headline text-3xl text-white">Cuidados y Progreso</SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Configura alertas y registra la evolución de tu cultivo.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-grow pr-4 -mr-6 mt-4">
                    <div className="space-y-6">
                        {/* --- Kit Switcher --- */}
                        <div className="p-4 rounded-lg bg-black/20 border border-white/10">
                            <h3 className="text-lg font-bold flex items-center gap-3 mb-4">
                                <Network className="h-6 w-6 text-[#70B0F0]" />
                                Mis Kits de Cultivo
                            </h3>
                            <div className="space-y-2">
                                {myKits.length <= 1 && (
                                    <p className="text-slate-400 text-sm text-center py-2">
                                        Escanea otro kit para añadirlo a tu red.
                                    </p>
                                )}
                                {myKits.map(kit => (
                                    <Link key={kit.id} href={`/lote/${kit.id}`} passHref>
                                        <Button
                                            variant={kit.id === currentKitId ? "secondary" : "ghost"}
                                            className="w-full justify-start text-left h-auto py-2"
                                            disabled={kit.id === currentKitId}
                                        >
                                            {kit.name}
                                        </Button>
                                    </Link>
                                ))}
                                <Link href="/scan" passHref>
                                     <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent hover:bg-white/10">
                                        <Plus className="mr-2 h-4 w-4" /> Añadir otro Kit
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* --- Notification Settings --- */}
                        <div className="p-4 rounded-lg bg-black/20 border border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="notifications-switch" className="flex items-center gap-3">
                                    <Bell className="h-6 w-6 text-[#70B0F0]" />
                                    <span className="text-lg font-bold">Alertas de Cuidado</span>
                                </Label>
                                <Switch
                                    id="notifications-switch"
                                    checked={notificationSettings.enabled}
                                    onCheckedChange={handleMasterToggle}
                                />
                            </div>
                           
                           <div className={cn("space-y-4 transition-opacity", !notificationSettings.enabled && "opacity-50 pointer-events-none")}>
                                {/* Watering */}
                                <div className="p-3 rounded-md bg-black/20">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="watering-switch" className="font-semibold">Recordatorio de Riego</Label>
                                        <Switch id="watering-switch" checked={notificationSettings.watering.enabled} onCheckedChange={(c) => handleSubToggle('watering', c)}/>
                                    </div>
                                    <div className={cn("mt-2", !notificationSettings.watering.enabled && "opacity-50 pointer-events-none")}>
                                        <Input type="time" value={notificationSettings.watering.time} onChange={(e) => handleTimeChange('watering', e.target.value)} className="bg-slate-800/50 border-slate-700"/>
                                    </div>
                                </div>
                                
                                 {/* Aeration */}
                                <div className="p-3 rounded-md bg-black/20">
                                     <div className="flex items-center justify-between">
                                        <Label htmlFor="aeration-switch" className="font-semibold">Recordatorios de Ventilación</Label>
                                        <Switch id="aeration-switch" checked={notificationSettings.aeration.enabled} onCheckedChange={(c) => handleSubToggle('aeration', c)} />
                                    </div>
                                     <div className={cn("mt-2 space-y-2", !notificationSettings.aeration.enabled && "opacity-50 pointer-events-none")}>
                                        {notificationSettings.aeration.times.map((time, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input type="time" value={time} onChange={(e) => handleAerationTimeChange(index, e.target.value)} className="bg-slate-800/50 border-slate-700"/>
                                                <Button variant="ghost" size="icon" onClick={() => removeAerationTime(index)}>
                                                    <Trash2 className="h-4 w-4 text-red-500/80"/>
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={addAerationTime} className="bg-transparent hover:bg-white/10 w-full">
                                            <Plus className="mr-2 h-4 w-4"/> Añadir Horario
                                        </Button>
                                    </div>
                                </div>
                           </div>

                        </div>

                        {/* --- Photo History --- */}
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
