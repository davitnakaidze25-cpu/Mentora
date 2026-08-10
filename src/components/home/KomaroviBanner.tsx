import React from 'react';
interface KomaroviBannerProps { className?: string; }
export const KomaroviBanner: React.FC<KomaroviBannerProps> = ({ className = '' }) => <div className={`relative w-full aspect-[2.4/1] overflow-hidden border border-neutral-200 dark:border-white/10 shadow-lg ${className}`}><img src="/banner.png" alt="Komarovi School" className="w-full h-full object-cover" /></div>;
