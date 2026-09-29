import {
  COUPLE_NAME_LEFT,
  COUPLE_NAME_RIGHT,
  VENUE_NAME,
  VENUE_ADDRESS,
  WEDDING_DATE_ISO,
} from "@/config";
import { Button } from "@/components/ui/button";
import { CalendarArrowDown } from "lucide-react";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toIcsLocal(dateIso: string): string {
  const d = new Date(dateIso);
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function toGoogleUtcStamp(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export default function CalendarButtons() {
  const startDate = new Date(WEDDING_DATE_ISO);
  const endDate = new Date(startDate);
    endDate.setHours(23, 59, 0, 0);


  const webUrl = "https://www.pernicci.cz/";

  const googleDates = `${toGoogleUtcStamp(startDate)}/${toGoogleUtcStamp(endDate)}`;
  const title = `Svatba ${COUPLE_NAME_LEFT} & ${COUPLE_NAME_RIGHT}`;
  const titleDWNL = `Svatba_${COUPLE_NAME_LEFT}&${COUPLE_NAME_RIGHT}`;
  
  // ZMĚNA: Popis upraven na HTML klikatelný odkaz pro Google Kalendář
  const googleDetails = `Těšíme se na vás. Více informací najdete na našem Svatebním webu: <a href="${webUrl}">${webUrl}</a>`;
  // Pro ICS soubor ponecháme čistý text (Apple/Outlook HTML tagy v popisu nativně nepodporují)
  const icsDetails = `Těšíme se na vás. Více informací najdete na svatebním webu: ${webUrl}`;
  
  const locationText = `${VENUE_NAME}, ${VENUE_ADDRESS}`;

  // Bezpečné složení URL cesty s HTML obsahem
  const googlePath = `/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${encodeURIComponent(googleDates)}` +
    `&details=${encodeURIComponent(googleDetails)}` +
    `&location=${encodeURIComponent(locationText)}`;

  const handleDownloadIcs = () => {
    const start = toIcsLocal(WEDDING_DATE_ISO);
    const end = toIcsLocal(endDate.toISOString().slice(0, 19));

    const summary = escapeIcsText(title);
    const description = escapeIcsText(icsDetails);
    const location = escapeIcsText(locationText);
    const uid = `bety-kuba-2026@wedding.local`;
    const stamp = toGoogleUtcStamp(new Date());

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Bety & Kuba//Wedding//CS",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VTIMEZONE",
      "TZID:Europe/Prague",
      "BEGIN:STANDARD",
      "DTSTART:19701025T030000",
      "TZOFFSETFROM:+0200",
      "TZOFFSETTO:+0100",
      "TZNAME:CET",
      "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
      "END:STANDARD",
      "BEGIN:DAYLIGHT",
      "DTSTART:19700329T020000",
      "TZOFFSETFROM:+0100",
      "TZOFFSETTO:+0200",
      "TZNAME:CEST",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
      "END:DAYLIGHT",
      "END:VTIMEZONE",
      "BEGIN:VEVENT",
      `DTSTAMP:${stamp}`,
      `UID:${uid}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ];

    const icsContent = lines.join("\r\n");
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = titleDWNL+".ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2 ml-3">
      {/* Google Kalendář */}
      <Button
        asChild
        size="icon"
        variant="ghost"
        className="group/btn cursor-pointer h-15 w-15 rounded-full bg-white border-0 shadow-md transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95 flex items-center justify-center"
      >
        <a href={`https://www.google.com${googlePath}`} target="_blank" rel="noopener noreferrer" title="Google Kalendář">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ width: '26px', height: '26px' }}
            className="text-stone-950 transition-transform duration-300 ease-in-out group-hover/btn:rotate-6 group-hover/btn:text-primary relative"
          >
            {/* Vnější obrys kalendáře odpovídající Lucide ikonám */}
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
            
            {/* Vnitřní barevné Google "G" minilogo vycentrované uprostřed kalendáře */}
            <g transform="translate(8.5, 11.5) scale(0.3) " strokeWidth="0" fill="currentColor">
              <path fill="#4285F4" d="M21.4 12.3c0-.7-.1-1.4-.2-2H12v3.9h5.3c-.2 1.2-.9 2.2-2 2.9v2.4h3.2c1.9-1.7 3-4.3 3-7.2z"/>
              <path fill="#34A853" d="M12 21.9c2.7 0 4.9-.9 6.5-2.4l-3.2-2.4c-.9.6-2 .9-3.3.9-2.6 0-4.7-1.7-5.5-4H1.2v2.5c1.7 3.4 5.2 5.4 8.8 5.4z"/>
              <path fill="#FBBC05" d="M6.5 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.5H1.2C.4 9.1 0 10.5 0 12s.4 2.9 1.2 4.5l5.3-2.5z"/>
              <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.4l2.9-2.9C16.9 2.8 14.7 2 12 2 8.4 2 4.9 4 3.2 7.5l5.3 4.1c.8-2.3 2.9-5.7 3.5-5.7z"/>
            </g>
          </svg>
        </a>
      </Button>

      {/* Apple / Outlook */}
      <Button
        size="icon"
        variant="ghost"
        onClick={handleDownloadIcs}
        className="group/btn cursor-pointer h-15 w-15 rounded-full bg-white border-0 shadow-md transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95 flex items-center justify-center"
        title="Uložit do zařízení (.ics)"
      >
        <CalendarArrowDown 
          strokeWidth={2} 
          style={{ width: '26px', height: '26px' }} 
          className="text-stone-950 transition-transform duration-300 ease-in-out group-hover/btn:rotate-6 group-hover/btn:text-primary" 
        />
      </Button>
    </div>
  );
}
