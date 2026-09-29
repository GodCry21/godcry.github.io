import { useEffect, useState } from "react";
import { Map, MapControls, useMap,
  MapMarker,
  MarkerContent,
  MapRoute,
  MarkerLabel,
} from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaBridgeCircleXmark } from "react-icons/fa6";

import { FaGlassCheers, FaParking } from 'react-icons/fa'; 
import { GiBigDiamondRing, GiRing  } from "react-icons/gi";
import { PiCheers   } from "react-icons/pi";
import { LiaRingSolid } from "react-icons/lia";

import { HeartHandshake, Mountain, MapPinned, Clock, Route, Loader2  } from 'lucide-react';
import { MAP_NAVIGATE } from "@/config";



const obrad = { name: "Obřad", lng: 15.0712119, lat: 50.107190 };
const hostina = { name: "Hostina", lng: 15.0753211, lat: 50.1091172 };

const parkoviste = { name: "Parkoviště", lng: 15.0738433, lat: 50.1063856 };
const kruhac = { name: "", lng: 15.0983158, lat: 50.1329306 };
const most = { name: "Zbouraný most přes železnici", lng: 15.0681622, lat: 50.1058281 };

const start = kruhac;//{ name: "", lng: 15.1077786, lat: 50.1263022 };

const end = parkoviste;



const bety = { name: "Bety", lng: 14.842, lat: 50.198 };
const kuba = { name: "Kuba", lng: 16.608, lat: 49.194 };





const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent').trim() || '#f8c99b'; // fallback barva, kdyby CSS selhalo

const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary').trim() || '#a2b49e'; // fallback barva, kdyby CSS selhalo

const secondaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-secondary').trim() || '#f8c99b60'; // fallback barva, kdyby CSS selhalo




interface RouteData {
  coordinates: [number, number][];
  duration: number; // seconds
  distance: number; // meters
}


function MapController() {
  const { map, isLoaded } = useMap();
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleMove = () => {
      setPitch(Math.round(map.getPitch()));
      setBearing(Math.round(map.getBearing()));
    };

    map.on("move", handleMove);
    return () => {
      map.off("move", handleMove);
    };
  }, [map, isLoaded]);

  const handle3DView = () => {
    if (pitch != 0){
        map?.easeTo({
            pitch: 0,
            bearing: 0,
            duration: 1000,
        });
    } else {
        map?.easeTo({
            pitch: 60,
            bearing: -20,
            duration: 1000,
        });
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-2">
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="bg-white border-black group cursor-pointer" onClick={handle3DView}>
          <Mountain className="size-4" />
          <span className="hidden group-hover:inline-block ml-1.5 transition-all">3D View</span>
        </Button>
        <Button size="sm" variant="secondary" className="cursor-pointer" onClick={() => {
                                                                window.open(
                                                                MAP_NAVIGATE, 
                                                                "_blank", 
                                                                "noopener,noreferrer"
                                                                );
                                                            }}>
            <MapPinned className="mr-1.5 size-4" />
            Otevřít v GoogleMaps
        </Button>
      </div>
    </div>
  );
}


function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}



// Pomocná funkce pro vygenerování zaobleného oblouku mezi dvěma body
// curvature: kladné číslo vyboulí čáru doprava/ven, záporné doleva/dovnitř
function generateArc(p1: [number, number], p2: [number, number], curvature = 0.1, segments = 8) {
  const points: [number, number][] = [];
  
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    
    // Lineární interpolace (přímá osa mezi body)
    const lng = p1[0] + (p2[0] - p1[0]) * t;
    const lat = p1[1] + (p2[1] - p1[1]) * t;
    
    // Výpočet kolmého vektoru pro vytvoření vyboulení
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const nx = -dy;
    const ny = dx;
    
    // Parabolické prohnutí (nejsilnější uprostřed, na krajích nulové)
    const offset = Math.sin(t * Math.PI) * curvature;
    
    points.push([
      lng + nx * offset,
      lat + ny * offset
    ]);
  }
  
  return points;
}

export function ResortPolygon() {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Vašich 10 definovaných bodů resortu (indexováno 0 až 9)
    const ResortPolygonPoints: [number, number][] = [
      [15.0705935, 50.1071008],
      [15.0729394, 50.1064286],
      [15.0757289, 50.1062875],
      [15.0763833, 50.1069514],
      [15.0778478, 50.1064922],
      [15.0784889, 50.1073919],
      [15.0777753, 50.1086721],
      [15.0776301, 50.1087823],
      [15.0773835, 50.1088752],
      [15.0752857, 50.1094119],
      [15.0743525, 50.1102272],
      [15.0741867, 50.1103097],
      [15.0739985, 50.1099067],
      [15.0738757, 50.1097184],
      [15.0708285, 50.1075680],
      [15.0706620, 50.1073305]
    ];

    // Vygenerování oblouků mezi požadovanými body
    // Vyzkoušejte změnit hodnotu 0.3 (větší číslo = větší vyboulení, záporné číslo = prohnutí dovnitř)
    const arc2to3 = generateArc(ResortPolygonPoints[1], ResortPolygonPoints[2], 0.05); 

    // Poskládání finálního polygonu se zaoblenými hranami
    const ResortPolygon = [
      ResortPolygonPoints[0],
      ResortPolygonPoints[1],
      ...arc2to3,
      ResortPolygonPoints[2],
      ResortPolygonPoints[3],
      ResortPolygonPoints[4],
      ResortPolygonPoints[5],
      ResortPolygonPoints[6],
      ResortPolygonPoints[7],
      ResortPolygonPoints[8],
      ResortPolygonPoints[9],
      ResortPolygonPoints[10],
      ResortPolygonPoints[11],
      ResortPolygonPoints[12],
      ResortPolygonPoints[13],
      ResortPolygonPoints[14],
      ResortPolygonPoints[15],
      ResortPolygonPoints[0]

    ];

 
    // Poskládání finálního polygonu se zaoblenými hranami
    const BrnoPolygon = [
      [16.5986, 49.2694], [16.6321, 49.2612], [16.6540, 49.2310], 
      [16.6811, 49.2205], [16.7118, 49.2062], [16.6950, 49.1720], 
      [16.6852, 49.1235], [16.6410, 49.1150], [16.6115, 49.1112], 
      [16.5910, 49.1340], [16.5510, 49.1510], [16.5320, 49.1650], 
      [16.4851, 49.2014], [16.4620, 49.2210], [16.4923, 49.2547], 
      [16.5110, 49.2710], [16.5180, 49.2920], [16.5410, 49.2810], 
      [16.5620, 49.2630], [16.5986, 49.2694]

    ];


    const LysaPolygon = [
      [14.8315, 50.2105], [14.8450, 50.2220], [14.8510, 50.2310],
            [14.8420, 50.2430], [14.8210, 50.2450], [14.8105, 50.2390],
            [14.7950, 50.2410], [14.7780, 50.2310], [14.7810, 50.2220],
            [14.7620, 50.2110], [14.7730, 50.2010], [14.7890, 50.1980],
            [14.8020, 50.1850], [14.7910, 50.1740], [14.8150, 50.1690],
            [14.8310, 50.1720], [14.8480, 50.1650], [14.8620, 50.1710],
            [14.8780, 50.1680], [14.8910, 50.1750], [14.9010, 50.1820],
            [14.9150, 50.1890], [14.9190, 50.1970], [14.8980, 50.1990],
            [14.8850, 50.1920], [14.8720, 50.1940], [14.8610, 50.2010],
            [14.8650, 50.2090], [14.8520, 50.2130], [14.8315, 50.2105]
    ];
    


    // Přidání GeoJSON zdroje dat
    if (!map.getSource("resort-source")) {
      map.addSource("resort-source", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "MultiPolygon",
            coordinates: [
              [ResortPolygon],
              [BrnoPolygon],
              [LysaPolygon]
            ],
          },
        },
      });
    }

    
    // Přidání vrstvy podsvícení
    if (!map.getLayer("resort-fill")) {
      map.addLayer({
        id: "resort-fill",
        type: "fill",
        source: "resort-source",
        paint: {
          "fill-color": accentColor,
          "fill-opacity": 0.2,
        },
      });
    }

    // Přidání vrstvy obrysu
    if (!map.getLayer("resort-outline")) {
    map.addLayer({
        id: "resort-outline",
        type: "line",
        source: "resort-source",
        layout: {
        "line-join": "round", // Tvar spoje čar (patří do layout)
        "line-cap": "round",  // Tvar konců čar (patří do layout)
        },
        paint: {
        "line-color": primaryColor,
        "line-width": 2,
        },
    });
    }


    return () => {
      // PODMÍNKA PRO MAPLIBRE INTERNÍ STYL: Pokud už styl v knihovně neexistuje, ihned vyskoč
      if (!map || typeof map.getStyle === "undefined" || !map.getStyle()) return;

      // Nyní bezpečně otestujeme a smažeme vrstvy, protože styl mapy je prokazatelně plně aktivní
      try {
        if (map.getLayer("resort-fill")) map.removeLayer("resort-fill");
        if (map.getLayer("resort-outline")) map.removeLayer("resort-outline");
        if (map.getSource("resort-source")) map.removeSource("resort-source");
      } catch (error) {
        // Zachytí případné anomálie při bleskovém unmountu, aby web nespadl
        console.warn("Mapový cleanup byl bezpečně přeskočen:", error);
      }
    };
  }, [map, isLoaded]);



  return null;
}










export function MyMap() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutes() {
      setIsLoading(true); // Ujistíme se, že zapneme loader na začátku
      try {
        const url1 = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${kruhac.lng},${kruhac.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const url2 = `https://router.project-osrm.org/route/v1/driving/${bety.lng},${bety.lat};${kruhac.lng},${kruhac.lat}?overview=full&geometries=geojson`;
        const url3 = `https://router.project-osrm.org/route/v1/driving/${kuba.lng},${kuba.lat};${kruhac.lng},${kruhac.lat}?overview=full&geometries=geojson`;



        // 2. Spustíme všechny 3 požadavky najednou (paralelně) pro maximální rychlost
        const [res1, res2, res3] = await Promise.all([
          fetch(url1).then(res => res.json()),
          fetch(url2).then(res => res.json()),
          fetch(url3).then(res => res.json())
        ]);

        const permanentRoutes: RouteData[] = [];

        // Helper pro bezpečné vytažení první nalezené trasy z každého požadavku
        const parseRoute = (data: any) => {
          if (data.routes?.length > 0) {
            const r = data.routes[0];
            return {
              coordinates: r.geometry.coordinates,
              duration: r.duration,
              distance: r.distance,
            };
          }
          return null;
        };

        // Postupně vytáhneme geometrie pro trasu 1, 2 a 3
        const r1 = parseRoute(res1);
        const r2 = parseRoute(res2);
        const r3 = parseRoute(res3);

        if (r1) permanentRoutes.push(r1);
        if (r2) permanentRoutes.push(r2);
        if (r3) permanentRoutes.push(r3);

        // Uložíme všechny 3 trvalé trasy do stavu (obsadí indexy 0, 1, 2)
        setRoutes(permanentRoutes);
      } catch (error) {
        console.error("Failed to fetch routes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoutes();
  }, []);

  // Sort routes: non-selected first, selected last (renders on top)
  const sortedRoutes = routes
    .map((route, index) => ({ route, index }))
    .sort((a, b) => {
      if (a.index === selectedIndex) return 1;
      if (b.index === selectedIndex) return -1;
      return 0;
    });


  // 2. Dynamické naplánování trasy z polohy uživatele
  async function naplanujTrasuZ(userLng?: number, userLat?: number) {
    setIsLoading(true);
    try {

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${kruhac.lng},${kruhac.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=true`
      );
      const data = await response.json();
      if (data.routes?.length > 0) {
            const newRoutes: RouteData[] = data.routes.map(
              (route: {
                geometry: { coordinates: [number, number][] };
                duration: number;
                distance: number;
              }) => ({
                coordinates: route.geometry.coordinates,
                duration: route.duration,
                distance: route.distance,
              })
            );
            // ZMĚNA ZDE: Vezmeme stávající trasy a přidáme k nim ty nově načtené
            setRoutes((prevRoutes) => {
              // OPRAVA: Ponecháme VŠECHNY 3 trvalé trasy (index 0, 1, 2)
              const permanentRoutes = prevRoutes.slice(0, 3);
              // Přidáme novou trasu od uživatele na konec (bude to index 3)
              return [...permanentRoutes, ...newRoutes];
            });

            // Volitelně: Automaticky přepnout aktivní index na nově přidanou trasu
            setSelectedIndex(3); 
          }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }


  // Výchozí nastavení mapy (např. střed Brno)
  const [centerC, setCenter] = useState({ lat: 50.119, lng: 15.089 });
  const [zoomC, setZoom] = useState(11.8);

  function MarkerCenteringButton({ 
    lat, 
    lng, 
    zoom = zoomC, 
    children 
  }: { 
    lat: number; 
    lng: number; 
    zoom?: number; 
    children: React.ReactNode; 
  }) {
    const { map, isLoaded } = useMap();

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Zabrání bublání události do mapy pod markerem
      
      if (map && isLoaded) {
        map.flyTo({
          center: [lng, lat], // Mapbox/MapLibre bere souřadnice jako [LNG, LAT]
          zoom: zoom,
          essential: true,
          duration: 1200 // Délka animace v milisekundách
        });
      }
    };
    return (
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
    );
  }



  return (
    <div className="h-[500px] w-full relative">
      <Map center={centerC} zoom={zoomC} theme="light">
        <MapControls
          position="top-right"
          showZoom
          showCompass
          showLocate
          showFullscreen
          className="right-6"
          onLocate={(coords) => {
            console.log("Uživatel lokalizován na:", coords);
            naplanujTrasuZ(coords.longitude, coords.latitude);
          }}
        />

        
        <MapController />
        {/* PODSVÍCENÍ RESORTU (Polygon o 11 bodech umístěný do ČR poblíž vašeho středu mapy) */}
        <ResortPolygon />


        {sortedRoutes.map(({ route, index }) => {
          const isSelected = index === selectedIndex;
          // 1. Definice barev pro trvalé trasy vs. trasu od uživatele
            let routeColor = "#94a3b8"; // Výchozí šedá pro neaktivní trvalé trasy

            // 2. Definice proměnné pro šrafování (výchozí je undefined = plná čára)
            let routeDashArray: [number, number] | undefined = undefined;
            routeDashArray = [10,0];
            
            // Větvení barev pomocí switch/case podle indexu trasy
            switch (index) {
              case 0:
                // Základ
                routeColor = "#99e3fe"; // Původní fialová / šedá
                break;
              case 1:
                // BETY
                routeColor = accentColor; // Původní fialová / šedá
                routeDashArray = [1, 2];
                break;
              case 2:
                // KUBA
                routeColor = primaryColor ; // Původní fialová / šedá
                routeDashArray = [1, 2];
                break;

              case 3:
                // Nová trasa od uživatele přes kruháč
                routeColor = "#3b82f6"; // Výrazná modrá
                break;

              default:
                routeColor = routeColor;
                break;
            }


          return (
            <MapRoute
              key={index}
              coordinates={route.coordinates}
              color={routeColor}
              width={isSelected ? 6 : 5}
              opacity={(routes.length - 1) < 3 ? 1 : index === 3 ? 1 : 0.6}
              dashArray={routeDashArray}
              onClick={() => setSelectedIndex(index)}
            />
          );
        })}

        {/* 1. ZBOURANÝ MOST NAD ŽELEZNICÍ (ZJEMNĚNÝ) */}
        <MapMarker longitude={most.lng} latitude={most.lat}>
        <MarkerContent>
          <MarkerCenteringButton lat={obrad.lat} lng={obrad.lng} zoom={14}>
              <div className="group relative flex flex-col items-center">
              
              {/* Zjemněný, poloprůhledný puntík, který se plně rozjasní až při hoveru */}
              <div className="flex items-center justify-center size-13 rounded-full bg-rose-900/80 border-2 border-white/90 shadow-sm text-white opacity-75 transition-all group-hover:opacity-100 group-hover:scale-110 cursor-pointer">
                  <FaBridgeCircleXmark style={{ scale:'3' }} />
              </div>

              <div className="block md:hidden md:group-hover:block absolute top-full -mt-1 z-50 pointer-events-none">
                  <MarkerLabel 
                  position="bottom" 
                  className="text-sm font-semibold bg-rose-900/80 text-white px-2 py-0.5 rounded shadow-lg border border-white whitespace-nowrap"
                  >
                  {most.name}
                  </MarkerLabel>
              </div>

              </div>
           </MarkerCenteringButton>
        </MarkerContent>
        </MapMarker>


        {/* 2. PARKOVIŠTĚ (Značka FaParking přímo na mapě bez dalšího kruhu) */}
        <MapMarker longitude={parkoviste.lng} latitude={parkoviste.lat}>
        <MarkerContent>
          <MarkerCenteringButton lat={obrad.lat} lng={obrad.lng} zoom={14}>
              <div className="group relative flex flex-col items-center">
              
              {/* Čistá ikona značky s efektem zvětšení a stínem pro perfektní čitelnost */}
              <div className="text-blue-600 transition-transform group-hover:scale-110 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  <FaParking className="size-8 text-[#1a73e8] bg-white rounded-md border border-white" />
              </div>

              <div className="block md:hidden md:group-hover:block absolute top-full z-50 pointer-events-none">
                  <MarkerLabel 
                  position="bottom" 
                  className="text-sm font-semibold bg-[#1a73e8] text-white px-2 py-0.5 rounded shadow-lg border border-white whitespace-nowrap"
                  >
                  {parkoviste.name}
                  </MarkerLabel>
              </div>

              </div>
            </MarkerCenteringButton>
        </MarkerContent>
        </MapMarker>





        {/* 3. SVATEBNÍ HOSTINA (Nová ikona: Font Awesome - FaGlassCheers) */}
        <MapMarker longitude={hostina.lng} latitude={hostina.lat}>
        <MarkerContent>
          <MarkerCenteringButton lat={obrad.lat} lng={obrad.lng} zoom={14}>
              <div className="group relative flex flex-col items-center">
              
              <div className="flex items-center justify-center size-12 rounded-full bg-accent border-2 border-white shadow-md text-white transition-transform group-hover:scale-110 cursor-pointer">
                  <PiCheers className="size-10" />
              </div>

              <div className="block md:hidden md:group-hover:block absolute top-full z-50 pointer-events-none">
                  <MarkerLabel 
                  position="bottom" 
                  className="text-sm font-semibold bg-accent text-white px-2 py-0.5 rounded shadow-lg border border-white whitespace-nowrap"
                  >
                  {hostina.name}
                  </MarkerLabel>
              </div>

              </div>
            </MarkerCenteringButton>
        </MarkerContent>
        </MapMarker>


        {/* 4. SVATEBNÍ OBŘAD VENKU */}
        <MapMarker longitude={obrad.lng} latitude={obrad.lat}>
        <MarkerContent>
           <MarkerCenteringButton lat={obrad.lat} lng={obrad.lng} zoom={14}>
              <div className="group relative flex flex-col items-center">
              
              {/* Sytě fuchsiový kruh o velikosti size-8 */}
              <div className="flex items-center justify-center size-15 rounded-full bg-primary border-2 border-white shadow-md text-white transition-transform group-hover:scale-110 cursor-pointer">
                  
                  
                  <LiaRingSolid className="absolute size-10 text-white rotate-50 translate-x-2 translate-y-0.5" />
                  <GiRing className="absolute size-10 text-white -rotate-35 -translate-x-2 -translate-y-1" />


              </div>

              <div className="block md:hidden md:group-hover:block absolute top-full z-50 pointer-events-none">
                  <MarkerLabel 
                  position="bottom" 
                  className="text-xl font-semibold bg-primary text-white px-2.5 py-1 rounded shadow-lg border border-white whitespace-nowrap"
                  >
                  {obrad.name}
                  </MarkerLabel>
              </div>

              </div>
            </MarkerCenteringButton>
        </MarkerContent>
        </MapMarker>



      </Map>

      {routes.length > 0 && (
  <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
    {routes
      // 1. Zabalíme trasu a její PŮVODNÍ index do objektu
      .map((route, index) => ({ route, index }))
      // 2. Seřadíme: aktivní index (index === selectedIndex) půjde na začátek (nahoru)
      .sort((a, b) => {
        if (a.index === selectedIndex) return -1; // -1 posune prvek nahoru
        if (b.index === selectedIndex) return 1;  // 1 posune prvek dolů
        return 0;
      })
      .filter(({ route, index }) => {
        return (index === 0)||(index===3);
      })
      // 3. Vykreslíme seřazené položky
      .map(({ route, index }) => {
        const isActive = index === selectedIndex;
        return (
          <Button
            key={index} // Původní index zajistí stabilní React klíč
            variant={isActive ? "default" : "secondary"}
            size="sm"
            //onClick={() => setSelectedIndex(index)} // Odkomentováno pro funkčnost kliku
            className="justify-start gap-3 transition-all duration-300"
          >
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span className="font-medium">
                {formatDuration(route.duration)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              <Route className="size-3" />
              {formatDistance(route.distance)}
            </div>
            
            {/* Popisek zůstane u správné trasy, protože kontrolujeme PŮVODNÍ index */}
            {index === 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Cesta z Poděbrad
              </span>
            )}
            
            {/* Volitelný popisek pro uživatelskou trasu (index 3), aby věděl, co je nahoře */}
            {index === 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Vaše trasa
              </span>
            )}
          </Button>
        );
      })}
  </div>
)}


      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}