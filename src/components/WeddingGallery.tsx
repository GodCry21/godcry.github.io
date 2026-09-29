import React, { useEffect, useRef, useState } from "react";

const GAS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxsjpoNzxOma_ZgZ7uecPVIvtzue3RUt_4CZYZl-AIXkIfwWi3r9qY3voLQMcaGUAXH/exec";

const PAGE_SIZE = 24;

const FULL_MAX_SIZE = 2560;
const FULL_JPEG_QUALITY = 0.88;

const THUMB_MAX_SIZE = 400;
const THUMB_JPEG_QUALITY = 0.60;

const MAX_INPUT_FILE_SIZE = 40 * 1024 * 1024;

// public/images/wedding-photographer/manifest.json
const PHOTOGRAPHER_MANIFEST_URL =
  "/images/wedding-photographer/manifest.json";

type GalleryTab = "photographer" | "guests" | "upload";

interface GuestImageItem {
  id: string;
  name: string;
  created: number;
  thumbnailId?: string | null;
}

interface PhotographerImageItem {
  name: string;
  thumb: string;
  full: string;
}

interface GalleryResponse {
  success: boolean;
  data?: GuestImageItem[];
  total?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  error?: string;
}

interface UploadResponse {
  success: boolean;
  id?: string;
  alreadyExists?: boolean;
  error?: string;
}

interface PreparedImage {
  fullBase64: string;
  thumbBase64: string;
  width: number;
  height: number;
}

interface LightboxImage {
  name: string;
  src: string;
}

export const WeddingGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GalleryTab>("photographer");

  const [photographerImages, setPhotographerImages] = useState<
    PhotographerImageItem[]
  >([]);
  const [photographerLoading, setPhotographerLoading] = useState(true);
  const [photographerError, setPhotographerError] = useState("");

  const [guestImages, setGuestImages] = useState<GuestImageItem[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestGalleryLoaded, setGuestGalleryLoaded] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({ current: 0, total: 0 });
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [totalGuestImages, setTotalGuestImages] = useState(0);
  const [hasMoreGuestImages, setHasMoreGuestImages] = useState(false);
  const [nextGuestCursor, setNextGuestCursor] = useState<string | null>(null);

  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadPhotographerGallery = async () => {
      setPhotographerLoading(true);
      setPhotographerError("");

      try {
        const response = await fetch(PHOTOGRAPHER_MANIFEST_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as PhotographerImageItem[];

        if (!Array.isArray(data)) {
          throw new Error("Manifest fotografa nemá správný formát.");
        }

        setPhotographerImages(data);
      } catch (error) {
        console.error("Chyba při načítání fotek fotografa:", error);
        setPhotographerError(
          "Fotky od fotografa se nepodařilo načíst."
        );
      } finally {
        setPhotographerLoading(false);
      }
    };

    void loadPhotographerGallery();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "Nahrávání fotek stále probíhá.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

  useEffect(() => {
    if (activeTab === "guests" && !guestGalleryLoaded && !guestLoading) {
      void fetchGuestImages(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveImageIndex(null);
      }

      if (e.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (e.key === "ArrowRight") {
        showNextImage();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeImageIndex, lightboxImages.length]);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => window.setTimeout(resolve, ms));

  const createUploadId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  };

  const calculateSize = (
    width: number,
    height: number,
    maxSize: number
  ): { width: number; height: number } => {
    if (width <= maxSize && height <= maxSize) {
      return { width, height };
    }

    if (width >= height) {
      return {
        width: maxSize,
        height: Math.max(1, Math.round((height * maxSize) / width)),
      };
    }

    return {
      width: Math.max(1, Math.round((width * maxSize) / height)),
      height: maxSize,
    };
  };

  const prepareImage = (file: File): Promise<PreparedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () =>
        reject(new Error(`Soubor ${file.name} se nepodařilo načíst.`));

      reader.onload = () => {
        const img = new Image();

        img.onerror = () =>
          reject(
            new Error(
              `Fotografii ${file.name} prohlížeč neumí dekódovat. ` +
                `Zkuste ji uložit jako JPEG.`
            )
          );

        img.onload = () => {
          try {
            const sourceWidth = img.naturalWidth || img.width;
            const sourceHeight = img.naturalHeight || img.height;

            if (!sourceWidth || !sourceHeight) {
              throw new Error("Obrázek nemá platné rozměry.");
            }

            const fullSize = calculateSize(
              sourceWidth,
              sourceHeight,
              FULL_MAX_SIZE
            );

            const fullCanvas = document.createElement("canvas");
            fullCanvas.width = fullSize.width;
            fullCanvas.height = fullSize.height;

            const fullCtx = fullCanvas.getContext("2d");
            if (!fullCtx) throw new Error("Canvas není dostupný.");

            fullCtx.drawImage(img, 0, 0, fullSize.width, fullSize.height);

            const fullBase64 = fullCanvas.toDataURL(
              "image/jpeg",
              FULL_JPEG_QUALITY
            );

            const thumbSize = calculateSize(
              sourceWidth,
              sourceHeight,
              THUMB_MAX_SIZE
            );

            const thumbCanvas = document.createElement("canvas");
            thumbCanvas.width = thumbSize.width;
            thumbCanvas.height = thumbSize.height;

            const thumbCtx = thumbCanvas.getContext("2d");
            if (!thumbCtx) throw new Error("Canvas není dostupný.");

            thumbCtx.drawImage(img, 0, 0, thumbSize.width, thumbSize.height);

            const thumbBase64 = thumbCanvas.toDataURL(
              "image/jpeg",
              THUMB_JPEG_QUALITY
            );

            img.src = "";

            resolve({
              fullBase64,
              thumbBase64,
              width: fullSize.width,
              height: fullSize.height,
            });
          } catch (error) {
            reject(error);
          }
        };

        img.src = reader.result as string;
      };

      reader.readAsDataURL(file);
    });
  };

  const postToGas = async (
    payload: object,
    retryCount = 0
  ): Promise<UploadResponse> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await fetch(GAS_WEB_APP_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: UploadResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Apps Script vrátil chybu.");
        }

        return result;
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error(String(error));

        if (attempt < retryCount) {
          await sleep(700 * (attempt + 1));
        }
      }
    }

    throw lastError || new Error("Upload se nezdařil.");
  };

  const fetchGuestImages = async (reset = false) => {
    if (guestLoading) return;

    setGuestLoading(true);

    try {
      const url = new URL(GAS_WEB_APP_URL);
      url.searchParams.set("limit", String(PAGE_SIZE));

      if (!reset && nextGuestCursor) {
        url.searchParams.set("cursor", nextGuestCursor);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json: GalleryResponse = await response.json();

      if (!json.success) {
        throw new Error(json.error || "Galerii se nepodařilo načíst.");
      }

      const newImages = json.data || [];

      if (reset) {
        setGuestImages(newImages);
      } else {
        setGuestImages((previous) => {
          const ids = new Set(previous.map((image) => image.id));

          return [
            ...previous,
            ...newImages.filter((image) => !ids.has(image.id)),
          ];
        });
      }

      setTotalGuestImages(json.total || 0);
      setHasMoreGuestImages(Boolean(json.hasMore));
      setNextGuestCursor(json.nextCursor || null);
      setGuestGalleryLoaded(true);
    } catch (error) {
      console.error("Chyba při načítání galerie hostů:", error);
    } finally {
      setGuestLoading(false);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    setUploadError("");
    setIsUploading(true);
    setUploadStats({ current: 0, total: selectedFiles.length });

    const failedFiles: string[] = [];

    try {
      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];

        setUploadStats({
          current: index + 1,
          total: selectedFiles.length,
        });

        try {
          if (file.size > MAX_INPUT_FILE_SIZE) {
            throw new Error(
              `Soubor je větší než ${Math.round(
                MAX_INPUT_FILE_SIZE / 1024 / 1024
              )} MB.`
            );
          }

          if (!file.type.startsWith("image/")) {
            throw new Error("Vybraný soubor není obrázek.");
          }

          setUploadProgress(`Připravuji: ${file.name}`);

          const prepared = await prepareImage(file);
          const filename = `wedding_org_${createUploadId()}.jpg`;

          setUploadProgress(`Nahrávám: ${file.name}`);

          await postToGas(
            {
              type: "photo",
              name: filename,
              mimeType: "image/jpeg",
              width: prepared.width,
              height: prepared.height,
              fullBase64: prepared.fullBase64,
              thumbBase64: prepared.thumbBase64,
            },
            1
          );
        } catch (error) {
          console.error(`Chyba při uploadu ${file.name}:`, error);
          failedFiles.push(file.name);
        }
      }
    } finally {
      setIsUploading(false);
      setUploadProgress("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (failedFiles.length > 0) {
        setUploadError(
          `Nepodařilo se nahrát ${failedFiles.length} z ${selectedFiles.length} fotografií: ${failedFiles.join(
            ", "
          )}`
        );
      } else {
        setActiveTab("guests");
      }

      await fetchGuestImages(true);
    }
  };

  const guestThumbnailSrc = (image: GuestImageItem) => {
    const id = image.thumbnailId || image.id;

    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      id
    )}&sz=w600`;
  };

  const guestFullSrc = (image: GuestImageItem) =>
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      image.id
    )}&sz=w2200`;

  const openPhotographerLightbox = (index: number) => {
    setLightboxImages(
      photographerImages.map((image) => ({
        name: image.name,
        src: image.full,
      }))
    );
    setActiveImageIndex(index);
  };

  const openGuestLightbox = (index: number) => {
    setLightboxImages(
      guestImages.map((image) => ({
        name: image.name,
        src: guestFullSrc(image),
      }))
    );
    setActiveImageIndex(index);
  };

  const closeLightbox = () => setActiveImageIndex(null);

  const showPreviousImage = () => {
    setActiveImageIndex((previous) => {
      if (previous === null || lightboxImages.length === 0) return null;
      return previous === 0 ? lightboxImages.length - 1 : previous - 1;
    });
  };

  const showNextImage = () => {
    setActiveImageIndex((previous) => {
      if (previous === null || lightboxImages.length === 0) return null;
      return previous === lightboxImages.length - 1 ? 0 : previous + 1;
    });
  };

  const renderSkeletons = (count: number) =>
    Array.from({ length: count }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="gallery-item aspect-square rounded-lg border bg-muted overflow-hidden relative animate-pulse"
      >
        <div className="absolute inset-[-100%] bg-[linear-gradient(135deg,transparent_44%,rgba(255,255,255,0.9)_50%,transparent_56%)] animate-[shimmerDiagonal_1.5s_infinite]" />
      </div>
    ));

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <h1>Naše svatební galerie</h1>

        <p className="gallery-subtitle font-serif italic text-muted-foreground">
          Fotky od fotografa i momentky od našich hostů na jednom místě
        </p>

        <div className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setActiveTab("photographer")}
            className={`rounded-xl border px-5 py-4 text-left transition ${
              activeTab === "photographer"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background hover:bg-muted"
            }`}
          >
            <span className="block font-semibold">Od fotografa</span>
            <span className="mt-1 block text-xs opacity-80">
              Profesionální svatební fotografie
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guests")}
            className={`rounded-xl border px-5 py-4 text-left transition ${
              activeTab === "guests"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background hover:bg-muted"
            }`}
          >
            <span className="block font-semibold">Od hostů</span>
            <span className="mt-1 block text-xs opacity-80">
              Momentky nahrané během svatby
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`rounded-xl border px-5 py-4 text-left transition ${
              activeTab === "upload"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background hover:bg-muted"
            }`}
          >
            <span className="block font-semibold">Nahrát fotky</span>
            <span className="mt-1 block text-xs opacity-80">
              Přidejte svoje fotografie
            </span>
          </button>
        </div>
      </header>

      {activeTab === "photographer" && (
        <section>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold">Fotky od fotografa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Výběr profesionálních fotografií z našeho dne
            </p>
          </div>

          {photographerLoading && (
            <main className="gallery-grid">{renderSkeletons(12)}</main>
          )}

          {!photographerLoading && photographerError && (
            <p className="py-10 text-center text-sm text-red-600">
              {photographerError}
            </p>
          )}

          {!photographerLoading &&
            !photographerError &&
            photographerImages.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Fotky od fotografa zde brzy přibudou.
              </p>
            )}

          {!photographerLoading && photographerImages.length > 0 && (
            <main className="gallery-grid">
              {photographerImages.map((image, index) => (
                <button
                  type="button"
                  key={`${image.full}-${index}`}
                  className="gallery-item relative overflow-hidden cursor-pointer aspect-square rounded-lg border bg-muted"
                  onClick={() => openPhotographerLightbox(index)}
                  aria-label={`Otevřít fotografii ${image.name}`}
                >
                  <img
                    src={image.thumb}
                    alt={image.name}
                    loading={index < 8 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index < 4 ? "high" : "auto"}
                    className="w-full h-full object-cover block transition-transform duration-300 hover:scale-[1.02]"
                  />
                </button>
              ))}
            </main>
          )}
        </section>
      )}

      {activeTab === "guests" && (
        <section>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold">Fotky od hostů</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fotografie, o které se s námi podělili naši hosté
            </p>
          </div>

          {guestLoading && guestImages.length === 0 && (
            <main className="gallery-grid">{renderSkeletons(12)}</main>
          )}

          {!guestLoading && guestGalleryLoaded && guestImages.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Zatím zde nejsou žádné fotografie od hostů.
              </p>
              <button
                type="button"
                className="upload-btn mt-5"
                onClick={() => setActiveTab("upload")}
              >
                Nahrát první fotky
              </button>
            </div>
          )}

          {guestImages.length > 0 && (
            <>
              <main className="gallery-grid">
                {guestImages.map((image, index) => (
                  <button
                    type="button"
                    key={image.id}
                    className="gallery-item relative overflow-hidden cursor-pointer aspect-square rounded-lg border bg-muted"
                    onClick={() => openGuestLightbox(index)}
                    aria-label={`Otevřít fotografii ${image.name}`}
                  >
                    <img
                      src={guestThumbnailSrc(image)}
                      alt={image.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover block"
                    />
                  </button>
                ))}

                {guestLoading &&
                  guestImages.length > 0 &&
                  hasMoreGuestImages &&
                  renderSkeletons(6)}
              </main>

              {hasMoreGuestImages && (
                <div className="w-full flex justify-center py-6">
                  <button
                    type="button"
                    className="upload-btn"
                    disabled={guestLoading}
                    onClick={() => void fetchGuestImages(false)}
                  >
                    {guestLoading ? "Načítám..." : "Načíst další fotky"}
                  </button>
                </div>
              )}

              {totalGuestImages > 0 && (
                <p className="text-center text-xs text-muted-foreground pb-6">
                  Zobrazeno {guestImages.length} z {totalGuestImages} fotografií
                </p>
              )}
            </>
          )}
        </section>
      )}

      {activeTab === "upload" && (
        <section className="mx-auto w-full max-w-xl px-4 pb-12">
          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Nahrajte svoje fotky</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Vyberte jednu nebo více fotografií. Před nahráním se automaticky
                zmenší, aby upload nebyl zbytečně pomalý.
              </p>
            </div>

            <div className="upload-section w-full max-w-md mx-auto mt-6">
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                id="wedding-file-input"
                className="hidden-input"
                disabled={isUploading}
              />

              <label
                htmlFor="wedding-file-input"
                className={`upload-btn ${isUploading ? "disabled" : ""}`}
              >
                {isUploading ? "Nahrávám..." : "Vybrat a nahrát fotky"}
              </label>

              {isUploading && (
                <>
                  <div className="w-full mt-4 bg-muted border rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{
                        width: `${
                          (uploadStats.current /
                            Math.max(uploadStats.total, 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <p className="progress-text mt-2 text-center font-sans text-xs">
                    Fotka {uploadStats.current} z {uploadStats.total}
                  </p>

                  <p className="progress-text mt-1 text-center font-sans text-xs">
                    {uploadProgress}
                  </p>
                </>
              )}

              {uploadError && (
                <p className="mt-3 text-sm text-red-600 text-center">
                  {uploadError}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {activeImageIndex !== null && lightboxImages[activeImageIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            style={{ zIndex: 10 }}
            onClick={closeLightbox}
            aria-label="Zavřít fotografii"
          />

          <div
            className="relative flex h-[90vh] w-full max-w-6xl items-center justify-center"
            style={{ zIndex: 20 }}
          >
            <img
              src={lightboxImages[activeImageIndex].src}
              alt={lightboxImages[activeImageIndex].name}
              className="max-h-full max-w-full object-contain"
              decoding="async"
            />
          </div>

          <button
            type="button"
            aria-label="Zavřít fotografii"
            className="fixed top-3 right-3 w-12 h-12 flex items-center justify-center rounded-full bg-black/70 text-white text-2xl cursor-pointer touch-manipulation select-none"
            style={{ zIndex: 100 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeLightbox();
            }}
          >
            ✕
          </button>

          {lightboxImages.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Předchozí fotografie"
                className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 w-14 h-24 sm:w-16 sm:h-28 flex items-center justify-center rounded-2xl bg-black/65 text-white text-5xl shadow-lg cursor-pointer touch-manipulation select-none active:scale-95 transition-transform"
                style={{ zIndex: 100 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  showPreviousImage();
                }}
              >
                ‹
              </button>

              <button
                type="button"
                aria-label="Další fotografie"
                className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 w-14 h-24 sm:w-16 sm:h-28 flex items-center justify-center rounded-2xl bg-black/65 text-white text-5xl shadow-lg cursor-pointer touch-manipulation select-none active:scale-95 transition-transform"
                style={{ zIndex: 100 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  showNextImage();
                }}
              >
                ›
              </button>
            </>
          )}

          <div
            className="fixed bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white/90"
            style={{ zIndex: 100 }}
          >
            {activeImageIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
    </div>
  );
};
