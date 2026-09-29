import { useLayoutEffect, useRef, useState } from "react";

// TATO ČÍSLA JSOU DEFINOVÁNA PODLE TVÉHO ZDROJE (Vnitřní strana: Široká / Střed / Úzká)
const PANELS = {

  left:   { x: 74,   y: 73, w: 662, h: 1322 }, // Široká chlopeň
  center: { x: 736,  y: 73, w: 1770, h: 1322 }, // Pevný střed
  right:  { x: 2506,  y: 73, w: 1724,  h: 1322 }, // Úzká chlopeň (titulka)
} as const;

const SOURCE_W = 4298;
const SOURCE_H = 1464;

const OUTSIDE = "/oznam/outside.svg";
const INSIDE = "/oznam/inner.svg";

const TOTAL_W = PANELS.left.w + PANELS.center.w + PANELS.right.w;
const TOTAL_H = PANELS.center.h;

type PanelName = keyof typeof PANELS;

// Komponenta pro správné vyříznutí tiskových dat bez deformace
function PanelTexture({ image, panel, isOutside }: { image: string; panel: PanelName; isOutside: boolean }) {
    const borderRadius = (() => {
        if (!isOutside) {
            if (panel === "left") return "40px 0 0 40px";
            if (panel === "right") return "0 40px 40px 0";
            return "0";
        }

        // outside.svg je zrcadlově: úzká titulka vlevo, široká chlopeň vpravo
        if (panel === "right") return "40px 0 0 40px";
        if (panel === "left") return "0 40px 40px 0";
        return "0";
        })();
  // Výchozí souřadnice pro vnitřní stranu (inner.svg)
  let viewBoxX = PANELS[panel].x;
  let viewBoxW = PANELS[panel].w;

  // REÁLNÉ TISKOVÉ OTOČENÍ: Pro outside.svg jsou ohyby zrcadlově obráceně (Úzká / Střed / Široká)
  if (isOutside) {
    if (panel === "left") {
      // 3D Levý panel (široký 1724px) si vezme širokou grafiku z PRAVÉHO okraje outside.svg
      viewBoxW = PANELS.left.w;
      viewBoxX = 74 + PANELS.right.w + PANELS.center.w;
    } else if (panel === "center") {
      // 3D Středový panel (1770px) si vezme střed z outside.svg, který začíná hned za úzkou titulkou
      viewBoxW = PANELS.center.w;
      viewBoxX = 74 + PANELS.right.w;
    } else if (panel === "right") {
      // 3D Pravý panel (úzký 662px) si vezme úzkou titulku z LEVÉHO okraje outside.svg
      viewBoxW = PANELS.right.w;
      viewBoxX = 74;
    }
  }

  return (
    <div
        className="absolute inset-0 w-full h-full overflow-hidden bg-white shadow-2xl"
        style={{
            borderRadius,
            backfaceVisibility: "hidden",
        }}
        >
      <svg
        viewBox={`${viewBoxX} ${PANELS[panel].y} ${viewBoxW} ${PANELS[panel].h}`}
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        <image href={image} x="0" y="0" width={SOURCE_W} height={SOURCE_H} />
      </svg>
    </div>
  );
}

function InnerCenterOverlay({ active }: { active: boolean }) {
  return (
    <div
      className="absolute inset-0 z-10"
      style={{
        backfaceVisibility: "hidden",
        pointerEvents: active ? "auto" : "none",
      }}
    >
      <a
        href="."
        target="_blank"
        rel="noopener noreferrer"
        className="absolute rounded-s bg-black/0 px-6 py-4 text-white font-semibold shadow-xl hover:bg-black/20 transition"
        style={{
          left: "40%",
          top: "65%",
          width: "50%",
          height: "20%",
          transform: "translateZ(10px)",
        }}
      >
      </a>
    </div>
  );
}

export default function OnlineOznam() {
  const [opened, setOpened] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [outsideOnTop, setOutsideOnTop] = useState(true);
  const [boxW, setBoxW] = useState(560);
  const [isMobile, setIsMobile] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [isHostina, setIsHostina] = useState(false);
  const hostinaSize = isMobile ? 180 : 300;

  useLayoutEffect(() => {
    setIsHostina(
      new URLSearchParams(window.location.search).has("hostina")
    );
  }, []);

  // Měřítko responzivity: Zavřený leták se na obrazovce centruje a škáluje podle středového panelu
  const visibleW = opened ? TOTAL_W : PANELS.center.w;
  const scale = boxW / visibleW;
  

  useLayoutEffect(() => {
    if (!boxRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setBoxW(entry.contentRect.width);
    });
    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");

    const update = () => setIsMobile(mq.matches);
    update();

    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 p-4 overflow-hidden select-none">
      
      <div
        ref={boxRef}
        className="relative transition-all duration-700 ease-in-out"
        style={{
          width: opened ? "92vw" : "min(92vw, 560px)",
          maxWidth: opened ? 1152 : 560,
          height: TOTAL_H * scale,
          perspective: 3000,
        }}
      >
        {/* HLAVNÍ 3D CONTAINER LETÁKU */}
        <div
          className="absolute top-0 h-full transition-transform duration-1000 ease-in-out cursor-pointer"
          onClick={() => {
            if (!opened) {
                setOutsideOnTop(false);
                setOpened(true);
            }
            }}
          style={{
            transformStyle: "preserve-3d",
            width: TOTAL_W * scale,
            left: opened ? 0 : -(PANELS.left.w * scale),
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformOrigin: "center center",
          }}
        >
          
          {/* ========================================================================= */}
          {/* LEVÝ PANEL (Široká chlopeň)                                               */}
          {/* ========================================================================= */}
          <div
            className="absolute top-0 transition-transform duration-1000 ease-in-out"
            style={{
                width: PANELS.left.w * scale,
                height: TOTAL_H * scale,
                left: 0,
                transformStyle: "preserve-3d",
                transformOrigin: "right center",
                transform: opened ? "rotateY(0deg)" : "rotateY(-180deg)",

                // levá je pod pravou
                zIndex: opened ? 10 : 35,

                // zavírání hned, otevírání až po pravé
                transitionDelay: opened ? (isMobile ? "80ms" : "180ms") : "0ms",
                transitionDuration: isMobile ? "460ms" : "760ms",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            >
            {/* Vnitřek (Líc) */}
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
              <PanelTexture image={INSIDE} panel="left" isOutside={false} />
            </div>
            {/* Vnějšek (Rub) */}
            <div className="absolute inset-0" style={{ transform: "rotateY(180deg) translateZ(2px)", backfaceVisibility: "hidden", zIndex: outsideOnTop ? 50 : 1, }}>
              <PanelTexture image={OUTSIDE} panel="left" isOutside={true} />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STŘEDOVÝ PANEL (Základna)                                                 */}
          {/* ========================================================================= */}
          <div
            className="absolute top-0"
            style={{
              width: PANELS.center.w * scale,
              height: TOTAL_H * scale,
              left: PANELS.left.w * scale,
              transformStyle: "preserve-3d",
              zIndex: 5,
            }}
          >
            {/* Vnitřek (Líc) */}
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
              <PanelTexture image={INSIDE} panel="center" isOutside={false} />
              <InnerCenterOverlay active={opened && !flipped} />
            </div>
            {/* Vnějšek (Rub) */}
            <div className="absolute inset-0" style={{ transform: "rotateY(180deg) translateZ(2px)", backfaceVisibility: "hidden", zIndex: outsideOnTop ? 50 : 1, }}>
              <PanelTexture image={OUTSIDE} panel="center" isOutside={true} />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PRAVÝ PANEL (Úzká chlopeň / Titulka)                                      */}
          {/* ========================================================================= */}
          <div
            className="absolute top-0 transition-transform ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
                width: PANELS.right.w * scale,
                height: TOTAL_H * scale,
                left: (PANELS.left.w + PANELS.center.w) * scale,
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transform: opened ? "rotateY(0deg)" : "rotateY(180deg)",

                zIndex: opened ? 20 : 40,

                transitionDuration: opened ? (isMobile ? "420ms" : "650ms") : (isMobile ? "420ms" : "720ms"),
                transitionDelay: opened ? "0ms" : (isMobile ? "0ms" : "60ms"),
            }}
            >
            {/* Vnitřek (Líc) */}
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
              <PanelTexture image={INSIDE} panel="right" isOutside={false} />
            </div>
            {/* Vnějšek (Rub) */}
            <div className="absolute inset-0" style={{ transform: "rotateY(180deg) translateZ(2px)", backfaceVisibility: "hidden", zIndex: outsideOnTop ? 50 : 1, }}>
              <PanelTexture image={OUTSIDE} panel="right" isOutside={true} />
            </div>
          </div>

        </div>
      </div>


      {/* Ovládací tlačítka */}
      {opened && (
        <div className="flex gap-3 z-50">
          <button
            onClick={() => {
              const nextFlipped = !flipped;
              setOutsideOnTop(nextFlipped);
              setFlipped(nextFlipped);
            }}
            className="rounded-xl bg-white px-5 py-2 font-medium text-black shadow-lg hover:bg-zinc-200 transition"
          >
            {flipped ? "Zobrazit vnitřní stranu" : "Otočit na venkovní stranu"}
          </button>

          <button
            onClick={() => {
              setFlipped(false);
              setOutsideOnTop(true);
              setOpened(false);
            }}
            className="rounded-xl border border-white/30 px-5 py-2 text-white hover:bg-white/10 transition"
          >
            Zavřít a složit
          </button>
        </div>
      )}

      {isHostina && (
        
      <div
        className="z-50 flex items-center justify-center"
        style={{
          gap: isMobile ? "8px" : "12px",
        }}
      >
        <img
          src="/oznam/hostina-1.webp"
          alt=""
          style={{
            width: hostinaSize,
            height: "auto",
          }}
        />

        <a
            href="."
            target="_blank"
            rel="noopener noreferrer"
          >
          <img
            src="/oznam/hostina-2.webp"
            alt=""
            style={{
              width: hostinaSize,
              height: "auto",
            }}
          />
        </a>
          {!isMobile && (
            <a
              href="."
              target="_blank"
              rel="noopener noreferrer"
              className="absolute rounded-s bg-black/0 px-6 py-4 text-white font-semibold shadow-xl hover:bg-black/20 transition"
              style={{
                right: "35%",
                top: "75%",
                width: "13%",
                height: "8%",
                transform: "translateZ(10px)",
              }}
            >
            </a>
          )}
          
      </div>
      
      
    )}
      
    </main>
  );
}
