import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6 text-center">
      <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-6">
        404
      </p>
      <h1 className="font-serif text-5xl md:text-6xl text-primary font-light mb-6">
        Stránka nenalezena
      </h1>
      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed font-serif italic">
        Bohužel jsme tuto stránku nenašli. Vraťte se prosím na úvod.
      </p>
      <Link href="/">
        <Button
          variant="outline"
          className="rounded-none uppercase tracking-widest text-xs h-12 px-8"
        >
          Zpět na úvod
        </Button>
      </Link>
    </div>
  );
}
