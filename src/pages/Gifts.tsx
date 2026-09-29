import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, Loader2, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GAS_ENDPOINT, UNSPLASH_ACCESS_KEY } from "@/config";
import ContactForm from "./ContactForm";
import QRCode from "./QRcode";


interface GiftItem {
  id: string;
  name: string;
  price: string;
  note: string;
  image: string;
  category?: string;
  link?: string;
  description: string;
}

const giftSchema = z.object({
  name: z.string().min(2, "Vyplňte prosím jméno"),
  email: z.string().email("Neplatná e-mailová adresa"),
  selectedGift: z.string().min(1, "Vyberte prosím dar"),
  message: z.string().optional(),
});

type GiftFormValues = z.infer<typeof giftSchema>;



const DEFAULT_WEDDING_IMAGE = "https://unsplash.com";


async function fetchUnsplashImage(keyword: string): Promise<string> {
  try {
    const response = await fetch(
      "https://api.unsplash.com/search/photos?query=" + encodeURIComponent(keyword) + "&per_page=1&client_id=" + UNSPLASH_ACCESS_KEY
    );
    // Pokud server odpoví chybou (např. 401 nebo 403), přečteme si text odpovědi
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Unsplash vrátil chybu ${response.status}:`, errorText);
      return DEFAULT_WEDDING_IMAGE;
    }

    const data = await response.json();
    // ZKONTROLUJEME DATA V KONZOLI
    console.log("Úspěšná odpověď z Unsplash:", data);
    if (data.results && data.results.length > 0) {
      return `${data.results[0].urls.raw}&w=600&h=400&fit=crop&q=80`;
    } else {
      console.warn(`Unsplash nenašel žádný obrázek pro slovo: "${keyword}"`);
    }
  } catch (error) {
    console.error("Chyba Unsplash API:", error);
  }
  return DEFAULT_WEDDING_IMAGE;
}

function formatPrice(priceValue: string | number): string {
  // Převedeme hodnotu na řetězec a vytáhneme z ní pouze čísla
  const cleanNumber = String(priceValue).replace(/[^0-9]/g, "");

  if (!cleanNumber) {
    return "Libovolná částka";
  }

  const parsedNumber = parseInt(cleanNumber, 10);

  // Zformátuje číslo na formát: 10 000 Kč
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0, // Bez desetinných míst (.00)
  }).format(parsedNumber);
}

/**
 * Nová funkce, která pošle na pozadí požadavek do Google tabulky pro trvalé uložení URL obrázku
 */
async function saveImageToGoogleSheets(giftId: string, imageUrl: string) {
  if (!GAS_ENDPOINT || !giftId || imageUrl === DEFAULT_WEDDING_IMAGE) return;
  try {
    await fetch(GAS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type: "update_image",
        payload: {
          id: giftId,
          obrazek: imageUrl
        }
      }),
    });
  } catch (error) {
    console.error("Nepodařilo se uložit obrázek do Google Sheets:", error);
  }
}

export default function Gifts() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [isLoadingGifts, setIsLoadingGifts] = useState(true);
  const [availableGifts, setAvailableGifts] = useState<GiftItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailable() {
      if (!GAS_ENDPOINT) {
        if (!cancelled) {
          setLoadError("Chybí konfigurace GAS_ENDPOINT.");
          setIsLoadingGifts(false);
        }
        return;
      }
      try {
        const response = await fetch(GAS_ENDPOINT, { method: "GET" });
        const result = await response.json();

        if (cancelled) return;

        if (result.ok && Array.isArray(result.available)) {
          const apiGifts = result.available as Array<{
            id: string;
            nazev: string;
            cena: string;
            odkaz: string;
            kategorie: string;
            obrazek?: string;
            popis: string;
          }>;


          const mappedGiftsPromises = apiGifts.map(async (item) => {
            const name = String(item.nazev).trim();
            const category = item.kategorie ? String(item.kategorie).trim() : undefined;

            let finalImage = DEFAULT_WEDDING_IMAGE;

            // Pokud v tabulce obrázek už JE, vezmeme ho a nic neřešíme
            if (item.obrazek && item.obrazek.startsWith("http")) {
              finalImage = item.obrazek;
            } else {
              // 1. Zjistíme od Google Apps Scriptu anglické klíčové slovo (využije LanguageApp)
              let keyword = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

              try {
                const translateResponse = await fetch(GAS_ENDPOINT, {
                  method: "POST",
                  headers: { "Content-Type": "text/plain;charset=utf-8" },
                  body: JSON.stringify({
                    type: "update_image",
                    payload: { id: item.id, nazev: name }
                  }),
                });
                const translateResult = await translateResponse.json();
                if (translateResult && translateResult.keyword) {
                  keyword = translateResult.keyword;
                }
              } catch (err) {
                console.error("Selhal překlad na straně Google Sheets:", err);
              }

              // 2. Vyhledáme obrázek na Unsplashi pomocí anglického klíčového slova
              finalImage = await fetchUnsplashImage(keyword);

              // 3. Uložíme výsledný nalezený obrázek natvrdo zpět do tabulky
              if (item.id && finalImage !== DEFAULT_WEDDING_IMAGE) {
                try {
                  await fetch(GAS_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                      type: "update_image",
                      payload: { id: item.id, obrazek: finalImage }
                    }),
                  });
                } catch (saveErr) {
                  console.error("Chyba při ukládání finální URL dárku:", saveErr);
                }
              }
            }




            return {
              id: item.id || `gift-${Math.random().toString(36).substr(2, 9)}`,
              name: name,
              price: item.cena || "Libovolná částka",
              note: category ? `Svatební dar z kategorie: ${category}` : "Svatební dar pro novomanžele",
              image: finalImage,
              category: category,
              link: item.odkaz || undefined,
              description: item.popis || "",
            };
          });

          const mappedGifts = await Promise.all(mappedGiftsPromises);

          if (!cancelled) {
            setAvailableGifts(mappedGifts);
            setLoadError(null);
          }
        } else {
          throw new Error(result.error || "Načtení darů selhalo");
        }
      } catch (err) {
        console.error("Chyba při načítání dostupných darů:", err);
        if (!cancelled) {
          setLoadError("Nepodařilo se načíst aktuální seznam darů.");
        }
      } finally {
        if (!cancelled) setIsLoadingGifts(false);
      }
    }

    loadAvailable();
    return () => { cancelled = true; };
  }, []);

  const form = useForm<GiftFormValues>({
    resolver: zodResolver(giftSchema),
    defaultValues: { name: "", email: "", selectedGift: "", message: "" },
  });

  const handleSelectGift = (id: string, name: string) => {
    setSelectedGiftId(id);
    form.setValue("selectedGift", name, { shouldValidate: true });
    document.getElementById("gift-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const onSubmit = async (data: GiftFormValues) => {
    if (!GAS_ENDPOINT) {
      toast.error("Formulář zatím není nastaven");
      return;
    }
    setIsSubmitting(true);
    try {
      const requestBody = {
        type: "gift",
        payload: {
          dar: data.selectedGift,
          jmeno: data.name,
          email: data.email,
          vzkaz: data.message || "",
        }
      };
      const response = await fetch(GAS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (result.status === "success" || result.ok) {
        setIsSuccess(true);
        toast.success("Děkujeme za vaši štědrost!");
        setAvailableGifts((prev) => prev.filter((g) => g.name !== data.selectedGift));
      } else {
        throw new Error(result.message || result.error || "Odeslání se nezdařilo");
      }
    } catch (error: any) {
      console.error("Chyba při odesílání:", error);
      toast.error(error.message || "Něco se pokazilo. Zkuste to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };





  // Zde končí funkce onSubmit a následuje kompletní ostylizované vykreslení stránky
  // Zde končí funkce onSubmit a následuje kompletní upravené vykreslení
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Navbar />

      <ContactForm />
      <QRCode />

      <main className="container max-w-6xl mt-20 mx-auto px-4 py-10 md:py-16">
        {/* Hlavička stránky */}
        <div className="max-w-2xl mx-auto mb-12 text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-6xl text-primary font-light mb-6"
          >
            Dary
          </motion.h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Vaše přítomnost je pro nás největším darem.
            <br />
            Pokud nás přesto chcete obdarovat, vyberte si prosím z možností níže.
          </p>
          <p className="italic text-muted-foreground/70 pt-2 border-t border-muted-foreground/30">
            Odkazy na dary, stejně jako obrázky, jsou pouze návrhem...
          </p>
        </div>

        {/* Stav načítání seznamu */}
        {isLoadingGifts ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-slate-400 text-sm">Načítám seznam darů...</p>
          </div>
        ) : loadError ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center text-red-700 max-w-md mx-auto">
            <p className="font-medium text-sm">{loadError}</p>
          </div>
        ) : isSuccess ? (
          /* Úspěšné odeslání (Děkovná obrazovka) */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <Card className="border-slate-200 shadow-lg overflow-hidden rounded-xl bg-white">
              <CardContent className="pt-10 pb-8 px-6 text-center space-y-5">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900">Dar byl úspěšně rezervován</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Děkujeme za vaši štědrost.<br />Potvrzení o rezervaci daru vám brzy dorazí na zadaný e-mail.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    // 1. Schová děkovnou obrazovku
                    setIsSuccess(false);
                    // 2. Odznačí vybraný dárek v seznamu (vypne se černobílý filtr a fajfka)
                    setSelectedGiftId(null);
                    // 3. Kompletně vymaže název dárku, jméno, email i vzkaz z formuláře
                    form.reset({
                      name: "",
                      email: "",
                      selectedGift: "",
                      message: ""
                    });
                  }}
                  className="w-full bg-[#f0cc9f] hover:bg-[#f0cc9f]/80 text-[#1f2a1c] rounded-lg transition-colors h-10 text-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Zpět na seznam darů
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Hlavní rozvržení: Mřížka dárků + Formulář */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">

            {/* LEVÁ STRANA: Čistá mřížka dárků (Pouze Obrázek, Název, Cena, Proklik) */}
            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider pl-1 border-l-2 border-primary">
                Dostupné dary ({availableGifts.length})
              </h2>

              {availableGifts.length === 0 ? (
                <p className="text-accent text-sm py-8 text-center italic">Všechny dary jsou již rezervované.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableGifts.map((gift) => {
                    const isSelected = selectedGiftId === gift.id;
                    return (
                      <motion.div
                        key={gift.id}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => handleSelectGift(gift.id, gift.name)}
                        className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer bg-white ${isSelected
                          ? "border-primary ring-2 ring-primary/10 shadow-md"
                          : "border-slate-200 shadow-sm hover:shadow hover:border-slate-300"
                          }`}
                      >
                        {/* 1. OBRÁZEK */}
                        <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden border-b border-slate-100">
                          <div className="absolute bottom-3 right-3 z-10 bg-slate-900/30 backdrop-blur-xs px-2.5 py-1 rounded-md pointer-events-none">
                            <p className="text-[11px] font-medium tracking-wide text-white uppercase opacity-90">
                              Ilustrační obrázek
                            </p>
                          </div>
                          <img
                            src={gift.image}
                            alt={gift.name}
                            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02] ${selectedGiftId && !isSelected
                              ? "grayscale opacity-60 contrast-75"
                              : "grayscale-0 opacity-100 contrast-100"
                              }`}
                            loading="lazy"
                          />

                          {/* Indikátor výběru */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/5 backdrop-blur-[0.5px] flex items-center justify-center">
                              <div className="absolute inset-0 bg-primary opacity-5" />
                              <div className="bg-primary text-white rounded-full p-1.5 shadow scale-110">
                                <Check className="h-4 w-4" />
                              </div>
                            </div>
                          )}

                        </div>

                        {/* 4. PROKLIK NA NÁVRH */}
                          {gift.link && (
                            <div className="absolute right-3 top-3">
                              <a
                                href={gift.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()} // Zamezí označení karty při kliku na odkaz
                                className="text-xs text-white hover:text-primary flex items-center gap-1 transition-colors group/link bg-primary/80 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg w-fit"
                              >

                                Zobrazit návrh <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                              </a>

                            </div>
                          )}

                        {/* Obsah karty */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          
                          <div className="space-y-1">
                            
                            {/* NÁZEV A CENA */}
                            <div className="flex justify-between items-start gap-4">
                              {/* 2. NÁZEV */}
                              <h3 className="font-semibold text-sm md:text-base text-slate-900 group-hover:text-primary transition-colors line-clamp-1 flex-1">
                                {gift.name}
                              </h3>
                              
                              {/* 3. CENA */}
                              <div className="text-right shrink-0">
                                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">orientační cena</span>
                                <span className="text-xl font-semibold text-slate-600">
                                  {formatPrice(gift.price)}
                                </span>
                              </div>
                            </div>

                            {/* POPISEK */}
                            {gift.description && (
                              <p className="mt-2 text-sm text-gray-600 italic pt-2 border-t border-gray-200">
                                {gift.description}
                              </p>
                            )}
                          </div>

                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PRAVÁ STRANA: Rezervační formulář */}
            <div id="gift-form" className="lg:col-span-5 lg:sticky lg:top-6">
              <h2 className="text-sm font-semibold text-accent uppercase tracking-wider pl-1 border-l-2 border-accent mb-5">
                Rezervace daru
              </h2>

              <Card className="border-accent shadow-sm rounded-xl bg-white">
                <CardContent className="p-5">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                      {/* Vybraný dar */}
                      <FormField
                        control={form.control}
                        name="selectedGift"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vybraný dar</FormLabel>
                            <FormControl>
                              <div className={`p-3 rounded-lg border text-sm transition-colors ${field.value
                                ? "bg-accent/10 border-indigo-100 text-primary font-bold"
                                : "bg-slate-50 border-slate-100 text-slate-400 italic"
                                }`}>
                                {field.value || "Vyberte dárek kliknutím ze seznamu..."}
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs text-red-500 font-medium" />
                          </FormItem>
                        )}
                      />

                      {/* Jméno a příjmení */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vaše jméno</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jan Novák"
                                {...field}
                                className="rounded-lg border-slate-200 focus-visible:ring-accent/10 focus-visible:border-accent bg-slate-50/50 text-sm h-10"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500 font-medium" />
                          </FormItem>
                        )}
                      />

                      {/* E-mailová adresa */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider">E-mail pro potvrzení</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="jmeno@priklad.cz"
                                {...field}
                                className="rounded-lg border-slate-200 focus-visible:ring-accent/10 focus-visible:border-accent bg-slate-50/50 text-sm h-10"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500 font-medium" />
                          </FormItem>
                        )}
                      />

                      {/* Vzkaz snoubencům */}
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vzkaz pro novomanžele</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Můžete nám zanechat vzkaz..."
                                {...field}
                                className="rounded-lg border-slate-200 focus-visible:ring-accent/10 focus-visible:border-accent bg-slate-50/50 text-sm min-h-[80px] resize-none"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500 font-medium" />
                          </FormItem>
                        )}
                      />

                      {/* Odesílací tlačítko */}
                      <Button
                        type="submit"
                        disabled={isSubmitting || !form.getValues("selectedGift")}
                        className="w-full border-[#f0cc9f] bg-[#f0cc9f] hover:bg-[#f0cc9f]/80 disabled:bg-slate-100 disabled:text-slate-400 text-[#1f2a1c] rounded-lg text-sm font-medium shadow-sm h-10 mt-1 transition-[width,background-color] ease-in-out hover:scale-105 duration-500 "
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rezervuji...
                          </>
                        ) : (
                          "Potvrdit rezervaci daru"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
