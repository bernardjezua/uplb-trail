"use client";

import { useState, useMemo } from "react";
import uplbLinksData from "@/data/uplb-links.json";
import { SearchBar } from "@/components/SearchBar";
import { DirectoryCard, LinkItem } from "@/components/DirectoryCard";
import { Navbar } from "@/components/Navbar";
import { BackToTopButton } from "@/components/BackToTopButton";
import Image from "next/image";
import Link from "next/link";
import Fuse from "fuse.js";
import { Globe } from "lucide-react";

interface CategoryData {
  category: string;
  links: LinkItem[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const flatLinks = useMemo(() => {
    return (uplbLinksData as CategoryData[]).flatMap((section) =>
      section.links.map((link) => ({ ...link, category: section.category }))
    );
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(flatLinks, {
      keys: [
        { name: "name", weight: 5 },
        { name: "description", weight: 1 },
      ],
      threshold: 0.3,
      distance: 100,
      ignoreLocation: false,
      includeScore: true,
      useExtendedSearch: true,
      findAllMatches: true,
      minMatchCharLength: 2,
    });
  }, [flatLinks]);

  const filteredData = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    
    if (!trimmedQuery) {
      return (uplbLinksData as CategoryData[]).map((section) => ({
        ...section,
        links: [...section.links].sort((a, b) => a.name.localeCompare(b.name)),
      }));
    }

    // Rule 4: Tokenized multi-word search
    // We use space as a separator. Fuse's extended search with ' can handle AND logic.
    const tokens = trimmedQuery.split(/\s+/).filter(t => t.length > 0);
    const searchString = tokens.map(t => `'${t}`).join(' '); // ' prefix means include-match (AND)
    
    let results = fuse.search(searchString);
    
    // Fallback to standard fuzzy if extended search is too restrictive
    if (results.length === 0) {
      results = fuse.search(trimmedQuery);
    }

    const grouped = new Map<string, (LinkItem & { finalScore: number })[]>();

    results.forEach((result) => {
      const item = result.item;
      const name = item.name.toLowerCase();
      const desc = item.description.toLowerCase();
      
      // Rule 6: Relevance Scoring
      // Fuse score is 0 to 1 (0 is best). We'll invert or adjust it.
      let finalScore = result.score || 1;

      // Rule 1 & 2: Prioritize Exact/Word matches in Name
      if (name === trimmedQuery) {
        finalScore *= 0.001; // Massive boost for exact full name match
      } else if (name.includes(trimmedQuery)) {
        finalScore *= 0.1; // Big boost for substring match in name
      } else if (tokens.every(t => name.includes(t) || desc.includes(t))) {
        finalScore *= 0.5; // Boost if all tokens are matched across name/description
      }

      // Rule 5: Prefix matching boost
      if (name.startsWith(trimmedQuery)) {
        finalScore *= 0.8;
      }

      const category = item.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      
      grouped.get(category)!.push({
        name: item.name,
        url: item.url,
        description: item.description,
        finalScore: finalScore,
      });
    });

    // Score each category based on the BEST matching item inside it
    const categoryScores = new Map<string, number>();
    for (const [category, links] of grouped.entries()) {
      const bestScore = Math.min(...links.map(l => l.finalScore));
      categoryScores.set(category, bestScore);
    }

    const categoriesWithLinks = (uplbLinksData as CategoryData[])
      .map((section) => {
        const links = grouped.get(section.category);
        if (links && links.length > 0) {
          return {
            category: section.category,
            // Rule 6: Sort by finalScore, then alphabetical name
            links: links.sort((a, b) => {
              if (a.finalScore !== b.finalScore) {
                return a.finalScore - b.finalScore;
              }
              return a.name.localeCompare(b.name);
            }),
            bestScore: categoryScores.get(section.category) || 1
          };
        }
        return null;
      })
      .filter((section): section is { category: string; links: (LinkItem & { finalScore: number })[]; bestScore: number } => section !== null);

    return categoriesWithLinks
      // Sort the rendered categories so the one containing the *absolute best match* appears at the VERY TOP
      .sort((a, b) => a.bestScore - b.bestScore)
      .map(section => ({ category: section.category, links: section.links }));

  }, [searchQuery, fuse]);

  return (
    <div className="selection:bg-up-maroon/20 flex flex-col flex-1">
      <Navbar />
      {/* Hero / About Section - Full Width */}
      <section id="about" className="w-full relative min-h-[280px] lg:min-h-[380px] flex items-center justify-center overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700 bg-zinc-900 text-white">
        {/* Background Image Container */}
        <div className="absolute inset-0 pointer-events-none">
          <Image 
            src="/img/trail.jpg" 
            alt="UPLB TRAIL - Terminal for Resource Access and Information Links" 
            fill
            sizes="100vw"
            className="object-cover opacity-60"
            priority
          />
          {/* Branded Overlays for Readability */}
          <div className="absolute inset-0 bg-zinc-900/50" />
          <div className="absolute inset-0 bg-linear-to-t from-up-green/70 via-up-green/20 to-transparent" />
        </div>

        {/* Centered Content Overlay */}
        <div className="z-10 px-6 sm:px-8 lg:px-12 py-12 max-w-4xl text-center text-white">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-heading tracking-tight mb-4 lg:mb-6 leading-tight drop-shadow-md">
            Finding UPLB links should be easy.
          </h1>
          <div className="space-y-4 text-sm sm:text-base lg:text-lg leading-relaxed font-heading max-w-2xl mx-auto drop-shadow-sm">
            <p>
              <strong className="text-white font-bold underline decoration-up-maroon decoration-2 underline-offset-4">TRAIL</strong> (Terminal for Resource Access and Information Links) was built to solve the hassle of looking at social media, outdated directories, and search engine clutter. Every link is instantly searchable to save your time.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full relative">
        <div className="text-center mb-6 mt-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-zinc-800 tracking-tight">
            What are you looking for, Isko?
          </h2>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="mb-10 relative z-20">
          <div className="mx-auto max-w-4xl flex flex-col md:flex-row gap-3">
            <div className="flex-1 bg-blue-50/60 border border-blue-200/60 rounded-xl p-4 sm:p-5 text-sm text-blue-800/90 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold mb-1 text-blue-900">How are the links prioritized here?</p>
                  <p className="leading-relaxed text-xs sm:text-sm">
                    To give you the most reliable contact information, links for all UPLB websites follow this priority: 
                    <span className="font-semibold mx-1">Official Website</span> → 
                    <span className="font-semibold mx-1">Facebook Page</span> → 
                    <span className="font-semibold mx-1">Relevant Webpage.</span>
                  </p>
                  <p className="mt-2 text-xs text-blue-700/80">
                    <em>NOTE: Some units may not currently have an active website or social media page, and some units are placed directly under main categories (instead of their parent offices) for quicker access.</em>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="md:w-56 shrink-0 bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 lg:delay-100 flex flex-row md:flex-col items-center justify-center md:text-center gap-3.5 md:gap-0">
              <div className="w-10 h-10 bg-emerald-100/80 rounded-full flex items-center justify-center shrink-0 text-emerald-600 md:mb-2">
                <Image src="/img/Pointer_Icon.png" alt="Pointer Icon" width={32} height={32} className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col md:items-center">
                <p className="font-bold text-emerald-900 text-lg sm:text-xl leading-none font-heading tracking-tight">{flatLinks.length}</p>
                <p className="font-medium text-emerald-700/90 text-sm mt-1">Total Links</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10 pb-16">
          {filteredData.length === 0 ? (
             <div className="py-24 text-center text-zinc-500">
               <p className="text-xl font-semibold text-zinc-900 font-heading tracking-tight">No results found for &quot;{searchQuery}&quot;</p>
               <p className="mt-2 text-base">We couldn&apos;t find anything matching your search.</p>
             </div>
          ) : (
            filteredData.map((section) => (
              <section key={section.category} className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-up-maroon font-heading tracking-tight">
                    {section.category}
                  </h2>
                  <div className="h-px bg-zinc-200 flex-1 mt-1" />
                </div>
                {/* Changed to 2 columns on mobile, up to 4 on desktop */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {section.links.map((link) => (
                    <DirectoryCard key={link.name} item={link} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <div id="contribute-section" className="mt-8 mb-8 mx-auto max-w-3xl bg-up-green rounded-3xl p-6 sm:p-8 text-center shadow-md border border-up-green/20 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-5 backdrop-blur-md shadow-inner relative z-10 transition-transform duration-300 hover:scale-105">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden">
               <Image src="/img/Directory_Icon.png" alt="Directory Icon" width={80} height={80} className="object-cover" />
            </div>
          </div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold font-heading text-white tracking-tight mb-2 sm:mb-3">
            Help Us Improve the Directory!
          </h2>
          <p className="text-green-50/90 mb-6 max-w-xl mx-auto leading-relaxed text-xs sm:text-base">
            Noticed a missing office, an outdated link, or suggestions? We&apos;d love your help to keep this directory useful for every Isko and Iska.
          </p>
          <a
            href="https://forms.gle/M6QocYXp6JymBw2f9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 sm:px-7 sm:py-3.5 bg-white hover:bg-zinc-100 text-up-green text-sm sm:text-base font-semibold rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Contribute Here
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </main>

      <footer className="w-full mt-auto relative bg-zinc-900 border-t border-zinc-800 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        
        {/* Changed justify-between to justify-center and increased gap */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-row items-center justify-center gap-6 sm:gap-8">
          
          {/* Removed white background and extra padding/rounding */}
          <div className="flex items-center shrink-0">
              <Image 
                src="/img/Trail_Logo2.png" 
                alt="UPLB TRAIL Logo" 
                width={75} 
                height={24} 
                className="object-contain" 
              />
          </div>

          <Link 
            href="https://bernardjezua.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-zinc-300 hover:text-amber-400 transition-all duration-300 bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-700 shadow-sm hover:shadow-md hover:border-amber-500/40 hover:-translate-y-0.5 group shrink-0"
          >
            <div className="bg-zinc-700 p-1 rounded-full text-zinc-400 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[10px] md:text-xs uppercase tracking-wider font-sans transition-colors whitespace-nowrap hidden sm:inline-block">
              Developer&apos;s Website
            </span>
            <span className="font-bold text-[10px] uppercase tracking-wider font-sans transition-colors whitespace-nowrap sm:hidden">
              Developer&apos;s Website
            </span>
          </Link>
        </div>
      </footer>
      <BackToTopButton />
    </div>
  );
}
