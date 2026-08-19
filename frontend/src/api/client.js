import { anmeldungLoeschen, tokenLesen } from "../auth/auth";

// Vite reicht nur Variablen mit dem Praefix VITE_ an den Browser weiter.
export const BASIS_URL = import.meta.env.VITE_API_BASIS_URL;

// Alle angemeldeten Aufrufe laufen hier durch: Token anhaengen und den Ablauf
// der Anmeldung an einer Stelle behandeln statt in jeder Komponente.
async function anfrage(pfad, optionen) {
  const antwort = await fetch(BASIS_URL + pfad, {
    ...optionen,
    headers: { ...optionen.headers, Authorization: `Bearer ${tokenLesen()}` },
  });

  if (antwort.status === 401) {
    anmeldungLoeschen();
    // Vollstaendiges Neuladen statt Router-Navigation: setzt nebenbei den
    // React-Zustand zurueck, damit keine Daten des alten Benutzers stehen bleiben.
    window.location.assign("/login");
    throw new Error("Anmeldung abgelaufen");
  }

  if (!antwort.ok) {
    const fehler = new Error("Anfrage fehlgeschlagen");
    // Der Status wandert mit, damit eine Seite "gibt es nicht" von
    // "geht gerade nicht" unterscheiden kann.
    fehler.status = antwort.status;
    throw fehler;
  }

  return antwort.json();
}

export function apiGet(pfad) {
  return anfrage(pfad, {});
}

export function apiPost(pfad, koerper) {
  return anfrage(pfad, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(koerper),
  });
}

// Der Login ist der einzige Aufruf ohne Token und darf die 401-Behandlung
// oben nicht benutzen: 401 heisst hier "Passwort falsch" und nicht
// "Anmeldung abgelaufen". Rueckgabe null steht fuer falsche Zugangsdaten,
// ein Fehler fuer eine nicht erreichbare Anwendung - die Login-Seite
// unterscheidet daran ihre beiden Meldungen.
export async function apiLogin(benutzername, passwort) {
  const antwort = await fetch(BASIS_URL + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: benutzername, password: passwort }),
  });

  if (antwort.status === 401) {
    return null;
  }

  if (!antwort.ok) {
    throw new Error("Anmeldung fehlgeschlagen");
  }

  const daten = await antwort.json();
  return daten.token;
}
