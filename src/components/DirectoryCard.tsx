import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface LinkItem {
  name: string;
  url: string;
  description: string;
}

export interface DirectoryCardProps {
  item: LinkItem;
}

export function DirectoryCard({ item }: DirectoryCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block outline-none focus-visible:ring-2 focus-visible:ring-up-green focus-visible:ring-offset-2 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-up-maroon/5 group h-full relative"
    >
      {/* Subtle branded border effect on hover - solid maroon tint instead of maroon-to-green gradient */}
      <div className="absolute -inset-0.5 bg-up-maroon/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10"></div>
      
      <Card className="h-full bg-white group-hover:bg-up-maroon/5 transition-colors duration-300 border-zinc-200/60 rounded-xl flex flex-col relative overflow-hidden z-10">
        {/* Accent left border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-up-maroon"></div>

        <CardHeader className="p-4 sm:p-5 flex flex-col gap-1.5 flex-1 pl-5 sm:pl-6">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-up-maroon transition-colors leading-tight font-heading">
              {item.name}
            </CardTitle>
            <div className="w-6 h-6 rounded-full bg-up-green/5 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              <svg 
                className="w-3.5 h-3.5 text-up-green" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5"
                strokeLinecap="round" 
                strokeLinejoin="round" 
              >
                <path d="M7 17l9.2-9.2M17 17V7H7"/>
              </svg>
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm text-zinc-500 font-sans leading-relaxed mt-1 font-medium group-hover:text-zinc-600 transition-colors">
            {item.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </a>
  );
}
