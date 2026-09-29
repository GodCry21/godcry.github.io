import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { COUPLE_NAME_LEFT, COUPLE_NAME_RIGHT } from "@/config";
import { motion, AnimatePresence } from "framer-motion";
import React from 'react';

const NAV_LINKS = [
  { name: "Svatební obřad", href: "ceremony" },
  { name: "Dress Code", href: "dresscode" },
  { name: "Ostatní informace", href: "info" },
  { name: "Harmonogram", href: "harmonogram" },
  { name: "Náš příběh", href: "about" },
  { name: "Galerie", href: "galerie" },
  { name: "Často kladené otázky", href: "faq" },
  //{ name: "Formuláře", href: "formulare" },
];

export default function Navbar() {
  const [location, setLocation] = useLocation(); // PŘIDÁNO setLocation
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. NOVÝ EFEKT: Při jakékoliv změně stránky skočíme ihned nahoru
  useEffect(() => {
    if (location === "/") return; 
    
    window.scrollTo(0, 0);
  }, [location]);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location === "/") {
      // 1. Získáme cíl buď ze sessionStorage nebo z URL hashe
      const scrollTarget = sessionStorage.getItem("scrollTarget") || window.location.hash.replace("#", "");
      
      if (!scrollTarget) return;

      const element = document.getElementById(scrollTarget);
      const header = document.querySelector("header");
      
      if (element) {
          setTimeout(() => {
          const headerHeight = header?.offsetHeight || 0;
          const y = element.getBoundingClientRect().top + window.scrollY - headerHeight;

          window.scrollTo({ top: y, behavior: "smooth" });
        }, 100);
        
      }

    // Vždy vyčistíme paměť po pokusu o scroll
    sessionStorage.removeItem("scrollTarget");
    }
  }, [location]);



  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  setIsMobileMenuOpen(false);
  const id = href.replace("#", "").replace("/", "");

  // 1. Pokud odkaz vede na podstránku (začíná lomítkem)
  if (href.startsWith("/")) {
    // Necháme wouter standardně změnit stránku
    return;
  }

  // KLASICKÉ KOTVY (ceremony, about, atd.):
  if (location === "/") {
    e.preventDefault();

    // PŘIDÁN TIMEOUT PRO MOBILY: Počkáme 150ms, až se menu zavře a layout se usadí
    setTimeout(() => {
      const element = document.getElementById(id);
      const header = document.querySelector("header"); // Najdeme navigaci

      if (element) {
        const headerHeight = header?.offsetHeight || 0;
        const y = element.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      //window.history.pushState(null, "", `/#${id}`);
       window.location.hash = id;
    },150); // 150ms stačí pro zavírací animaci menu

  } else {
    e.preventDefault();
    sessionStorage.setItem("scrollTarget", id);
    setLocation("/");
  }
};



  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-none transition-all duration-300 ${
        //isScrolled || location !== "/"
        //isScrolled || (location !== "/" && !location.startsWith("/#") && location !== "/#/rsvp")
        isScrolled
          ? isMobileMenuOpen ? "bg-navigation" : "bg-navigation backdrop-blur-md border-b border-navigation shadow-sm py-3"
          : isMobileMenuOpen ? "bg-navigation" : "bg-navigation/45 py-5"
      }`}
    >
      
      <div className="container mx-auto px-6 flex items-center justify-between gap-6">
        
        <Link href="/" onClick={(e) => handleNavClick(e, "#home")} className="flex flex-col items-start group hover:scale-130 transition-all duration-300 ease-in-out ">
          {/* První jméno */}
          
          {/*(isScrolled || (location !== "/" && !location.startsWith("/#"))) &&(*/}
          {/*(isScrolled)&&(*/}
          {(isScrolled || location !== "/") &&(
          <div>

            <h1 className="font-together tracking-[-0.18em] text-2xl md:text-4xl lg:text-5xl font-light leading-tight drop-shadow-sm">
              <span className="mr-1">{COUPLE_NAME_LEFT.charAt(0)}</span>
              {COUPLE_NAME_LEFT.slice(1)}
            </h1>

            {/* Druhé jméno s ampersandem */}
            <h1 className="font-together tracking-[-0.18em] text-2xl md:text-4xl lg:text-5xl font-light leading-tight 
                          /* Odsazení zleva: na mobilu menší (ml-4), na PC větší (md:ml-8) */
                          ml-3 md:ml-5.5 
                          /* Horní posun: na mobilu trochu přitáhnout nahoru, na PC víc */
                          -mt-3 md:-mt-7 
                          drop-shadow-sm">
              <span className="pr-1 text-[1.4em] leading-none inline-block align-baseline text-[#f0cc9f] group-hover:text-accent transition-all duration-300 ease-in-out ">
                &
              </span>
              <span className="relative -top-1 md:-top-2 lg:-top-2">{COUPLE_NAME_RIGHT}</span>
            </h1>
          </div>
          )}
        </Link>
        


        {/* Desktop Nav */}
        <nav className="hidden 2xl:flex items-center gap-16">
          {NAV_LINKS.map((link, index) => (
            <React.Fragment key={link.name}>
              
              <Link
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={
                  index === 5
                    ? `
                        group relative
                        px-5 py-2.5
                        text-xs uppercase tracking-widest
                        whitespace-nowrap
                        rounded-3xl
                        bg-accent/40
                        border border-accent/30
                        shadow-sm
                        hover:bg-accent
                        hover:text-white
                        hover:scale-115
                        hover:shadow-md
                        transition-all duration-300 ease-in-out
                      `
                    : `
                        group relative
                        py-2
                        text-xs uppercase tracking-widest
                        whitespace-nowrap
                        hover:text-accent
                        hover:scale-120
                        transition-all duration-300 ease-in-out
                        hover:drop-shadow-[0_4px_9px_rgba(0,0,0,1)]
                      `
                }
              >
                {link.name}

                {/* Animovaná linka jen u klasických položek */}
                {index !== 5 && (
                  <span
                    className="
                      absolute bottom-0 left-1/2
                      w-0 h-[1px]
                      bg-accent
                      transition-all duration-300 ease-in-out
                      group-hover:w-full
                      group-hover:left-0
                    "
                  />
                )}
              </Link>

              {/* Oddělovač za zvýrazněným tlačítkem */}
              {index === 4 && (
                <span
                  className="
                    h-6
                    border-l border-current
                    opacity-40
                    self-center
                    mx-[-24px]
                    select-none
                  "
                />
              )}

              {/* Další oddělovač */}
              {index === 5 && (
                <span
                  className="
                    h-6
                    border-l border-current
                    opacity-40
                    self-center
                    mx-[-24px]
                    select-none
                  "
                />
              )}

              {index === 6 && (
                <span className="inline-block mr-[-100px]" />
              )}

            </React.Fragment>
          ))}
        </nav>



        {/* Mobile Nav Toggle */}
        <button
          className="2xl:hidden p-2 -mr-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Otevřít menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 right-0 bg-navigation border-b border-border shadow-lg p-6 2xl:hidden flex flex-col gap-5"
          >
            {NAV_LINKS.map((link, index) => (
  <React.Fragment key={link.name}>
    <Link
      href={link.href}
      onClick={(e) => handleNavClick(e, link.href)}
      className={
        index === 5
          ? `
              relative
              block
              w-full
              max-w-[260px]
              mx-auto
              px-6 py-3
              text-lg
              font-serif
              tracking-wide
              text-center
              rounded-3xl
              bg-accent/40
              border border-accent/30
              shadow-sm
              hover:bg-accent
              hover:text-white
              transition-all duration-300 ease-in-out
            `
          : `
              text-lg
              font-serif
              tracking-wide
              block
              w-full
              text-center
              hover:text-primary
              transition-colors
            `
      }
        >
          {link.name}
        </Link>

        {/* Oddělovač před Galerií */}
        {index === 4 && (
          <span className="w-60 border-b border-current opacity-40 self-center select-none" />
        )}

        {/* Oddělovač za Galerií */}
        {index === 5 && (
          <span className="w-60 border-b border-current opacity-40 self-center select-none" />
        )}

        {/* Stávající odsazení */}
        {index === 6 && (
          <span className="inline-block mb-[-30px]" />
        )}
      </React.Fragment>
    ))}
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
