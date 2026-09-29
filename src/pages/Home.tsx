import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Countdown from "@/components/Countdown";

import { MyMap } from "@/components/WeddingMap";
import { CalendarPlus, Gift, CheckCircle2, HeartHandshake, AlertTriangle, ArrowRight, ClipboardCheck } from "lucide-react";
import { GiBowTie, GiHighHeel } from "react-icons/gi";
import { TbBed } from "react-icons/tb";
import { FaCarAlt } from "react-icons/fa";
import { SlUser, SlUserFemale  } from "react-icons/sl";
import { CiCircleQuestion } from "react-icons/ci";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  COUPLE_NAME_LEFT,
  COUPLE_NAME_RIGHT,
  WEDDING_DATE_DISPLAY,
  VENUE_NAME,
  VENUE_ADDRESS,
  RSVP_DEADLINE_DISPLAY,
  MAP_NAVIGATE,
} from "@/config";

import ContactForm from "./ContactForm";
import QRCode from "./QRcode";


import { useState } from "react";
import CalendarButtons from "@/components/ui/calendarButton";


const FADE_IN = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};



const FAQ = [
  {
    id: "faq-1",
    q: "Jak zjistím zda jsem pozvaný na hostinu?",
    a: 'Vyplněním <a href="/rsvp" class="standard-link hover:underline font-medium transition-all duration-500">potvrzovacího formuláře</a>, případně kdo dostal oznámení s kartičkou navíc, tak je zván.<br/>Potvrzovací formulář je chytrý formulář, který rozpozná, zda jste pozvaní na hostinu, nebo ne.',
  },
  {
    id: "faq-2",
    q: "Mohu vzít s sebou doprovod?",
    a: 'Na obřad klidně. Na hostinu počítáme pouze s pozvanými. <a href="#faq-1" class="standard-link hover:underline font-medium transition-all duration-500">Jak zjistím zda jsem pozvaný na hostinu?</a>',
  },
  {
    id: "faq-3",
    q: "Do kdy musím potvrdit účast?",
    a: "Prosíme o potvrzení nejpozději do 8. srpna 2026, abychom stihli připravit zasedací pořádek a catering.",
  },
  /*
  {
    id: "faq-4",
    q: "Jsem zvaný pouze na obřad. Musím potvrzovat účast?",
    a: "NE, účast je potřeba potvrdit hlavně pro lidi, kteří jsou zvaní na hostinu. Prostor pro obřad nemá omezenou kapacitu, takže můžete na obřad dojít i bez potvrzení účasti.",
  },
  */
  {
    id: "faq-5",
    q: "Kde mohu zaparkovat?",
    a: "Parkování je vyznačeno na mapě. Na místě vám ukážeme, kde přesně v areálu zaparkovat. Prosíme přijeďte alespoň s 30 minutovým předstihem.",
  },
  {
    id: "faq-6",
    q: "Mohu během obřadu fotit?",
    a: "Prosíme, během samotného obřadu nechte fotoaparáty a telefony stranou — máme profesionální fotografy. Po obřadu již klidně fotit můžete a budeme rádi za nasdílení vašich fotek a videí.",
  },
  {
    id: "faq-7",
    q: "Co když nemůžu přijít?",
    a: "I přes to nám prosím dejte vědět prostřednictvím formuláře, že nedorazíte. Děkujeme za pochopení.",
  },
];

const HARMONOGRAM = [ // allert - 0,1,2,100
  {
    time: "10:00",
    title: "Příjezd hostů",
    note: "",
    allert: 1,
  },
  {
    time: "11:00",
    title: "Svatební obřad",
    note: "",
    allert: 100,
  },
  {
    time: "",
    title: "Společné foto\nGratulace",
    note: "Focení s gratulacemi převážně lidí, kteří jsou pouze na obřad.",
    allert: 0,
  },
  {
    time: "13:30",
    title: "Svatební hostina",
    note: "",
    allert: 2,
  },
  {
    time: "",
    title: "Krájení dortu\nSkupinové focení a gratulace",
    note: "",
    allert: 0,
  },
  {
    time: "16:30",
    title: "Svatební hry",
    note: "",
    allert: 1,
  },
  {
    time: "",
    title: "Focení novomanželů",
    note: "",
    allert: 0,
  },
  {
    time: "18:30",
    title: "Házení kytice",
    note: "",
    allert: 2,
  },
  {
    time: "19:00",
    title: "Svatební hry",
    note: "",
    allert: 1,
  },
  {
    time: "19:00",
    title: "Večerní grilování",
    note: "",
    allert: 0,
  },
  {
    time: "20:00",
    title: "První tanec novomanželů",
    note: "",
    allert: 2,
  },

];

const OSTATNI_INFORMACE = [
  {
    title: "Doprava",
    icon: "🚗",
    items: [
      { label: "Trasa", text: "Jeďte prosím přes Sokoleč. Cesta přes Vrbovou Lhotu je neprůjezdná." },
      { label: "Parkování", text: "Zajištěno přímo v areálu pro všechny hosty." },
      { label: "Svoz z nádraží", text: "Pro hosty jedoucí vlakem zajistíme od 9:30 do 10:30 odvoz z Poděbrad. Po obřadu zajistíme svoz zase zpátky na poděbradské nádraží." },
      { label: "Formulář", text: "Dejte nám prosím ve formuláři vědět, zda svoz využijete, ať víme, pro koho přijet." },
    ],
    actions: [
      { label: "Nahlásit zájem o svoz", link: "/rsvp", variant: "primary" },
      { label: "Zobrazit trasu na mapě", link: MAP_NAVIGATE, variant: "outline" }
    ]
  },
  {
    title: "Ubytování",
    icon: "🛌",
    highlight: "UBYTOVÁNÍ POUZE PRO POZVANÉ KE SVATEBNÍMU STOLU",
    items: [
      { label: "Rodina", text: "Zajištěno v hotelu v blízkém městě." },
      { label: "Royalisti", text: "Spaní ve stanech či glampingu přímo na místě." },
      { label: "Rezervace", text: "Vyberte si prosím variantu v našem formuláři." },
    ]
  },
  {
    title: "Dary",
    icon: "🎁",
    items: [
      { label: "Příspěvek", text: "Budeme rádi za finanční dar, za který si vybavení koupíme sami" },
      { label: "Věcné dary", text: "Pokud raději dáváte hmatatelné věci, vyberte si prosím položku ze seznamu níže." },
      { label: "Rezervace", text: "Věc si prosím zarezervujte ve formuláři - ať se nám nesejde šest sad příborů! 😆" },
    ],
    actions: [
      { label: "Seznam věcných darů", link: "/gifts-reservation", variant: "primary" }
    ]
  }
];





export default function Home() {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      
      
      

      <main>
        
        {/* Hero Section */}
        <section
          id="home"
          className="relative min-h-[100dvh] flex flex-col justify-between overflow-hidden pt-20 pb-10" 
         >
          {/* POZADÍ */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">

            {/* Rozmazané pozadí */}
            <img
              src="/madeIT.webp"
              alt=""
              aria-hidden="true"
              className="
                absolute
                inset-[-5%]
                w-[110%]
                h-[110%]
                object-cover
                blur-[45px]
                scale-110
                opacity-90
              "
            />

            {/* Ostrá fotografie */}
            <img
              src="/madeIT.webp"
              alt="Svatební foto"
              className="
                absolute
                inset-0
                z-10
                w-full
                h-full
                object-contain
              "
            />

            {/* Plynulé ztmavení přes celou fotku */}
            <div
              className="
                absolute
                inset-0
                z-20
                bg-gradient-to-r
                from-black/15
                via-transparent
                to-black/15
                pointer-events-none
              "
            />

            {/* Jemné celkové ztmavení kvůli textu */}
            <div className="absolute inset-0 z-20 bg-black/10 pointer-events-none" />

          </div>

          <div className="relative z-20 text-left text-white px-6 w-full max-w-4xl mx-auto flex flex-col h-full grow">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative flex flex-col h-full"
            >
              {/* 1. SEKCE: BUDE SVATBA + JMÉNA (posunuto nahoru přes mt-10 nebo flex-none) */}
              <div className="relative mt-10 md:mt-20">
                <div className="absolute -top-12 right-10 rotate-[9deg] z-50">
                  <p className="font-together tracking-[-0.18em] text-3xl md:text-5xl lg:text-6xl mb-6 font-medium text-[#f0cc9f] hover:text-accent transition-all duration-300 ease-in-out drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
                    <span className="mr-[0.1em]">J</span>iž<span className="inline-block w-[0.3em]"></span>se<span className="inline-block w-[0.3em]"></span>vzali!
                  </p>
                </div>

                <div className="group">
                  <h1 className="font-together tracking-[-0.18em] text-8xl md:text-10xl lg:text-11xl font-light leading-tight -mb-16 drop-shadow-sm">
                    <span className="mr-3">{COUPLE_NAME_LEFT.charAt(0)}</span>
                    {COUPLE_NAME_LEFT.slice(1)}
                  </h1>
                  <h1 className="font-together tracking-[-0.18em] text-8xl md:text-10xl lg:text-11xl font-light leading-tight ml-10 drop-shadow-sm">
                    <span className="pr-1 text-[1.4em] leading-none inline-block align-bottom text-[#f0cc9f] group-hover:text-accent transition-all duration-300 ease-in-out">&</span>
                    <span className="relative -top-2">{COUPLE_NAME_RIGHT}</span>
                  </h1>
                </div>
              </div>

              {/* 2. MEZERA: Tento div odtlačí datum dolů */}
              <div className="flex-grow min-h-[50px]"></div>

              {/* 3. SEKCE: DATUM + ADRESA (ukotveno dole) */}
              <div className="flex flex-col gap-4 mb-10"> 
                <h2 className="font-together tracking-[-0.05em] text-4xl md:text-6xl lg:text-7xl font-light leading-none drop-shadow-sm opacity-80">
                  <span>{WEDDING_DATE_DISPLAY.slice(0, -5)}</span>
                  <span className="tracking-[-0.05em]">{WEDDING_DATE_DISPLAY.slice(-5)}</span>
                </h2>
                <h2 className="uppercase font-tanvivre-libre tracking-[-0.11em] text-2xl md:text-4xl lg:text-5xl font-light leading-none drop-shadow-sm opacity-70">
                  <a 
                    href={MAP_NAVIGATE} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    // px-2 a py-1 zajistí, že jemné podbarvení bude mít kolem písmen kousek volného místa a neořízne se natěsno
                    className="transition-all duration-300 rounded px-2 py-1 hover:scale-120 hover:bg-primary/60 active:scale-98"
                  >
                    {VENUE_NAME}
                  </a>

                </h2>
                <div className="pt-5">
                  <Link
                    href="/galerie"
                    className="
                      group
                      inline-flex
                      items-center
                      gap-3

                      rounded-full
                      border
                      border-[#f0cc9f]/80
                      bg-[#f0cc9f]

                      px-7
                      py-3.5

                      text-sm
                      sm:text-base
                      font-semibold
                      tracking-[0.11em]
                      uppercase
                      text-stone-900

                      shadow-[0_10px_35px_rgba(240,204,159,0.28)]
                      backdrop-blur-md

                      transition-all
                      duration-500

                      hover:bg-[#f6d9b5]
                      hover:border-[#f6d9b5]
                      hover:shadow-[0_14px_45px_rgba(240,204,159,0.42)]
                      hover:-translate-y-1
                      hover:scale-[1.02]

                      active:translate-y-0
                      active:scale-[0.99]
                    "
                  >
                    <span>Prohlédnout galerii</span>

                    <span
                      className="
                        text-xl
                        leading-none
                        transition-transform
                        duration-500
                        group-hover:translate-x-1.5
                      "
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            {/*
                    
                    <div className="flex justify-center w-full mb-6">
                      <p className="font-serif italic text-white/90 text-xl md:text-2xl tracking-wide select-none transition-transform duration-700 group-hover/hero:scale-105 group-hover/hero:rotate-[-0.5deg]">
                        Do svatby zbývá:
                      </p>
                    </div>

                    * Komponenta odpočtu – nyní už v sobě sama řeší skleněné pilulky i mizení sloupců 
                    <div className="mb-14 flex justify-center w-full relative">
                      <div className="relative z-10 transition-transform duration-500 group-hover/hero:scale-[1.01] w-full">
                        <Countdown />
                      </div>
                    </div>
                    *

                    * Lišta tlačítek (Vyčištěný styl bez okrajů přesně podle screenshotu)
                    <div className="grid grid-cols-2 sm:flex items-center justify-center gap-4 sm:gap-6 mt-4 w-full max-w-md sm:max-w-none mx-auto relative z-20">
                      
                      * 1. TLAČÍTKO RSVP 
                      <div className="col-span-2 sm:col-span-1 w-full sm:w-auto">
                        <Link href="/rsvp" className="w-full inline-block">
                          <Button
                            size="lg"
                            className="group/btn cursor-pointer w-full sm:w-auto rounded-full bg-white border-0 shadow-md text-stone-950 hover:bg-white hover:shadow-xl hover:scale-105 active:scale-98 uppercase tracking-widest text-[11px] font-bold px-8 h-15 transition-all duration-300 flex items-center justify-center gap-3"
                          >
                            <CheckCircle2 
                              strokeWidth={2} 
                              style={{ width: '18px', height: '18px' }} 
                              className="text-stone-950 transition-transform duration-300 ease-in-out group-hover/btn:scale-110 group-hover/btn:text-primary" 
                            />
                            <span>Potvrdit účast</span>
                          </Button>
                        </Link>
                      </div>

                      * 2. TLAČÍTKO DARY 
                      <div className="flex justify-end sm:justify-start">
                        <Link href="/gifts-reservation" className="inline-block">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="group/btn cursor-pointer h-15 w-15 rounded-full bg-white border-0 shadow-md transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95 flex items-center justify-center"
                          >
                            <Gift 
                              strokeWidth={2} 
                              style={{ width: '26px', height: '26px' }} 
                              className="text-stone-950 transition-transform duration-300 ease-in-out group-hover/btn:-translate-y-0.5 group-hover/btn:text-primary" 
                            />
                          </Button>
                        </Link>
                      </div>

                      * 3. TLAČÍTKO KALENDÁŘ 
                      <CalendarButtons />
                      

                    </div>


                    */}
                  </motion.div>
                </div>
              </section>
{/*

              * Svatební obřad *
              <section id="ceremony" className="py-24 md:py-32 px-6 overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                  <motion.div {...FADE_IN} className="text-center mb-16">
                    <h2 className="font-serif text-4xl md:text-5xl mb-6 text-primary font-light">
                      Svatební obřad
                    </h2>
                  </motion.div>

                  * Hlavní velký zaoblený kontejner *
                  <div className="relative flex flex-col md:flex-row gap-0 shadow-md border border-border/40 rounded-3xl overflow-hidden bg-white/40 backdrop-blur-sm group/ceremony">
                    
                    * 1. LEVÁ STRANA: MAPA SE ŠIKMÝM OŘEZEM NA DESKTOPU *
                    <div className="w-full md:w-1/2 min-h-[380px] md:min-h-[480px] relative z-10 md:[clip-path:polygon(0_0,_100%_0,_88%_100%,_0%_100%)] transition-all duration-700 md:group-hover/ceremony:[clip-path:polygon(0_0,_100%_0,_91%_100%,_0%_100%)]">
                      <MyMap />
                    </div>

                    * 2. PRAVÁ STRANA: TEXTOVÉ INFORMACE S VODOZNAKEM *
                    <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center relative overflow-hidden md:-ml-[4%] md:pl-[6%] z-0">
                      
                      * OBŘÍ JEMNÝ VODOZNAK NA POZADÍ (Propletený symbol lásky) *
                      <div className="absolute -bottom-12 -right-12 opacity-[0.02] text-stone-900 pointer-events-none transition-transform duration-1000 ease-out group-hover/ceremony:scale-110 group-hover/ceremony:-rotate-12">
                        <HeartHandshake style={{ width: '280px', height: '280px' }} strokeWidth={1} />
                      </div>

                      * Mřížka s údaji *
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8 relative z-10">
                        <div className="relative">
                          <p className="uppercase tracking-widest text-[10px] font-bold text-stone-400 mb-1">
                            Datum
                          </p>
                          <p className="font-serif text-2xl text-primary font-medium">
                            {WEDDING_DATE_DISPLAY}
                          </p>
                          <div className="absolute bottom-[-6px] left-0 w-8 h-0.5 bg-primary/20 rounded-full" />
                        </div>
                        
                        <div className="relative">
                          <p className="uppercase tracking-widest text-[10px] font-bold text-stone-400 mb-1">
                            Čas obřadu
                          </p>
                          <p className="font-serif text-2xl text-primary font-medium">
                            11:00
                          </p>
                          <div className="absolute bottom-[-6px] left-0 w-8 h-0.5 bg-primary/20 rounded-full" />
                        </div>

                        <div className="sm:col-span-2 mt-2">
                          <p className="uppercase tracking-widest text-[10px] font-bold text-stone-400 mb-1">
                            Místo
                          </p>
                          <p className="font-serif text-2xl text-stone-800 font-medium mb-1.5 leading-tight">
                            {VENUE_NAME}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                            {VENUE_ADDRESS}
                          </p>
                        </div>
                      </div>

                      * Doprovodný text *
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed text-xs font-serif mb-0 relative z-10 border-l border-primary/20 pl-4 py-1">
                        Vezmeme se hned při vjezdu do areálu.
                        <br/> Prosíme, doražte
                        alespoň 30 minut před začátkem, abyste si v klidu našli
                        své místo.
                      </p>

                    </div>
                  </div>
                </div>
              </section>


              * Dress Code *
              <section id="dresscode" className="py-24 md:py-32 px-6 bg-secondary/30">
                <div className="container mx-auto max-w-5xl">
                  <motion.div {...FADE_IN} className="text-center mb-8">
                    <h2 className="font-serif text-4xl md:text-5xl mb-6 text-primary font-light">
                      Dress Code
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed font-serif text-sm">
                        Budeme rádi, když sladíte svůj outfit do jedné z následujících barev.<br/>
                        Pokud nic v barvě nemáte, doražte i tak.
                    </p>
                    <p className="uppercase text-muted-foreground max-w-2xl mt-2 mx-auto leading-relaxed font-serif text-xs">
                    Vaše přítomnost je pro nás důležitější než barva oblečení
                    </p>
                  </motion.div>

                  <motion.div
                    {...FADE_IN}
                    className="mb-12 max-w-2xl mx-auto text-center"
                  >
                    <div className="inline-block w-full group/palette">
                      * 1. HYDRODYNAMICKÉ SVG MASKY S ANIMACÍ TVARU *
                      <svg className="absolute w-0 h-0" aria-hidden="true">
                        <defs>
                          <clipPath id="liquid-splat-0" clipPathUnits="objectBoundingBox">
                            <path d="M25,5 C35,5 45,15 45,25 C45,38 33,45 22,45 C10,45 5,33 5,22 C5,10 12,5 25,5 Z" transform="scale(0.02)">
                              <animate attributeName="d" dur="6s" repeatCount="indefinite"
                                values="
                                  M25,5 C35,5 45,15 45,25 C45,38 33,45 22,45 C10,45 5,33 5,22 C5,10 12,5 25,5 Z;
                                  M25,7 C38,4 43,18 43,28 C43,35 30,42 20,42 C12,42 7,31 7,20 C7,9 12,10 25,7 Z;
                                  M25,5 C35,5 45,15 45,25 C45,38 33,45 22,45 C10,45 5,33 5,22 C5,10 12,5 25,5 Z
                                " />
                            </path>
                          </clipPath>

                          <clipPath id="liquid-splat-1" clipPathUnits="objectBoundingBox">
                            <path d="M20,8 C32,4 42,12 44,22 C46,34 36,44 26,46 C14,48 4,38 6,26 C8,14 10,12 20,8 Z" transform="scale(0.02)">
                              <animate attributeName="d" dur="7s" repeatCount="indefinite"
                                values="
                                  M20,8 C32,4 42,12 44,22 C46,34 36,44 26,46 C14,48 4,38 6,26 C8,14 10,12 20,8 Z;
                                  M22,5 C30,8 45,10 42,24 C39,38 33,42 23,44 C13,46 5,35 8,24 C11,13 14,2 22,5 Z;
                                  M20,8 C32,4 42,12 44,22 C46,34 36,44 26,46 C14,48 4,38 6,26 C8,14 10,12 20,8 Z
                                " />
                            </path>
                          </clipPath>

                          <clipPath id="liquid-splat-2" clipPathUnits="objectBoundingBox">
                            <path d="M25,5 C38,2 46,14 42,26 C38,38 44,46 30,46 C16,46 6,36 6,24 C6,12 12,8 25,5 Z" transform="scale(0.02)">
                              <animate attributeName="d" dur="5s" repeatCount="indefinite"
                                values="
                                  M25,5 C38,2 46,14 42,26 C38,38 44,46 30,46 C16,46 6,36 6,24 C6,12 12,8 25,5 Z;
                                  M24,7 C35,7 42,11 45,22 C48,33 39,43 28,43 C17,43 8,38 7,27 C6,16 13,7 24,7 Z;
                                  M25,5 C38,2 46,14 42,26 C38,38 44,46 30,46 C16,46 6,36 6,24 C6,12 12,8 25,5 Z
                                " />
                            </path>
                          </clipPath>
                        </defs>
                      </svg>

                      * 2. ŽIVÁ AKVARELOVÁ PALETA S NÁZVY *
                      <div className="grid grid-cols-5 sm:flex sm:items-start sm:justify-center gap-1 sm:gap-6 p-2 sm:p-6 w-full max-w-lg sm:max-w-2xl mx-auto justify-items-center">
                        {[
                          { id: "#ffcac1", name: "Lososová" },
                          { id: "#c18a8a", name: "Starorůžová" },
                          { id: "#fff9b7", name: "Jemně žlutá" },
                          { id: "#848b04", name: "Olivová" },
                          { id: "#99e2ff", name: "Nebeská" }
                        ].map((item, index) => {
                          const maskId = index % 3;
                          
                          return (
                            <div
                              key={item.id}
                              // w-full zajistí, že buňka využije přesně svůj 1 sloupec z mřížky. p-1 zamezí přetečení okrajů.
                              className="group relative flex flex-col items-center cursor-pointer p-1 sm:p-4 w-full sm:w-28 text-center"
                            >
                              * Rozprsknuté kapičky (Zobrazené pouze na PC, na mobilu skryté, aby nepřetékaly) *
                              <div className="absolute top-2 inset-x-0 h-14 pointer-events-none opacity-0 scale-70 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-110 hidden sm:block">
                                <span className="absolute top-0 left-1/4 w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: item.id, animationDelay: '0.1s' }} />
                                <span className="absolute bottom-1 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: item.id }} />
                                <span className="absolute top-1/2 -left-1 w-1 h-1 rounded-full" style={{ backgroundColor: item.id }} />
                                <span className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.id }} />
                              </div>

                              * Hlavní vlnící se kaňka (Automatická šířka aspect-square na mobilu, pevná 80px na PC) *
                              <span
                                className="w-full aspect-square max-w-[56px] sm:max-w-none sm:w-20 sm:h-20 shadow-[inset_0_3px_6px_rgba(0,0,0,0.08)] border border-stone-900/5 transition-all duration-700 ease-in-out group-hover:scale-110 sm:group-hover:scale-125 group-hover:rotate-[15deg] group-hover:shadow-lg"
                                style={{
                                  backgroundColor: item.id,
                                  clipPath: `url(#liquid-splat-${maskId})`,
                                  animationDelay: `${index * 0.4}s`, 
                                }}
                                aria-label={item.name}
                              />
                              
                              * Název barvy (Menší text a automatické zalamování slov pro úzké displeje) *
                              <span className="text-[9px] sm:text-[11px] tracking-wide text-stone-500 font-medium mt-2 transition-all duration-300 group-hover:text-stone-900 group-hover:scale-105 block whitespace-nowrap">
                                {item.name}
                              </span>
                            </div>
                          );


                        })}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    {...FADE_IN}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >

                      * 1. KARTA: PRO DÁMY *
                      <div className="relative overflow-hidden bg-white/25 border border-border/40 p-8 text-center rounded-2xl backdrop-blur-sm shadow-sm flex flex-col justify-between min-h-[280px] group">
                        * Obří jemný vodoznak na pozadí *
                        <div className="absolute -bottom-1 right-1 opacity-[0.03] text-stone-900 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                          <GiHighHeel style={{ width: '140px', height: '140px', transform: "scaleX(-1)"  }} strokeWidth={1} />
                        </div>
                        
                        <div className="relative z-10 my-auto">
                          <h3 className="font-serif text-2xl mb-3 text-primary font-medium">Pro dámy</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                            Dámám doporučujeme vzít si pohodlnou obuv jako sandále nebo balerínky. Obřad i hostina bude totiž probíhat na trávě.
                          </p>
                        </div>
                      </div>


                                  * 2. KARTA: PRO PÁNY *
                      <div className="relative overflow-hidden bg-white/25 border border-border/40 p-8 text-center rounded-2xl backdrop-blur-sm shadow-sm flex flex-col justify-between min-h-[280px] group">
                        * Obří jemný vodoznak na pozadí *
                        <div className="absolute -bottom-6 -right-6 rotate-12 opacity-[0.03] text-stone-900 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-24">
                          <GiBowTie style={{ width: '160px', height: '160px' }} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 my-auto">
                          <h3 className="font-serif text-2xl mb-3 text-primary font-medium">Pro pány</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                            Pánům postačí vzít si k běžnému obleku košili, kravatu nebo motýlka v barvách dresscodu.
                          </p>
                        </div>
                      </div>
                                  * 3. KARTA: BARVY K VYNECHÁNÍ *
                      <div className="bg-white/25 border border-border/40 p-8 text-center rounded-2xl backdrop-blur-sm shadow-sm flex flex-col justify-between min-h-[280px]">
                        <div className="mb-4">
                          <h3 className="font-serif text-2xl mb-2 text-primary font-medium">Barvy, které prosíme vynechat</h3>
                          <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
                            Prosíme vynechte tyto barvy – ty si necháme pro nevěstu a na výzdobu.
                          </p>
                        </div>

                        * Kosodélníky – zvětšená výška na h-32 pro perfektní zarovnání s ostatními kartami *
                        <div className="flex gap-3 items-center justify-center w-full mt-auto">
                          {[
                            { id: "Bílá", color: "#ffffff" },
                            { id: "Šalvějová", color: "#a6b8a3" },
                            { id: "Meruňková", color: "#f7b673" },
                          ].map((item) => (
                            <div key={item.id} className="group flex flex-col items-center cursor-pointer flex-1 w-0 min-w-0">
                              <div
                                className={`w-full h-20 border shadow-sm transition-all duration-300 ease-out skew-x-[-18deg] origin-center hover:scale-y-105 hover:-translate-y-1 hover:shadow-md ${
                                  item.id === 'Bílá' ? 'border-stone-300/80' : 'border-stone-900/5'
                                }`}
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-[9px] uppercase tracking-widest text-stone-400 font-semibold mt-2 w-full flex items-center justify-center text-center group-hover:text-stone-800 transition-colors">
                                {item.id}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>


                  </motion.div>

                  
                </div>
              </section>


              * Ostatní informace *
              <section id="info" className="py-24 md:py-32 px-6 bg-secondary/10 overflow-hidden group/info-section">
                <div className="container mx-auto max-w-6xl">
                  <h2 className="font-serif text-4xl md:text-5xl text-center text-primary mb-20 font-light">
                    Ostatní informace
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch">
                    {OSTATNI_INFORMACE.map((sekce, idx) => {
                      const isDoprava = sekce.title.toLowerCase().includes("doprava");
                      const isUbytovani = sekce.title.toLowerCase().includes("ubytování");
                      const IconComponent = isDoprava ? FaCarAlt : isUbytovani ? TbBed : Gift;

                      // Každá karta se při najetí myší na sekci nakloní pod jiným úhlem (harmonikový efekt)
                      const rotationAngles = [
                        "md:hover:rotate-[-1.5deg] md:hover:-translate-y-2", 
                        "md:hover:scale-[1.02] md:hover:-translate-y-3", 
                        "md:hover:rotate-[1.5deg] md:hover:-translate-y-2"
                      ];
                      const hoverAnimation = rotationAngles[idx];

                      return (
                        <div 
                          key={sekce.title} 
                          className={`group relative flex flex-col h-full bg-white/50 border border-border/40 p-8 sm:p-10 rounded-3xl backdrop-blur-sm shadow-sm transition-all duration-400 overflow-hidden ${hoverAnimation}`}
                        >
                          * OBŘÍ LUXUSNÍ VODOZNAK NA POZADÍ *
                          <div className="absolute -bottom-8 -right-8 opacity-[0.02] text-stone-900 pointer-events-none transition-transform duration-1000 ease-out group-hover:scale-125 group-hover:-rotate-12">
                            <IconComponent style={{ width: '240px', height: '240px' }} strokeWidth={1} />
                          </div>

                          * Horní obsahová část *
                          <div className="flex-grow relative z-10">
                            
                            * NADPIS A IKONA V JEDNOM ŘÁDKU – IKONA JE ÚPLNĚ VPRAVO BEZ POZADÍ A OBRYSU *
                            <div className="flex items-center justify-between gap-4 mb-8 w-full">
                              <h3 className="font-serif text-2xl text-primary font-medium text-left">
                                {sekce.title}
                              </h3>
                              <div className="text-primary/70 shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:text-primary">
                                <IconComponent style={{ width: '26px', height: '26px' }} strokeWidth={1.5} />
                              </div>
                            </div>
                            
                            * SPECIÁLNÍ INTERAKTIVNÍ ALERT PRO NEPRŮJEZDNOU TRASU *
                            {isDoprava && (
                              <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-left skew-x-[-4deg] shadow-[2px_2px_10px_rgba(245,158,11,0.03)] relative overflow-hidden group/alert">
                                <div className="skew-x-[4deg] flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                                  <div>
                                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Pozor na navigaci!</h4>
                                    <p className="text-stone-600 text-xs leading-relaxed">
                                      Trasa přes <strong className="text-stone-900 font-semibold">Vrbovou Lhotu</strong> je zcela neprůjezdná, i když vás tam mapy potáhnou. Jeďte striktně přes <span className="text-stone-900 font-semibold underline decoration-amber-400 decoration-2">Sokoleč</span>.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <ul className="space-y-6 mb-8 text-left">
                              {sekce.items.map((item) => {
                                const isTrasaLabel = item.label.toLowerCase().includes("trasa");
                                if (isDoprava && isTrasaLabel) return null; // Alert nahradil původní text

                                return (
                                  <li key={item.label} className="relative pl-4 border-l border-primary/10 transition-all duration-300 hover:border-primary/40">
                                    <span className="block uppercase tracking-widest text-[9px] font-bold text-stone-400 mb-1">
                                      {item.label}
                                    </span>
                                    <p className="text-stone-600 text-sm leading-relaxed">
                                      {item.text}
                                    </p>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          * Spodní část s akcemi a highlightem *
                          <div className="mt-auto space-y-4 relative z-10 w-full">
                            
                            * Výstražný highlight – jemnější svatební stuha *
                            {sekce.highlight && (
                              <p className="text-[9px] font-bold text-red-700 tracking-widest border border-red-200/50 bg-red-50/60 py-2.5 px-4 text-center rounded-full uppercase font-sans animate-pulse">
                              {sekce.highlight}
                              </p>
                            )}

                            * Tlačítka se šipkou *
                            <div className="flex flex-col gap-2.5 w-full">
                              {sekce.actions?.map((btn) => {
                                const isExternal = btn.link?.startsWith('http://') || btn.link?.startsWith('https://');
                                
                                const buttonClass = `text-center w-full flex items-center justify-center gap-1.5 py-3 px-6 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                                  btn.variant === 'primary' 
                                    ? 'bg-primary text-white hover:bg-primary/95 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-98' 
                                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-stone-400 hover:-translate-y-0.5 active:scale-98 shadow-sm'
                                }`;

                                return isExternal ? (
                                  <a key={btn.label} href={btn.link} className={buttonClass} target="_blank" rel="noopener noreferrer">
                                    <span>{btn.label}</span>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                                  </a>
                                ) : (
                                  <Link key={btn.label} href={btn.link} className={buttonClass}>
                                    <span>{btn.label}</span>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                                  </Link>
                                );
                              })}
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>


              
              * Harmonogram *
              <section id="harmonogram" className="py-24 md:py-32 px-6 bg-secondary/30 overflow-hidden">
                <div className="container mx-auto max-w-5xl">
                  <motion.div {...FADE_IN} className="text-center mb-20">
                    <h2 className="font-serif text-4xl md:text-5xl mb-6 text-primary font-light">
                      Harmonogram
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed font-serif text-sm">
                      Tady naleznete nejdůležitější okamžiky našeho dne, postupně bude odkrývat více.
                    </p>
                  </motion.div>

                  * Hlavní kontejner pro šikmou zigzag osu *
                  <div className="relative w-full before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-gradient-to-b before:from-primary/10 before:via-primary/40 before:to-primary/10">
                    
                    <div className="space-y-16 relative">
                      {HARMONOGRAM.map((item, index) => {
                        const isEven = index % 2 === 0;
                        
                        // Definice 4 jasných úrovní důležitosti
                        const isMainEvent = item.allert === 100; // Zlatý hřeb večera ⭐
                        const isHighPriority = item.allert === 2; // Vysoká důležitost (např. Obřad) 🌿
                        const isMediumPriority = item.allert === 1; // Střední důležitost (např. Hostina) 🍽️
                        const isStandard = !item.allert || item.allert === 0; // Běžný organizační bod ⏱️

                        return (
                          <motion.div
                            key={item.time}
                            initial={{ opacity: 0, y: 40, rotate: isEven ? -1 : 1 }}
                            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`flex flex-col md:flex-row items-start md:items-center w-full relative ${
                              isEven ? "md:flex-row-reverse" : ""
                            }`}
                          >
                            * ========================================================
                                1. ODSTUPŇOVANÉ BODY NA ČASOVÉ OSE
                              ======================================================== *
                            <div className="absolute left-4 md:left-1/2 top-2 md:top-auto transform -translate-x-1/2 z-20">
                              <div 
                                className={`transition-all duration-500 flex items-center justify-center shadow-sm ${
                                  isMainEvent
                                    ? "w-11 h-11 bg-amber-500 border border-amber-400 text-white rotate-45 scale-125 shadow-amber-500/40 animate-[spin_10s_linear_infinite]"
                                    : isHighPriority
                                      ? "w-9 h-9 bg-primary border-2 border-white text-white skew-x-[-15deg] scale-110 shadow-md ring-2 ring-primary/20"
                                      : isMediumPriority
                                        ? "w-8 h-8 bg-white border border-primary/40 text-primary skew-x-[-15deg] shadow-sm animate-pulse"
                                        : "w-6 h-6 bg-stone-100 border border-stone-300 text-stone-400 skew-x-[-15deg]"
                                }`}
                              >
                                * Vnitřní středový prvek *
                                <div className={`rounded-full bg-current ${
                                  isMainEvent ? "w-2 h-2 -rotate-45" : "w-1.5 h-1.5 skew-x-[15deg]"
                                }`} />
                              </div>
                            </div>

                            * ========================================================
                                2. ODSTUPŇOVANÉ OBSAHOVÉ KARTY
                              ======================================================== *
                            <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-10">
                              <div 
                                className={`relative rounded-2xl transition-all duration-500 transform md:hover:-translate-y-1.5 ${
                                  isMainEvent
                                    ? "p-8 bg-stone-900 text-stone-100 border-0 shadow-[0_12px_30px_rgba(245,158,11,0.15)] md:hover:scale-[1.02] md:hover:rotate-1"
                                    : isHighPriority
                                      ? "p-7 bg-white border-2 border-primary shadow-md md:hover:shadow-lg md:hover:skew-y-[-1.5deg]" // Výrazná tlustá karta
                                      : isMediumPriority
                                        ? "p-6 bg-white border border-border shadow-sm md:hover:shadow-md md:hover:skew-y-[1deg]" // Standardní karta
                                        : "p-5 bg-white/60 border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.01)] md:hover:bg-white md:hover:skew-x-[-1deg]" // Drobná poloprůhledná karta
                                } ${isEven ? "md:text-right" : "md:text-left"}`}
                              >
                                * Světelný efekt pro zlatý hřeb *
                                {isMainEvent && (
                                  <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/30 pointer-events-none animate-pulse" />
                                )}

                                * Odstupňovaný časový údaj *
                                <p className={`font-serif italic mb-1 font-semibold tracking-wide transition-colors ${
                                  isMainEvent 
                                    ? "text-amber-400 text-3xl drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]" 
                                    : isHighPriority
                                      ? "text-primary text-3xl" 
                                      : isMediumPriority
                                        ? "text-stone-800 text-2xl"
                                        : "text-stone-500 text-xl font-normal" // Menší, jemnější čas
                                }`}>
                                  {item.time}
                                </p>

                                * Odstupňovaný název události *
                                <h3 className={`uppercase tracking-widest mb-2 flex items-center gap-1.5 font-bold whitespace-pre-line ${
                                  isMainEvent 
                                    ? "text-stone-200 text-xs" 
                                    : isHighPriority
                                      ? "text-primary text-sm tracking-wider" // Větší, dominantnější nadpis
                                      : isMediumPriority
                                        ? "text-stone-800 text-xs"
                                        : "text-stone-600 text-[11px] font-medium" // Drobnější nadpis
                                } ${isEven ? "md:justify-end" : "md:justify-start"}`}>
                                  {isMainEvent && <span className="animate-bounce">💍</span>}
                                  {item.title}
                                </h3>

                                * Odstupňovaný text poznámky *
                                <p className={`leading-relaxed max-w-sm inline-block ${
                                  isMainEvent 
                                    ? "text-stone-400 text-sm" 
                                    : isHighPriority
                                      ? "text-stone-700 text-sm font-medium" 
                                      : isMediumPriority
                                        ? "text-muted-foreground text-sm"
                                        : "text-stone-400 text-xs" // Menší text pro běžné detaily
                                }`}>
                                  {item.note}
                                </p>

                                * Barevný dekorační proužek (Pouze pro vysokou a střední prioritu) *
                                {isHighPriority && (
                                  <div className={`absolute top-0 bottom-0 w-1.5 bg-primary rounded-y-2xl ${isEven ? "right-0" : "left-0"}`} />
                                )}
                                {isMediumPriority && (
                                  <div className={`absolute top-4 bottom-4 w-1 bg-stone-300 rounded-y-2xl ${isEven ? "right-0" : "left-0"}`} />
                                )}
                              </div>
                            </div>

                            * ========================================================
                                3. PRÁZDNÝ PROSTOR PRO DRUHOU STRANU
                              ======================================================== *
                            <div className="hidden md:block w-1/2" />

                          </motion.div>
                        );
                      })}


                    </div>

                  </div>
                </div>
              </section>
          */}

        
        {/* Náš příběh */}
        <section id="about" className="py-24 md:py-32 px-6 overflow-hidden">
          <div className="container mx-auto max-w-5xl">
            
            {/* NADPIS SEKCE */}
            <motion.div {...FADE_IN} className="text-center mb-16 md:mb-20">
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-primary font-light">
                Náš příběh
              </h2>
              <div className="w-[70%] h-0.5 bg-primary/20 mx-auto rounded-full" />
            </motion.div>

            {/* MŘÍŽKA S TŘEMI KARTAMI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-stretch">
              
              {/* ========================================================
                  KARTA 1: KUBA (Jemné naklonění doleva na hover)
                ======================================================== */}
              <motion.div 
                {...FADE_IN}
                className="group relative flex flex-col h-full bg-white border-0 p-8 sm:p-10 rounded-3xl shadow-md transition-all duration-500 md:hover:rotate-[-1deg] md:hover:-translate-y-1.5 md:hover:shadow-lg overflow-hidden text-left"
              >
                <div className="flex items-center justify-between mb-6 w-full">
                  <h3 className="font-serif text-2xl text-primary font-medium">Kuba</h3>
                  <SlUser  className="text-stone-300 w-6 h-6 transition-colors duration-300 group-hover:text-primary" strokeWidth={1.5} />
                </div>
                
                <div className="text-stone-600 text-muted-foreground text-sm leading-relaxed space-y-4">
                  <p>
                    Kuba je rozený Brňák. Má čtyři sourozence, krásně seřazené na střídačku kluk, holka.
                  </p>
                  <p>
                    Sice pracuje v rodinné firmě na pozici IT <em>(ano, takže i tento web vznikl jeho zásluhou </em>🤓<em>)</em>, ale i tak miluje sporty všech druhů, hlavně ringo a volejbal.
                  </p>
                  <p>
                    Už od dětství chodil do <a href="https://www.royalrangersbrno.cz" target="_blank" rel="noopener noreferrer" className="standard-link hover:underline font-medium transition-all duration-500">18. přední hlídky Royal Rangers Brno</a>, kde se později stal vedoucím.
                    Teď sice už nechodí na schůzky s dětmi, ale stará se hlídce o webové stránky, fotky a grafiku.
                  </p>
                  <p className="pt-2 border-t border-stone-100 text-stone-800">
                    <strong className="text-primary font-semibold">Na Bety si váží:</strong> jejího zápalu do věcí, její upřímnosti, ale i toho, jak dokáže kravit.
                  </p>
                </div>
                
              </motion.div>

              {/* ========================================================
                  KARTA 2: BETY (Jemné naklonění doprava na hover)
                ======================================================== */}
              <motion.div 
                {...FADE_IN}
                className="group relative flex flex-col h-full bg-white border-0 p-8 sm:p-10 rounded-3xl shadow-md transition-all duration-500 md:hover:rotate-[1deg] md:hover:-translate-y-1.5 md:hover:shadow-lg overflow-hidden text-left"
              >
                <div className="flex items-center justify-between mb-6 w-full">
                  <h3 className="font-serif text-2xl text-accent font-medium">Bety</h3>
                  <SlUserFemale className="text-stone-300 w-6 h-6 transition-colors duration-300 group-hover:text-accent" strokeWidth={1.5} />
                </div>
                
                <div className="text-stone-600 text-muted-foreground text-sm leading-relaxed space-y-4">
                  <p>
                    Bety pochází z Lysé nad Labem <em>(to je městečko mezi Prahou a Kolínem)</em>. Má tři ségry a všechny čtyři jsou narozené v lichém roce.
                  </p>
                  <p>
                    Aktuálně studuje v Brně žurnalistiku a češtinu. Baví ji pečení, čtení a psaní příběhů <em>(takže tyhle texty jsou z její hlavy </em>😉<em>)</em>.
                  </p>
                  <p>
                    Nevíce času však tráví na akcích s <a href="https://34ph.royalrangers.cz" target="_blank" rel="noopener noreferrer" className="standard-link hover:underline font-medium transition-all duration-500">34. přední hlídkou Royal Rangers Nymburk</a>, kam chodí už od jejího založení.
                    Prošla si jako dítě všemi věkovými skupinami a poté se stala vedoucí.
                  </p>
                  <p className="pt-2 border-t border-stone-100 text-stone-800">
                    <strong className="text-primary font-semibold">Kubu nejvíc obdivuje:</strong> v tom, jak jí dokáže naslouchat, zvládat její emoce a do toho je prostě šikovný.
                  </p>
                </div>
              </motion.div>

              {/* ========================================================
                  KARTA 3: KUBA & BETY (Rozprostřená přes 2 sloupce s integrovanou fotkou)
                ======================================================== */}
              <motion.div 
                {...FADE_IN}
                className="md:col-span-2 group relative flex flex-col md:flex-row bg-white border-0 rounded-3xl shadow-md transition-all duration-500 md:hover:-translate-y-1.5 md:hover:shadow-lg overflow-hidden items-stretch text-left"
              >
                {/* LEVÁ/HORNÍ STRANA: FOTOGRAFIE VYCENTROVANÁ NA OBLIČEJE S OŘEZEM POUZE PRO PC */}
                {/* md:[clip-path:...] zajistí, že na mobilu bude fotka klasicky rovná a neořízne vám hlavy */}
                <div className="w-full md:w-5/12 min-h-[280px] sm:min-h-[340px] md:min-h-none relative z-10 md:[clip-path:polygon(0_0,_100%_0,_88%_100%,_0%_100%)] transition-all duration-700 group-hover:[clip-path:polygon(0_0,_100%_0,_92%_100%,_0%_100%)]">
                  <img
                src="./o_nas_2.webp"
                alt="Kuba a Bety spolu"
                // KLÍČOVÁ ZMĚNA: [center_12%] ořízne oblohu, ale ponechá přesně ten kousek místa nad vašimi hlavami
                className="absolute inset-0 w-full h-full object-[center_40%] object-cover transition-transform duration-1000 group-hover:scale-103"
                decoding="async"
                loading="lazy"
              />
                </div>

                {/* PRAVÁ STRANA: SPOLEČNÝ TEXT NEBO ZAKONČENÍ */}
                <div className="w-full md:w-7/12 p-8 sm:p-10 flex flex-col justify-center relative md:-ml-[4%] md:pl-[6%]">
                  <div className="flex items-center justify-between mb-4 w-full">
                    <h3 className="font-serif text-2xl font-medium"><span className="text-primary">Kuba</span> <span className="text-stone-400">&</span> <span className="text-accent">Bety</span></h3>
                    <div className="flex items-center">
                      <SlUser className="text-stone-300 w-6 h-6 transition-colors duration-300 group-hover:text-primary" strokeWidth={1.5} />
                      <SlUserFemale className="text-stone-300 w-6 h-6 ml-1 transition-colors duration-300 group-hover:text-accent" strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="text-stone-600 text-muted-foreground text-sm leading-relaxed space-y-4">
                  <p>
                      Poznali jsme se díky dětské organizaci <a href="https://www.royalrangers.cz" target="_blank" rel="noopener noreferrer" className="standard-link hover:underline font-medium transition-all duration-500">Royal Rangers</a>.
                      Bavit jsme se však začali až když Kuba na přání velitelů naplánoval společnou víkendovku pro nymburskou a brněnskou hlídku.
                      Kubovi bylo s nymburskými vedoucími dobře, takže s nimi začal jezdit na další hlídkové i mládežnické akce.
                      Postupně jsme tak víc spolupracovali při přípravě programů pro děti.
                      Díky tomu jsme se hodně poznali, a to i v krizových situacích, a začali si taky hodně povídat.
                      To vedlo až k tomu, že jsme si na konci jednoho školení pro mladé vedoucí řekli, že bychom si měli promluvit.
                    </p>
                    <p className="pt-2">
                      Ten den jsme na to neměli už moc času, ale týden na to jsme se sešli a den před Kubovými jednadvacátými narozeninami jsme tak <span  className="underline underline-offset-4 decoration-2 decoration-primary hover:decoration-black transition-all">spolu začali chodit</span>. 
                    </p>
                    <p className="pt-4">
                      Do vztahu jsme vkročili ve třech - <b>Kuba, Bety a Pán Ježíš</b>.
                      Po celý čas našeho chození jsme se proto snažili Ježíši naslouchat, až k nám oběma na jedné <em>(opět royalovské)</em> konferenci mluvil.
                      V tu chvíli jsme přijali, že se zvládneme vzít už teď.
                      Bylo to pro nás trochu šokující mít svatbu za méně než rok, ale dali jsme to Ježíši a začali dělat všechno pro to, abychom si v srpnu <em>(měsíc před naším výročím 3 let chození)</em> řekli své ano.
                      A tak v den, kdy Bety měla jednadvacáté narozeniny, ji Kuba požádal o ruku. Tak jsme si řekli své <span className="underline underline-offset-4 decoration-2 decoration-primary hover:decoration-black transition-all">druhé ano</span> a začali plně připravovat svatbu.
                    </p>
                    <p className="pt-2 border-t border-stone-100 text-stone-800">
                      <strong className="text-primary font-semibold">No a v srpnu si řekneme své <span  className="underline underline-offset-4 decoration-2 decoration-primary hover:decoration-black transition-all">třetí ano</span>, to na celý život ❤️.</strong>
                    </p>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>
        


        {/*

        * FAQ *
        <section id="faq" className="py-24 md:py-32 px-6 bg-secondary/30 relative overflow-hidden group/faq">
          
          * OBŘÍ JEMNÝ VODOZNAK S OTAZNÍKEM NA POZADÍ SEKCE *
          <div className="absolute -bottom-10 -left-10 md:left-auto md:right-10 opacity-[0.025] text-stone-900 pointer-events-none transition-transform duration-1000 ease-out group-hover/faq:scale-110 group-hover/faq:-rotate-12">
            <CiCircleQuestion style={{ width: '320px', height: '320px' }} strokeWidth={0.2} />
          </div>

          <div className="container mx-auto max-w-3xl relative z-10">
            <motion.div {...FADE_IN} className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-primary font-light">
                Často kladené otázky
              </h2>
            </motion.div>

            <motion.div {...FADE_IN}>
              <Accordion 
                type="single" 
                collapsible 
                className="w-full space-y-4"
                value={openItem}
                onValueChange={setOpenItem}
              >
                {FAQ.map((item) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${item.id}`} 
                    id={item.id}
                    className="border border-border/50 bg-white/40 rounded-2xl backdrop-blur-sm px-6 transition-all duration-500 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-0.5 hover:skew-x-[-1deg] data-[state=open]:bg-white data-[state=open]:shadow-md data-[state=open]:border-primary/30 data-[state=open]:skew-x-0"
                  >
                    <AccordionTrigger 
                      className="font-serif text-base md:text-lg text-left hover:no-underline text-stone-800 data-[state=open]:text-primary py-5 transition-colors gap-4 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-primary"
                    >
                      <span className="leading-tight">{item.q}</span>
                    </AccordionTrigger>
                    
                    <AccordionContent className="text-stone-600 leading-relaxed pb-4">
                      <span 
                        dangerouslySetInnerHTML={{ __html: item.a }} 
                        onClick={(e) => {
                          const target = e.target.closest("a");
                          if (!target) return;

                          const href = target.getAttribute("href");
                          if (!href) return;

                          // 1. PŘÍPAD: Odkaz začíná na "/" (Např. /rsvp) -> Použijeme klientské přesměrování od Wouteru
                          if (href.startsWith("/")) {
                            e.preventDefault(); // Zamezíme plnému reloadu prohlížeče
                            navigate(href);     // Wouter okamžitě plynule přepne stránku
                            return;
                          }

                          // 2. PŘÍPAD: Odkaz začíná na "#" (Kotva na sekci)
                          if (href.startsWith("#")) {
                            e.preventDefault(); 
                            const targetId = href.substring(1);
                            
                            setOpenItem(`item-${targetId}`);
                            
                            setTimeout(() => {
                              document.getElementById(targetId)?.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                              });
                            }, 100);
                          }
                        }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        */}


        {/* Formuláře */}
        <section
          id="formulare"
          className="py-32 md:py-40 px-6 text-center relative overflow-hidden group/forms-section"
          >
          {/* 1. HYDRODYNAMICKÉ SVG MASKY PRO HRAVÉ POZADÍ FORMULÁŘŮ */}
          <svg className="absolute w-0 h-0" aria-hidden="true">
            <defs>
              <clipPath id="form-splat-0" clipPathUnits="objectBoundingBox">
                <path d="M25,5 C35,5 45,15 45,25 C45,38 33,45 22,45 C10,45 5,33 5,22 C5,10 12,5 25,5 Z" transform="scale(0.02)">
                  <animate attributeName="d" dur="8s" repeatCount="indefinite"
                    values="
                      M25,5 C35,5 45,15 45,25 C45,38 33,45 22,45 C10,45 5,33 5,22 C5,10 12,5 25,5 Z;
                      M25,7 C38,4 43,18 43,28 C43,35 30,42 20,42 C12,42 7,31 7,20 C7,9 12,10 25,7 Z;
                      M25,5 C35,5 45,15 45,25 C45,38 33,45 22,45 C10,45 5,33 5,22 C5,10 12,5 25,5 Z
                    " />
                </path>
              </clipPath>
              <clipPath id="form-splat-1" clipPathUnits="objectBoundingBox">
                <path d="M20,8 C32,4 42,12 44,22 C46,34 36,44 26,46 C14,48 4,38 6,26 C8,14 10,12 20,8 Z" transform="scale(0.02)">
                  <animate attributeName="d" dur="9s" repeatCount="indefinite"
                    values="
                      M20,8 C32,4 42,12 44,22 C46,34 36,44 26,46 C14,48 4,38 6,26 C8,14 10,12 20,8 Z;
                      M22,5 C30,8 45,10 42,24 C39,38 33,42 23,44 C13,46 5,35 8,24 C11,13 14,2 22,5 Z;
                      M20,8 C32,4 42,12 44,22 C46,34 36,44 26,46 C14,48 4,38 6,26 C8,14 10,12 20,8 Z
                    " />
                </path>
              </clipPath>
            </defs>
          </svg>
          {/*
          <div className="container mx-auto max-w-4xl relative z-10">
            <motion.div {...FADE_IN}>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left items-stretch">
                
                * FORMULÁŘ A: POTVRZENÍ ÚČASTI 
                <Link href="/rsvp" className="w-full h-full block">
                  <div className="group relative h-full bg-white/40 backdrop-blur-sm border border-border/40 rounded-3xl p-8 sm:p-10 cursor-pointer overflow-hidden flex flex-col justify-between transition-all duration-500 shadow-sm md:hover:shadow-xl md:hover:rotate-[-1.5deg] md:hover:-translate-y-2">
                    
                    * Obří vlnící se barevná kaňka v pozadí *
                    <div 
                      className="absolute -bottom-10 -right-10 w-44 h-44 opacity-[0.06] bg-primary pointer-events-none transition-transform duration-1000 group-hover:scale-125"
                      style={{ clipPath: 'url(#form-splat-0)' }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between w-full mb-6">
                        <p className="uppercase tracking-widest text-[10px] font-bold text-stone-400">
                          Formulář
                        </p>
                        <ClipboardCheck className="text-primary/40 w-5 h-5 transition-all duration-300 group-hover:text-primary group-hover:scale-110" strokeWidth={1.5} />
                      </div>
                      
                      <h3 className="font-serif text-3xl mb-4 text-stone-800 transition-colors group-hover:text-primary">
                        Potvrdit účast
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-serif text-xs">
                        Prosíme, potvrďte svou účast za sebe, případně celou rodinu, nejpozději do {RSVP_DEADLINE_DISPLAY}
                      </p>
                    </div>

                    * Kreativní interaktivní tlačítko 
                    <div className="relative z-10 mt-auto pt-4 flex items-center gap-1 text-primary uppercase tracking-widest text-xs font-semibold">
                      <span className="relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-primary after:transition-all after:duration-300 group-hover:after:w-0">
                        Vyplnit formulář
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                    </div>
                  </div>
                </Link>

                /* FORMULÁŘ B: REZERVACE DARŮ *
                <Link href="/gifts-reservation" className="w-full h-full block">
                  <div className="group relative h-full bg-white/40 backdrop-blur-sm border border-border/40 rounded-3xl p-8 sm:p-10 cursor-pointer overflow-hidden flex flex-col justify-between transition-all duration-500 shadow-sm md:hover:shadow-xl md:hover:rotate-[1.5deg] md:hover:-translate-y-2">
                    
                    * Obří vlnící se barevná kaňka v pozadí (jiná barva i tvar) *
                    <div 
                      className="absolute -bottom-10 -right-10 w-44 h-44 opacity-[0.06] bg-accent pointer-events-none transition-transform duration-1000 group-hover:scale-125"
                      style={{ clipPath: 'url(#form-splat-1)' }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between w-full mb-6">
                        <p className="uppercase tracking-widest text-[10px] font-bold text-stone-400">
                          Formulář
                        </p>
                        <Gift className="text-accent/50 w-5 h-5 transition-all duration-300 group-hover:text-accent group-hover:scale-110" strokeWidth={1.5} />
                      </div>
                      
                      <h3 className="font-serif text-3xl mb-4 text-stone-800 transition-colors group-hover:text-accent">
                        Dary
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-serif text-xs">
                        Pokud nás chcete obdarovat věcným darem. Prosím, rezervujte jej zde.
                      </p>
                    </div>

                    * Kreativní interaktivní tlačítko 
                    <div className="relative z-10 mt-auto pt-4 flex items-center gap-1 text-primary uppercase tracking-widest text-xs font-semibold group-hover:text-accent">
                      <span className="relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-current after:transition-all after:duration-300 group-hover:after:w-0">
                        Zobrazit dary
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                    </div>
                  </div>
                </Link>
                *

              </div>
            </motion.div>
          </div>
          */}
        </section>

      </main>

      <Footer />
    </div>
  );
}
