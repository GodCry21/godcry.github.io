# Wedding Website

This is a Vite + React application for a wedding website with two integrations to a single Google Apps Script Web App:

- **RSVP form** — multi-guest form that writes one row per person to the `RSVP` sheet, and on page load reads existing rows to detect which guests have *Platíme my* set (free accommodation).
- **Gifts page** — loads the list of *unreserved* gifts on page load, then writes new reservations to the `Gifts` sheet (and marks the row as reserved).

## Setup Google Apps Script

1) Create a new Google Sheet with two tabs:
   - **RSVP** with header row (česky): `Čas vyplnění | Jméno | E-mail | Účast | Preferované ubytování | Hudební přání | Vzkaz | Platíme my`
   - **Gifts** with header row (česky): `Čas vyplnění | dar | rezervováno | jméno | email | vzkaz`

   In the `RSVP` tab, you can **pre-fill rows** for guests whose accommodation you'll cover. Put `Jméno Příjmení` into column **B** and `ANO` into column **H** (`Platíme my`). When that guest opens the form and types their name, all accommodation prices show as *Zdarma*. When they submit, the script updates that same row instead of appending a new one (the *Platíme my* value is preserved). Guests not pre-filled are simply appended as new rows.

   In the `Gifts` tab, fill column `dar` (column **B**) with the names of all the gifts you want to offer (one per row). Leave the other columns empty — the script fills `Čas vyplnění` and the rest when a guest reserves a gift. To "unreserve" a gift, just clear columns A and C–F for that row.

   Tip: the gift names in the sheet should match the names in `src/pages/Gifts.tsx` (the `GIFTS` catalog) so they render with the correct image, price and note. Names that exist in the sheet but not in the catalog are still shown with a generic card.

2) In the sheet, go to **Extensions → Apps Script**, paste the script below, and **Deploy as Web App** (Execute as: *Me*, Who has access: *Anyone*). Copy the deployment URL.

3) Set `VITE_GAS_ENDPOINT` to that URL in the Replit environment, then restart the dev server.

### Apps Script Template

```javascript
function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Gifts: list of unreserved gift names
    let available = [];
    const gs = ss.getSheetByName("Gifts");
    if (gs && gs.getLastRow() >= 2) {
      // columns: A=Čas vyplnění, B=dar, C=rezervováno, D=jméno, E=email, F=vzkaz
      const data = gs.getRange(2, 2, gs.getLastRow() - 1, 2).getValues();
      available = data
        .filter(function (r) { return r[0] && !isReserved(r[1]); })
        .map(function (r) { return String(r[0]).trim(); });
    }

    // RSVP: list of guests with "Platíme my" flag
    let guests = [];
    const rs = ss.getSheetByName("RSVP");
    if (rs && rs.getLastRow() >= 2) {
      // columns: A=Čas, B=Jméno, C=E-mail, D=Účast, E=Ubytování, F=Hudba, G=Vzkaz, H=Platíme my
      const data = rs.getRange(2, 2, rs.getLastRow() - 1, 7).getValues();
      guests = data
        .filter(function (r) { return r[0]; })
        .map(function (r) {
          return { jmeno: String(r[0]).trim(), platimemy: isReserved(r[6]) };
        });
    }

    return json({ ok: true, available: available, guests: guests });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ts = new Date();

    if (body.type === "rsvp") {
      const s = ss.getSheetByName("RSVP") || ss.insertSheet("RSVP");
      if (s.getLastRow() === 0) {
        s.appendRow([
          "Čas vyplnění",
          "Jméno",
          "E-mail",
          "Účast",
          "Preferované ubytování",
          "Hudební přání",
          "Vzkaz",
          "Platíme my",
        ]);
      }
      const p = body.payload || {};
      const persons = Array.isArray(p.persons) ? p.persons : [];
      const email = p.email || "";
      const song = p.song || "";
      const message = p.message || "";

      // Snapshot existing names (column B) for matching
      const lastRow = s.getLastRow();
      const existingNames = lastRow >= 2
        ? s.getRange(2, 2, lastRow - 1, 1).getValues().map(function (r) {
            return String(r[0] == null ? "" : r[0]).trim().toLowerCase().replace(/\s+/g, " ");
          })
        : [];

      persons.forEach(function (person, idx) {
        const fullName = ((person.jmeno || "") + " " + (person.prijmeni || "")).trim();
        const accommodation = person.ubytovani
          ? person.ubytovani + (person.pujcitStan ? " (potřebuje půjčit)" : "")
          : "";
        const personSong = idx === 0 ? song : "";
        const personMessage = idx === 0 ? message : "";

        const key = fullName.toLowerCase().replace(/\s+/g, " ");
        const matchIdx = key ? existingNames.indexOf(key) : -1;

        if (matchIdx >= 0) {
          // Update existing row, preserve B (Jméno) and H (Platíme my)
          const rowNum = matchIdx + 2;
          s.getRange(rowNum, 1).setValue(ts);
          s.getRange(rowNum, 3, 1, 5).setValues([[
            email,
            person.attendance,
            accommodation,
            personSong,
            personMessage,
          ]]);
        } else {
          s.appendRow([
            ts,
            fullName,
            email,
            person.attendance,
            accommodation,
            personSong,
            personMessage,
            "",
          ]);
        }
      });

      return json({ ok: true });
    }

    if (body.type === "gift") {
      const s = ss.getSheetByName("Gifts") || ss.insertSheet("Gifts");
      if (s.getLastRow() === 0) {
        s.appendRow(["Čas vyplnění", "dar", "rezervováno", "jméno", "email", "vzkaz"]);
      }
      const p = body.payload || {};
      const wanted = String(p.selectedGift || "").trim();
      if (!wanted) return json({ ok: false, error: "Chybí vybraný dar" });

      const lastRow = s.getLastRow();
      let rowIdx = -1;
      if (lastRow >= 2) {
        // columns: A=Čas vyplnění, B=dar, C=rezervováno, D=jméno, E=email, F=vzkaz
        const data = s.getRange(2, 2, lastRow - 1, 2).getValues();
        for (let i = 0; i < data.length; i++) {
          if (String(data[i][0]).trim() === wanted && !isReserved(data[i][1])) {
            rowIdx = i + 2;
            break;
          }
        }
      }
      if (rowIdx === -1) {
        return json({ ok: false, error: "Tento dar je již rezervován nebo neexistuje" });
      }
      // write timestamp into column A and reservation details into columns C–F
      s.getRange(rowIdx, 1).setValue(ts);
      s.getRange(rowIdx, 3, 1, 4).setValues([["ANO", p.name, p.email, p.message || ""]]);
      return json({ ok: true });
    }

    throw new Error("Unknown type");
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function isReserved(v) {
  if (v === true) return true;
  const s = String(v == null ? "" : v).trim().toLowerCase();
  return s === "ano" || s === "yes" || s === "true" || s === "1" || s === "x";
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

After every change to the script, **redeploy** the Web App (or use *Manage deployments → New version*) — otherwise the changes won't be live.
