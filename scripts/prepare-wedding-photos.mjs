import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const THUMB_SIZE = 500;
const THUMB_QUALITY = 72;

const FULL_SIZE = 2560;
const FULL_QUALITY = 84;

const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff",
  ".avif",
]);

const inputDirArg = process.argv[2];
const thumbsOnly = process.argv.includes("--thumbs-only");

if (!inputDirArg) {
  console.error(`
Použití:
  node scripts/prepare-wedding-photos.mjs "C:\\cesta\\k\\fotkam"

Příklad:
  node scripts/prepare-wedding-photos.mjs "D:\\Svatba\\Fotograf"
`);
  process.exit(1);
}

const inputDir = path.resolve(inputDirArg);

const projectRoot = process.cwd();
const outputRoot = path.join(
  projectRoot,
  "public",
  "images",
  "wedding-photographer"
);

const thumbDir = path.join(outputRoot, "thumb");
const fullDir = path.join(outputRoot, "full");
const manifestPath = path.join(outputRoot, "manifest.json");

const ensureDirectory = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const emptyDirectory = async (dir) => {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const formatFileName = (index) => {
  return String(index + 1).padStart(4, "0");
};

const makeDisplayName = (originalName, index) => {
  const withoutExtension = path.parse(originalName).name.trim();

  if (withoutExtension) {
    return withoutExtension.replace(/[_-]+/g, " ");
  }

  return `Svatební fotografie ${index + 1}`;
};

const main = async () => {
  if (!(await fileExists(inputDir))) {
    throw new Error(`Vstupní složka neexistuje: ${inputDir}`);
  }

  console.log(`Zdroj: ${inputDir}`);
  console.log(`Výstup: ${outputRoot}`);
  console.log("");

  const directoryEntries = await fs.readdir(inputDir, {
    withFileTypes: true,
  });

  const imageFiles = directoryEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) =>
      SUPPORTED_EXTENSIONS.has(
        path.extname(fileName).toLowerCase()
      )
    )
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

  if (imageFiles.length === 0) {
    throw new Error(
      "Ve vstupní složce nebyly nalezeny žádné podporované fotografie."
    );
  }

  console.log(`Nalezeno fotografií: ${imageFiles.length}`);
  console.log("");

  /*
   * Výstupní složky při každém spuštění vyčistíme,
   * aby v galerii nezůstaly staré fotky.
   */
  await ensureDirectory(outputRoot);
  await emptyDirectory(thumbDir);

  if (!thumbsOnly) {
    await emptyDirectory(fullDir);
  }

  const manifest = [];

  for (let index = 0; index < imageFiles.length; index++) {
    const sourceName = imageFiles[index];
    const sourcePath = path.join(inputDir, sourceName);

    const outputBaseName = formatFileName(index);
    const outputFileName = `${outputBaseName}.webp`;

    const thumbPath = path.join(
      thumbDir,
      outputFileName
    );

    const fullPath = path.join(
      fullDir,
      outputFileName
    );

    const progress = `[${String(index + 1).padStart(
      String(imageFiles.length).length,
      " "
    )}/${imageFiles.length}]`;

    console.log(`${progress} ${sourceName}`);

    /*
     * THUMBNAIL
     *
     * Vytvoří čtvercový náhled 500 × 500 px.
     *
     * rotate() bez parametrů automaticky respektuje
     * EXIF orientaci fotografie.
     *
     * fit: "cover" obrázek ořízne tak,
     * aby přesně zaplnil čtverec.
     */
    await sharp(sourcePath)
      .rotate()
      .resize({
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .webp({
        quality: THUMB_QUALITY,
        effort: 4,
      })
      .toFile(thumbPath);

    /*
     * VELKÁ FOTOGRAFIE
     *
     * Maximální rozměr je 2560 px.
     * Poměr stran zůstane zachovaný.
     *
     * Fotografie se nikdy nezvětšuje,
     * pouze případně zmenší.
     */
    if (!thumbsOnly) {
        await sharp(sourcePath)
        .rotate()
        .resize({
            width: FULL_SIZE,
            height: FULL_SIZE,
            fit: "inside",
            withoutEnlargement: true,
        })
        .webp({
            quality: FULL_QUALITY,
            effort: 4,
        })
        .toFile(fullPath);
    }

    /*
     * Záznam do manifest.json
     */
    manifest.push({
      name: makeDisplayName(
        sourceName,
        index
      ),

      thumb:
        `/images/wedding-photographer/thumb/${outputFileName}`,

      full:
        `/images/wedding-photographer/full/${outputFileName}`,
    });
  }

  /*
   * Vytvoření manifest.json
   */
  if (!thumbsOnly) {
    await fs.writeFile(
        manifestPath,
        `${JSON.stringify(manifest, null, 2)}\n`,
        "utf8"
    );
  }

  console.log("");
  console.log("Hotovo.");
  console.log("");

  console.log(
    `Náhledy: ${thumbDir}`
  );

  console.log(
    `Velké fotky: ${fullDir}`
  );

  console.log(
    `Manifest: ${manifestPath}`
  );

  console.log("");

  console.log(
    "Teď stačí změny commitnout a pushnout do GitHub repozitáře."
  );
};

main().catch((error) => {
  console.error("");
  console.error("CHYBA:");

  console.error(
    error instanceof Error
      ? error.message
      : error
  );

  process.exit(1);
});