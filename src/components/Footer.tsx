import { COUPLE_NAME_LEFT, COUPLE_NAME_RIGHT, WEDDING_DATE_DISPLAY, HASHTAG } from "@/config";

export default function Footer() {
  return (
    <footer 
  className="relative py-24 text-center overflow-hidden"
  style={{
    /* Tady nastav barvu pozadí tvého webu, aby prosvítala skrz ty stromy */
    backgroundColor: 'transparent', 
    backgroundImage: "url('./footer.webp')",
    backgroundSize: 'cover',
    backgroundPosition: 'bottom center',
    backgroundRepeat: 'no-repeat',
    /* Výška zajistí, že se motiv krajiny hezky vykreslí a text bude mít prostor */
    minHeight: '450px', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }}
>
  <div className="container mx-auto px-6 relative z-10">
    <h2 className="font-serif text-4xl md:text-5xl mb-4 text-primary">
      {COUPLE_NAME_LEFT} & {COUPLE_NAME_RIGHT}
    </h2>
    <p className="text-muted-foreground uppercase tracking-widest text-sm mb-8">
      {WEDDING_DATE_DISPLAY}
    </p>
    <p className="text-muted-foreground text-base font-serif italic">
      Děkujeme, že jste součástí našeho příběhu.
    </p>
    <p className="mt-12 text-xs text-muted-foreground/60 uppercase tracking-[0.3em]">
      #{HASHTAG}
    </p>
  </div>
</footer>

  );
}
