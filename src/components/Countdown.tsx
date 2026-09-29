import { useEffect, useState } from "react";
import { WEDDING_DATE_ISO } from "@/config";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function getCzechLabel(value: number, type: keyof TimeLeft): string {
  if (type === "days") {
    if (value === 1) return "den";
    if (value >= 2 && value <= 4) return "dny";
    return "dní";
  }
  if (type === "hours") {
    if (value === 1) return "hodina";
    if (value >= 2 && value <= 4) return "hodiny";
    return "hodin";
  }
  if (type === "minutes") {
    if (value === 1) return "minuta";
    if (value >= 2 && value <= 4) return "minuty";
    return "minut";
  }
  if (type === "seconds") {
    if (value === 1) return "sekunda";
    if (value >= 2 && value <= 4) return "sekundy";
    return "sekund";
  }
  return "";
}

export default function Countdown() {
  const target = new Date(WEDDING_DATE_ISO).getTime();
  const [time, setTime] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const isPast = Date.now() >= target;

  if (isPast) {
    return (
      <p className="font-serif italic text-white/90 text-lg md:text-xl text-center select-none animate-fade-in">
        Dnes je ten den. Děkujeme, že jste s námi.
      </p>
    );
  }

  // NEPRŮSTŘELNÁ LOGIKA ODKUSOVÁNÍ ZLEVA:
  const hasDays = time.days > 0;
  // Hodiny ukážeme, pokud dny ještě neskončily, NEBO pokud dny už sice skončily, ale hodiny jsou stále > 0
  const hasHours = hasDays || time.hours > 0;
  // Minuty ukážeme, pokud platí časové okno (<=60 dní) A ZÁROVEŇ vyšší řády stále běží, NEBO pokud už zbývají jen minuty samotné
  const hasMinutes = (time.days <= 60) && (hasHours || time.minutes > 0);
  // Vteřiny ukážeme v posledním okně (<=14 dní) za každých okolností, dokud čas nevyprší
  const hasSeconds = time.days <= 14;

  // Sestavení sloupců, které projdou filtrem odkousnutí zleva
  const visibleItems = [];
  if (hasDays) visibleItems.push({ key: "days" as keyof TimeLeft });
  if (hasHours) visibleItems.push({ key: "hours" as keyof TimeLeft });
  if (hasMinutes) visibleItems.push({ key: "minutes" as keyof TimeLeft });
  if (hasSeconds) visibleItems.push({ key: "seconds" as keyof TimeLeft });

  return (
    <div className="w-full flex flex-col items-center justify-center select-none px-2 group/countdown-container">
      
      {/* ŠIROKÁ VEKTOROVÁ MASKA PRO CELÝ ODPOČET */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <clipPath id="hero-single-wide-splat" clipPathUnits="objectBoundingBox">
            <path d="M5,15 C20,8 40,3 65,5 C85,7 96,14 96,24 C96,34 85,42 65,45 C40,48 15,44 5,35 C-2,28 -1,20 5,15 Z" transform="scale(0.01, 0.02)">
              <animate 
                attributeName="d" 
                dur="14s" 
                repeatCount="indefinite" 
                values="
                  M5,15 C20,8 40,3 65,5 C85,7 96,14 96,24 C96,34 85,42 65,45 C40,48 15,44 5,35 C-2,28 -1,20 5,15 Z;
                  M6,18 C25,10 45,6 68,4 C88,2 94,11 94,22 C94,33 82,39 62,42 C38,45 18,46 7,38 C-1,31 -2,24 6,18 Z;
                  M5,15 C20,8 40,3 65,5 C85,7 96,14 96,24 C96,34 85,42 65,45 C40,48 15,44 5,35 C-2,28 -1,20 5,15 Z" 
              />
            </path>
          </clipPath>
        </defs>
      </svg>

      {/* BOX ODPOČTU S ŠIROKOU MASKOU */}
      <div
        className="relative flex items-center justify-center gap-4 sm:gap-6 md:gap-10 bg-white/15 backdrop-blur-md border border-white/20 px-10 py-8 md:px-24 md:py-14 shadow-xl transition-all duration-700 ease-in-out rounded-3xl md:rounded-none md:[clip-path:url(#hero-single-wide-splat)] md:group-hover/countdown-container:scale-[1.02] md:group-hover/countdown-container:bg-white/20 md:group-hover/countdown-container:border-white/30"
      >
        {visibleItems.map(({ key }, idx) => {
          const value = time[key];
          const label = getCzechLabel(value, key);

          return (
            <div key={key} className="flex items-center gap-4 sm:gap-6 md:gap-10 relative z-10">
              
              {/* Číselný blok */}
              <div className="flex flex-col items-center justify-center text-center min-w-[54px] sm:min-w-[64px] md:min-w-[75px] shrink-0">
                <p
                  className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white tabular-nums leading-none drop-shadow-sm"
                  suppressHydrationWarning
                >
                  {String(value).padStart(2, "0")}
                </p>
                <p className="uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[8px] sm:text-[9px] md:text-[10px] text-white/85 mt-2 sm:mt-2.5 font-sans font-bold whitespace-nowrap">
                  {label}
                </p>
              </div>

              {/* Dělicí dvojtečka */}
              {idx < visibleItems.length - 1 && (
                <span className="font-serif text-lg sm:text-2xl md:text-3xl text-white/30 font-light leading-none -mt-3 animate-pulse">
                  :
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
