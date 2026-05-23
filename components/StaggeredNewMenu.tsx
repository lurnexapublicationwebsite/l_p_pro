"use client";

import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

// 1. Updated Interface: Added optional subItems for dropdowns
export interface StaggeredMenuItem {
  label: string;
  ariaLabel?: string;
  link: string;
  subItems?: { label: string; link: string }[]; // Array for dropdown links
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  changeMenuColorOnOpen?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  showLogoName?: boolean;
  logoName?: string;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl = '/src/assets/logos/reactbits-gh-white.svg',
  menuButtonColor = '#fff',
  openMenuButtonColor = '#000',
  changeMenuColorOnOpen = true,
  accentColor = '#5227FF',
  isFixed = false,
  onMenuOpen,
  onMenuClose,
  showLogoName = false,
  logoName = '',
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  // --- MULTIPLE DROPDOWN STATE ---
  // Tracks which dropdown label is currently expanded
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  
  const [textLines, setTextLines] = useState<string[]>(['Menu', 'Close']);
  const masterTl = useRef<gsap.core.Timeline | null>(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const offscreen = position === 'left' ? -100 : 100;
      gsap.set(panelRef.current, { xPercent: offscreen, visibility: 'visible' });
      gsap.set(overlayRef.current, { opacity: 0, visibility: 'hidden' });
      gsap.set(plusVRef.current, { rotate: 90, opacity: 1 });
    });
    return () => ctx.revert();
  }, [position]);

  const toggleMenu = useCallback(() => {
    if (busyRef.current) return;
    const isOpening = !openRef.current;
    openRef.current = isOpening;
    busyRef.current = true;

    if (isOpening) {
      setOpen(true);
      onMenuOpen?.();
    } else {
      onMenuClose?.();
      setActiveDropdown(null); // Reset dropdowns on close
    }

    masterTl.current?.kill();
    masterTl.current = gsap.timeline({
      onComplete: () => {
        busyRef.current = false;
        if (!isOpening) setOpen(false);
      }
    });

    const offscreen = position === 'left' ? -100 : 100;
    const itemEls = panelRef.current?.querySelectorAll('.sm-panel-itemLabel');

    if (isOpening) {
      masterTl.current
        .set(overlayRef.current, { visibility: 'visible' })
        .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'none' }, 0)
        .to(panelRef.current, { xPercent: 0, duration: 0.6, ease: 'power4.out' }, 0)
        .to(plusHRef.current, { rotate: 45, duration: 0.4 }, 0)
        .to(plusVRef.current, { rotate: -45, duration: 0.4 }, 0)
        .to(toggleBtnRef.current, { color: openMenuButtonColor, duration: 0.3 }, 0);

      if (itemEls) {
        masterTl.current.fromTo(itemEls, 
          { yPercent: 100, rotate: 5 }, 
          { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.05, ease: 'power4.out' }, 0.2
        );
      }
    } else {
      masterTl.current
        .to(panelRef.current, { xPercent: offscreen, duration: 0.4, ease: 'power2.inOut' }, 0)
        .to(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'none' }, 0.1)
        .set(overlayRef.current, { visibility: 'hidden' })
        .to(plusHRef.current, { rotate: 0, duration: 0.4 }, 0)
        .to(plusVRef.current, { rotate: 90, duration: 0.4 }, 0)
        .to(toggleBtnRef.current, { color: menuButtonColor, duration: 0.3 }, 0);
    }

    const targetLabel = isOpening ? 'Close' : 'Menu';
    setTextLines([isOpening ? 'Menu' : 'Close', '', targetLabel]);
    gsap.fromTo(textInnerRef.current, { yPercent: 0 }, { yPercent: -66.6, duration: 0.8, ease: 'power2.inOut' });
  }, [position, onMenuOpen, onMenuClose, openMenuButtonColor, menuButtonColor]);

  return (
    <div className={`sm-scope ${open ? "fixed inset-0 " : "absolute top-0 left-0 w-full"} z-[9999] pointer-events-none`}>
      <div ref={overlayRef} onClick={toggleMenu} className="fixed inset-0 bg-black/40 z-[5] pointer-events-auto cursor-pointer" style={{ visibility: 'hidden', opacity: 0 }} />

      <div className={`${className || ''} staggered-menu-wrapper relative w-full h-full`}>
        <header className="absolute top-0 left-0 w-full flex items-center justify-between p-[2em] z-20 pointer-events-none">
          <Link href="/" className="flex items-center gap-3 pointer-events-auto no-underline">
            <img src={logoUrl} alt="Logo" className="w-[clamp(40px,6vw,80px)] h-auto" />
            {showLogoName && <span className="text-xl font-semibold text-black">{logoName}</span>}
          </Link>

          <button ref={toggleBtnRef} className="sm-toggle relative flex items-center gap-3 bg-transparent border-0 cursor-pointer pointer-events-auto outline-none" style={{ color: menuButtonColor }} onClick={toggleMenu} type="button">
            <span className="sm-toggle-textWrap relative overflow-hidden h-[1.1em] w-12 text-end">
              <span ref={textInnerRef} className="sm-toggle-textInner flex flex-col">
                {textLines.map((l, i) => <span key={i} className="block h-[1.5em] leading-none uppercase text-xs font-bold">{l}</span>)}
              </span>
            </span>
            <span className="relative w-5 h-5 flex items-center justify-center">
              <span ref={plusHRef} className="absolute w-full h-[2px] bg-current rounded" />
              <span ref={plusVRef} className="absolute w-full h-[2px] bg-current rounded" style={{ opacity: 0 }} />
            </span>
          </button>
        </header>

        <aside ref={panelRef} className="fixed top-0 right-0 h-screen bg-white flex flex-col p-[7em_2em_2em_2em] z-10 pointer-events-auto shadow-[-20px_0_50px_rgba(0,0,0,0.1)]" style={{ width: 'clamp(300px, 45vw, 500px)', visibility: 'hidden' }}>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <nav>
              <ul className="list-none m-0 p-0 flex flex-col gap-6">
                {items.map((it, idx) => {
                  const hasSubItems = it.subItems && it.subItems.length > 0;
                  const isExpanded = activeDropdown === it.label;

                  return (
                    <li key={idx} className="flex flex-col">
                      {hasSubItems ? (
                        <>
                          <button 
                            onClick={() => setActiveDropdown(isExpanded ? null : it.label)}
                            className="group relative flex items-center justify-between w-full text-black font-black text-2xl uppercase border-none bg-transparent cursor-pointer p-0 transition-colors hover:text-[var(--sm-accent)]"
                          >
                            <div className="flex items-baseline overflow-hidden">
                              {displayItemNumbering && <span className="text-xs mr-4 font-normal opacity-40">{(idx + 1).toString().padStart(2, '0')}</span>}
                              <span className="sm-panel-itemLabel inline-block">{it.label}</span>
                            </div>
                            <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[var(--sm-accent)]' : ''}`} size={24} />
                          </button>
                          
                          {/* Sub-menu Content */}
                          <div 
                            className={`ml-8 mt-4 flex flex-col gap-3 transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-60 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}
                          >
                            {it.subItems?.map((sub, sIdx) => (
                              <Link key={sIdx} href={sub.link} onClick={toggleMenu} className="text-sm font-bold text-gray-500 hover:text-black uppercase tracking-widest no-underline transition-colors">
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Link
                          className="group relative flex items-baseline text-black font-black text-2xl uppercase no-underline transition-colors hover:text-[var(--sm-accent)] overflow-hidden"
                          href={it.link}
                          onClick={toggleMenu}
                        >
                          {displayItemNumbering && (
                            <span className="text-xs mr-4 font-normal opacity-40 group-hover:opacity-100">
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                          )}
                          <span className="sm-panel-itemLabel inline-block">{it.label}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {displaySocials && socialItems.length > 0 && (
              <div className="mt-12 border-t border-gray-100 pt-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block mb-4">Follow Us</span>
                <ul className="list-none p-0 flex gap-6 flex-wrap">
                  {socialItems.map((s, i) => (
                    <li key={i}>
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-black no-underline hover:text-[var(--sm-accent)] transition-colors">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      <style suppressHydrationWarning>{`
        .sm-scope { --sm-accent: ${accentColor}; }
        [data-position='left'] aside { right: auto; left: 0; box-shadow: 20px 0 50px rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;