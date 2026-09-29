import {
  COUPLE_NAME_LEFT,
  COUPLE_NAME_RIGHT,
  VENUE_NAME,
  VENUE_ADDRESS,
  WEDDING_DATE_ISO,
} from "@/config";

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

function toIcsUtcStamp(date: Date): string {
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

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildWeddingIcs(): string {
  const start = toIcsLocal(WEDDING_DATE_ISO);
  const endDate = new Date(WEDDING_DATE_ISO);
  endDate.setHours(endDate.getHours() + 12);
  const end = toIcsLocal(endDate.toISOString().slice(0, 19));

  const summary = `Svatba ${COUPLE_NAME_LEFT} & ${COUPLE_NAME_RIGHT}`;
  const description =
    "Těšíme se na vás. Více informací najdete na svatebním webu.";
  const uid = `bety-kuba-2026@wedding.local`;
  const stamp = toIcsUtcStamp(new Date());

  return [
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
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/Prague:${start}`,
    `DTEND;TZID=Europe/Prague:${end}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(`${VENUE_NAME}, ${VENUE_ADDRESS}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P7D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(summary)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadWeddingIcs(): void {
  const ics = buildWeddingIcs();
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Bety-a-Kuba-29-8-2026.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
