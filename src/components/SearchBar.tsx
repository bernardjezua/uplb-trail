import React, { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="sticky top-4 sm:top-6 z-50 mx-auto max-w-3xl mb-8">
      <label htmlFor="search" className="sr-only">
        Search directories
      </label>
      <div className="relative group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5 z-20">
          <svg
            className="h-5 w-5 text-up-maroon/70 group-focus-within:text-up-maroon transition-colors"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <Input
          type="search"
          id="search"
          className="w-full rounded-full pl-11 sm:pl-12 h-12 sm:h-14 text-base sm:text-sm bg-white/90 backdrop-blur-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all ring-0! ring-offset-0! focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:border-up-maroon/50 focus-visible:shadow-[0_8px_30px_rgb(123,17,19,0.15)] placeholder:text-zinc-500 placeholder:text-sm sm:placeholder:text-sm font-medium"
          placeholder="Search through UPLB websites"
          value={value}
          onChange={onChange}
          aria-label="Search through UPLB websites"
        />
      </div>
    </div>
  );
}