import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowLeft,
  Plus,
  X,
  Music,
  MessageSquare,
  Heart,
  QrCode,
} from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GAS_ENDPOINT } from "@/config";
import ContactForm from "./ContactForm";
import QRCode from "./QRcode";

const normalize = (s: string) =>
  s
    ? s
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
    : "";

const personSchema = z.object({
  jmeno: z.string().min(1, "Vyplňte jméno"),
  prijmeni: z.string().min(1, "Vyplňte příjmení"),
  attendance: z.string({ required_error: "Vyberte prosím možnost účasti" }),
  ubytovani: z.string().optional(),
  pujcitStan: z.boolean().optional().default(false),
  svozTam: z.boolean().optional().default(false),
  svozZpet: z.boolean().optional().default(false),
  song: z.string().optional(),
  message: z.string().optional(),
  showSong: z.boolean().optional().default(false),
  showMessage: z.boolean().optional().default(false),
});

const rsvpSchema = z.object({
  email: z.string().email("Neplatná e-mailová adresa"),
  persons: z.array(personSchema).min(1),
});

type RsvpFormValues = z.infer<typeof rsvpSchema>;
type GuestRecord = { jmeno: string; platimemy: boolean; pozvanyKam: string };

export default function RSVP() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [guests, setGuests] = useState<GuestRecord[]>([]);

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      email: "",
      persons: [
        {
          jmeno: "",
          prijmeni: "",
          attendance: "",
          ubytovani: "",
          pujcitStan: false,
          svozTam: false,
          svozZpet: false,
          song: "",
          message: "",
          showSong: false,
          showMessage: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "persons",
  });
  const watchedPersons = form.watch("persons");

  useEffect(() => {
    if (!GAS_ENDPOINT) return;
    fetch(GAS_ENDPOINT)
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.guests)) setGuests(data.guests);
      })
      .catch((err) => console.error("Chyba načítání:", err));
  }, []);

  const getGuestInfo = (jmeno: string, prijmeni: string) => {
    if (!jmeno || !prijmeni) return null;
    const combinedName = normalize(`${jmeno} ${prijmeni}`);
    return guests.find((g) => normalize(g.jmeno) === combinedName) || null;
  };

  const onSubmit = async (data: RsvpFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(GAS_ENDPOINT!, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type: "rsvp", payload: data }),
      });
      
      // OPRAVA: Nový script vrací status: "success"
      const resData = await response.json();
      if (resData.status === "success" || resData.ok) {
        setIsSuccess(true);
      } else {
        toast.error("Odeslání se nezdařilo: " + (resData.message || "Neznámá chyba"));
      }
    } catch (error) {
      toast.error("Odeslání se nezdařilo.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <ContactForm />
      <QRCode />
      


      <main className="flex-grow pt-32 pb-24 px-4 container mx-auto max-w-3xl">
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-20 bg-card rounded-[2rem] shadow-xl border border-border"
          >
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-4xl font-serif">Děkujeme za vyplnění potvrzovacího formuláře.</h2>
            <p className="text-muted-foreground">
              Vaše odpověď byla úspěšně uložena. Pokud chcete nějakou informaci dodatečně upravit, stačí vyplnit formulář znova, a odpovědi se nám aktualizují.
            </p>
          </motion.div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-serif text-primary">Potvrzení účasti</h1>
                <p className="text-muted-foreground font-serif">
                  Prosíme o vyplnění za každého hosta. 
                </p>
                <p className="text-sm text-muted-foreground font-serif">
                  Dodatečně lze odpovědi upravovat (do 8. srpna 2026).
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border shadow-sm">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold opacity-70">
                        Váš kontaktní e-mail
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-transparent border-0 border-b rounded-none px-3 focus-visible:ring-0 focus-visible:border-primary transition-all text-lg"
                          placeholder="jmeno@priklad.cz"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {fields.map((field, index) => {
                const guestData = getGuestInfo(
                  watchedPersons[index].jmeno,
                  watchedPersons[index].prijmeni,
                );
                const isInvitedToBanquet = guestData?.pozvanyKam === "Hostina";;
                const isPaidByUs = guestData?.platimemy === true;
                const attending = watchedPersons[index].attendance;

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 border rounded-[2rem] bg-card space-y-8 relative shadow-md"
                  >
                    <div className="flex justify-between items-center border-b pb-4">
                      <span className="font-serif italic text-lg text-primary">
                        {index + 1}. Host
                      </span>
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name={`persons.${index}.jmeno`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase font-bold opacity-60">
                              Jméno (Křestní)
                            </FormLabel>
                            <Input
                              {...field}
                              className="bg-muted/50 border-none rounded-xl"
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`persons.${index}.prijmeni`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase font-bold opacity-60">
                              Příjmení
                            </FormLabel>
                            <Input
                              {...field}
                              className="bg-muted/50 border-none rounded-xl"
                            />
                          </FormItem>
                        )}
                      />
                      
                    </div>
                    <p className="text-xs font-bold text-red-700 tracking-widest border border-red-200/50 bg-red-50/60 py-2.5 px-4 -mt-6 mb-10 text-center rounded-full font-sans ">Prosíme nevyplňujte zdomácnělé varianty jména ani přezdívky.<br/>Na základě křestního jména a přijmení se zobrazí korektní možnosti.</p>





{/* Sekce Svoz */}
                    <div className="flex flex-col space-y-4 rounded-xl border border-border/60 p-5 bg-muted/20 backdrop-blur-sm">
                      <div>
                        <h4 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                          Dokážeme zajistit svoz - pokud potřebujete, vyplňte
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Dokážeme zajistit přepravu z Poděbradského nádraží až na místo obřadu a po obřadu zase zpátky.
                        </p>
                      </div>

                      {/* Kontejner pro karty: na mobilu pod sebou, na PC vedle sebe */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {/* Svoz TAM */}
                        <FormField
                          control={form.control}
                          name={`persons.${index}.svozTam`}
                          render={({ field }) => (
                            <FormItem>
                              <label 
                                className={`flex items-start space-x-4 rounded-xl border p-4 bg-background transition-all duration-200 cursor-pointer select-none hover:border-primary/40 hover:bg-primary/5 h-full ${
                                  field.value 
                                    ? "border-primary ring-2 ring-primary/10 bg-primary/[0.02]" 
                                    : "border-border"
                                }`}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-muted-foreground/50 size-5 rounded-md"
                                  />
                                </FormControl>
                                <div className="flex flex-col space-y-1">
                                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                                    Cesta NA obřad
                                  </span>
                                  <span className="text-sm font-semibold text-foreground leading-tight">
                                    Poděbrady → <span className="text-primary">Místo konání obřadu</span>
                                  </span>
                                  <p className="text-xs text-muted-foreground leading-normal">
                                    Vyzvedneme vás na vlakovém nádraží a odvezeme přímo na místo obřadu.
                                  </p>
                                </div>
                              </label>
                            </FormItem>
                          )}
                        />

                        {/* Svoz ZPĚT */}
                        <FormField
                          control={form.control}
                          name={`persons.${index}.svozZpet`}
                          render={({ field }) => (
                            <FormItem>
                              <label 
                                className={`flex items-start space-x-4 rounded-xl border p-4 bg-background transition-all duration-200 cursor-pointer select-none hover:border-primary/40 hover:bg-primary/5 h-full ${
                                  field.value 
                                    ? "border-primary ring-2 ring-primary/10 bg-primary/[0.02]" 
                                    : "border-border"
                                }`}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-muted-foreground/50 size-5 rounded-md"
                                  />
                                </FormControl>
                                <div className="flex flex-col space-y-1">
                                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                                    Cesta Z obřadu
                                  </span>
                                  <span className="text-sm font-semibold text-foreground leading-tight">
                                    <span className="text-primary">Místo konání obřadu</span> → Poděbrady
                                  </span>
                                  <p className="text-xs text-muted-foreground leading-normal">
                                    Po obřadu zajistíme odvoz zpět na nádraží v Poděbradech.
                                  </p>
                                </div>
                              </label>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>







                    <FormField
                      control={form.control}
                      name={`persons.${index}.attendance`}
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div className="flex flex-col gap-0.5">
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary/80">
                              Účast na svatbě
                            </FormLabel>
                            <span className="text-xs text-muted-foreground">
                              Dejte nám prosím vědět, zda s vámi můžeme počítat.
                            </span>
                          </div>

                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              /* Dynamický grid: Pokud jsou 2 možnosti, udělá 2 sloupce. Pokud jsou 3, udělá 3 sloupce na velkých obrazovkách */
                              className={`grid grid-cols-1 gap-3 w-full ${
                                !isInvitedToBanquet 
                                  ? "sm:grid-cols-2" 
                                  : "sm:grid-cols-3"
                              }`}
                            >
                              {(!isInvitedToBanquet
                                ? [
                                    { v: "Obřad", l: "Rád(a) dorazím", s: "Ano, na obřad"},
                                    { v: "Nedorazím", l: "Bohužel nedorazím", s: "Budu chybět"},
                                  ]
                                : [
                                    { v: "Obřad", l: "Pouze obřad", s: "Dorazím na obřad"},
                                    { v: "Obřad i oslava", l: "Obřad i oslava", s: "Užiju si to komplet"},
                                    { v: "Nedorazím", l: "Bohužel nedorazím", s: "Budu chybět"},
                                  ]
                              ).map((opt) => {
                                const isSelected = field.value === opt.v;
                                return (
                                  <label
                                    key={opt.v}
                                    className={`group flex flex-col items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center min-h-5 relative select-none hover:bg-accent/5 ${
                                      isSelected 
                                        ? "border-primary bg-primary/[0.03] ring-2 ring-primary/10 shadow-sm" 
                                        : "border-border hover:border-primary/40 bg-background"
                                    }`}
                                  >
                                    {/* Textový obsah uvnitř karty */}
                                    <div className="flex flex-col space-y-0.5">
                                      <span className="text-l font-semibold text-foreground leading-tight">
                                        {opt.l}
                                      </span>
                                      <span className="text-xs text-muted-foreground leading-none">
                                        {opt.s}
                                      </span>
                                    </div>

                                    {/* Skrytý nativní radio input pro správnou funkčnost */}
                                    <RadioGroupItem
                                      value={opt.v}
                                      className="sr-only"
                                    />
                                  </label>
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />






                    <AnimatePresence>
                      {isInvitedToBanquet && attending === "Obřad i oslava" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-8 pt-6 border-t border-dashed"
                        >
                          <FormField
                            control={form.control}
                            name={`persons.${index}.ubytovani`}
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-[10px] uppercase font-bold opacity-60">
                                  Ubytování
                                </FormLabel>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="grid grid-cols-1 gap-3"
                                >
                                  {isPaidByUs ? (
                                    <>
                                      <label
                                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                          field.value === "Ubytování na místě"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:bg-muted/50"
                                        }`}
                                      >
                                        <RadioGroupItem
                                          value="Ubytování na místě"
                                          className="mr-4"
                                        />
                                        <div className="space-y-0.5">
                                          <p className="text-sm font-bold">
                                            Ubytování na místě
                                          </p>
                                          <p className="text-[10px] uppercase tracking-wide opacity-70 font-bold text-primary">
                                            ZDARMA
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Pro vícero informací nám napište.
                                          </p>
                                        </div>
                                      </label>

                                      <label
                                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                          field.value === "Řeším si sám"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:bg-muted/50"
                                        }`}
                                      >
                                        <RadioGroupItem
                                          value="Řeším si sám"
                                          className="mr-4"
                                        />
                                        <div className="space-y-0.5">
                                          <p className="text-sm font-bold">
                                            Ubytování si zařídím sám
                                          </p>
                                        </div>
                                      </label>
                                    </>
                                  ) : (
                                    <>
                                      <label
                                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value === "Řeším si sám" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                                      >
                                        <RadioGroupItem
                                          value="Řeším si sám"
                                          className="mr-4"
                                        />
                                        <div className="space-y-0.5">
                                          <p className="text-sm font-bold">
                                            1 - Řeším si sám
                                          </p>
                                          <p className="text-[10px] uppercase opacity-60">
                                            Mimo areál / Ubytování nepotřebuji
                                          </p>
                                        </div>
                                      </label>
                                      <label
                                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value === "Vlastní stan" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                                      >
                                        <RadioGroupItem
                                          value="Vlastní stan"
                                          className="mr-4"
                                        />
                                        <div className="space-y-0.5">
                                          <p className="text-sm font-bold">
                                            2 - Vlastní stan na místě
                                          </p>

                                        </div>
                                      </label>
                                      {watchedPersons[index].ubytovani ===
                                        "Vlastní stan" && (
                                        <div className="ml-8 p-3 bg-muted/30 rounded-lg flex items-center space-x-3">
                                          <Checkbox
                                            id={`pujcit-${index}`}
                                            checked={
                                              watchedPersons[index].pujcitStan
                                            }
                                            onCheckedChange={(v) =>
                                              form.setValue(
                                                `persons.${index}.pujcitStan`,
                                                !!v,
                                              )
                                            }
                                          />
                                          <label
                                            htmlFor={`pujcit-${index}`}
                                            className="text-sm cursor-pointer font-medium opacity-80"
                                          >
                                            Potřebuju půjčit stan
                                          </label>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </RadioGroup>
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              className={`h-12 rounded-xl ${watchedPersons[index].showSong ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                              onClick={() =>
                                form.setValue(
                                  `persons.${index}.showSong`,
                                  !watchedPersons[index].showSong,
                                )
                              }
                            >
                              <Music className="w-4 h-4 mr-2" /> Hudba na přání
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={`h-12 rounded-xl ${watchedPersons[index].showMessage ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                              onClick={() =>
                                form.setValue(
                                  `persons.${index}.showMessage`,
                                  !watchedPersons[index].showMessage,
                                )
                              }
                            >
                              <MessageSquare className="w-4 h-4 mr-2" /> Vzkaz
                              pro nás
                            </Button>
                          </div>

                          <AnimatePresence>
                            {watchedPersons[index].showSong && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <FormField
                                  control={form.control}
                                  name={`persons.${index}.song`}
                                  render={({ field }) => (
                                    <FormItem className="bg-muted/40 p-4 rounded-xl shadow-inner">
                                      <FormLabel className="text-[10px] font-bold uppercase opacity-60">
                                        Jakou písničku máme zahrát?
                                      </FormLabel>
                                      <Input
                                        {...field}
                                        className="bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0"
                                      />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>
                            )}
                            {watchedPersons[index].showMessage && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <FormField
                                  control={form.control}
                                  name={`persons.${index}.message`}
                                  render={({ field }) => (
                                    <FormItem className="bg-muted/40 p-4 rounded-xl shadow-inner">
                                      <FormLabel className="text-[10px] font-bold uppercase opacity-60">
                                        Vzkaz pro novomanžele
                                      </FormLabel>
                                      <Textarea
                                        {...field}
                                        className="bg-transparent border-none focus-visible:ring-0 resize-none h-24"
                                      />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              <div className="space-y-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-14 rounded-2xl border-2 border-dashed border-border hover:bg-card transition-all"
                  onClick={() =>
                    append({
                      jmeno: "",
                      prijmeni: "",
                      attendance: "",
                      ubytovani: "",
                      pujcitStan: false,
                      svozTam: false,
                      svozZpet: false,
                      song: "",
                      message: "",
                      showSong: false,
                      showMessage: false,
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" /> Přidat další osobu
                </Button>
                <Button
                  type="submit"
                  className="w-full h-16 rounded-2xl bg-primary text-primary-foreground text-lg font-serif shadow-lg transition-all active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Odesílám..." : "Potvrdit účast"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </main>
      <Footer />
    </div>
  );
}
