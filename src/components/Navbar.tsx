"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Show only at the top, hide when scrolled down
      if (window.scrollY <= 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToContribute = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contributeSection = document.getElementById("contribute-section");
    if (contributeSection) {
      contributeSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-100 transition-transform duration-300 ease-in-out bg-up-maroon/95 backdrop-blur-md border-b-[3px] border-up-green/80 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-6xl px-3 sm:px-6 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <a href="#" className="relative flex items-center opacity-90 hover:opacity-100 transition-opacity">
              <Image 
                src="/img/Trail_Logo2.png" 
                alt="UPLB TRAIL Logo" 
                width={200} 
                height={64} 
                className="object-contain h-10 sm:h-12 md:h-14 w-auto" 
                priority
              />
            </a>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-4 md:gap-6 text-[11px] sm:text-[13px] md:text-sm font-semibold font-sans tracking-wide">
            <a href="#about" className="text-zinc-300 hover:text-white transition-colors px-1 sm:px-2 py-1">
              About
            </a>
            <a href="https://bernardjezua.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors px-1 sm:px-2 py-1">
              Contact
            </a>
            <a 
              href="#contribute-section" 
              onClick={handleScrollToContribute} 
              className="ml-0.5 sm:ml-2 px-3 py-1.5 sm:px-5 sm:py-2.5 bg-white text-up-maroon hover:bg-zinc-100 rounded-full transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 font-bold text-[10px] sm:text-[11px] md:text-xs tracking-wider whitespace-nowrap"
            >
              Contribute
            </a>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding under the fixed navbar */}
      <div className="h-[60px] sm:h-[68px] w-full" />
    </>
  );
}
