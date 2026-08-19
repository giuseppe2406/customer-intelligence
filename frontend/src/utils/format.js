// Deutsche Zahlenformate an einer Stelle. Intl.NumberFormat gehoert zum
// Browser, dafuer braucht es keine Bibliothek.

const BETRAG = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PROZENT = new Intl.NumberFormat("de-DE", {
  style: "percent",
  maximumFractionDigits: 0,
});

// Eine Nachkommastelle fuer das Dashboard: 2,8 % und 3,4 % sollen dort
// unterscheidbar bleiben, in den Listen genuegt die gerundete Zahl.
const PROZENT_GENAU = new Intl.NumberFormat("de-DE", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const ZAHL = new Intl.NumberFormat("de-DE");

export function formatBetrag(wert) {
  return BETRAG.format(wert);
}

// erwartet einen Anteil zwischen 0 und 1, nicht bereits multipliziert
export function formatProzent(anteil) {
  return PROZENT.format(anteil);
}

export function formatProzentGenau(anteil) {
  return PROZENT_GENAU.format(anteil);
}

export function formatZahl(wert) {
  return ZAHL.format(wert);
}

// Die Vertragsart kommt englisch aus dem Kaggle-Datensatz. Unbekannte Werte
// werden unveraendert durchgereicht, damit nichts stillschweigend verschwindet.
const VERTRAGSART = {
  "Month-to-month": "Monatlich",
  "One year": "Ein Jahr",
  "Two year": "Zwei Jahre",
};

export function formatVertragsart(wert) {
  return VERTRAGSART[wert] ?? wert;
}

const RISIKOSTUFE = {
  HIGH: "Hoch",
  MEDIUM: "Mittel",
  LOW: "Niedrig",
};

export function formatRisikostufe(stufe) {
  return RISIKOSTUFE[stufe] ?? stufe;
}

const DATUM = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDatum(wert) {
  return DATUM.format(new Date(wert));
}

const INTERAKTIONSTYP = {
  CALL: "Anruf",
  EMAIL: "E-Mail",
  MEETING: "Termin",
  NOTE: "Notiz",
};

export function formatInteraktionstyp(typ) {
  return INTERAKTIONSTYP[typ] ?? typ;
}

// Die Dienstfelder sind dreiwertig: Ja, Nein oder "gar nicht gebucht".
const DIENST = {
  Yes: "Ja",
  No: "Nein",
  "No internet service": "Kein Internetanschluss",
  "No phone service": "Kein Telefonanschluss",
  DSL: "DSL",
  "Fiber optic": "Glasfaser",
};

export function formatDienst(wert) {
  return DIENST[wert] ?? wert;
}

const ZAHLUNGSART = {
  "Electronic check": "Elektronischer Scheck",
  "Mailed check": "Scheck per Post",
  "Bank transfer (automatic)": "Bankeinzug (automatisch)",
  "Credit card (automatic)": "Kreditkarte (automatisch)",
};

export function formatZahlungsart(wert) {
  return ZAHLUNGSART[wert] ?? wert;
}

const GESCHLECHT = {
  Female: "Weiblich",
  Male: "Männlich",
};

export function formatGeschlecht(wert) {
  return GESCHLECHT[wert] ?? wert;
}

export function formatJaNein(wert) {
  if (wert === null || wert === undefined) {
    return "–";
  }
  return wert ? "Ja" : "Nein";
}
