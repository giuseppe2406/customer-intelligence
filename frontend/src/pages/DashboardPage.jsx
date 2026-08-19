import { useApi } from "../api/useApi";
import Balkendiagramm from "../components/Balkendiagramm";
import {
  FehlerZustand,
  LeerZustand,
  Platzhalterbalken,
} from "../components/Zustaende";
import {
  formatBetrag,
  formatProzentGenau,
  formatRisikostufe,
  formatVertragsart,
  formatZahl,
  formatZahlungsart,
} from "../utils/format";
import "./DashboardPage.css";

// Reihenfolge und Beschriftungen wie im Beispiel in DESIGN.md.
const KENNZAHLEN = [
  {
    beschriftung: "Abwanderungsrate",
    lies: (d) => formatProzentGenau(d.abwanderungsrate),
  },
  {
    beschriftung: "Umsatz im Risiko",
    risiko: true,
    lies: (d) => formatBetrag(d.hohesRisikoUmsatz),
  },
  {
    beschriftung: "Hohes Risiko",
    lies: (d) => formatZahl(d.hohesRisikoAnzahl),
  },
  {
    beschriftung: "Kunden",
    lies: (d) => formatZahl(d.kundenGesamt),
  },
];

const RISIKO_FARBE = { HIGH: "hoch", MEDIUM: "mittel", LOW: "niedrig" };

function DashboardPage() {
  const stats = useApi("/api/dashboard/stats");

  if (stats.fehler) {
    return (
      <FehlerZustand
        text="Das Dashboard konnte nicht geladen werden."
        onWiederholen={stats.neuLaden}
      />
    );
  }

  if (!stats.laedt && stats.daten.kundenGesamt === 0) {
    return (
      <LeerZustand text="Es sind noch keine Kunden gespeichert. Führe den CSV-Import aus, damit hier Zahlen erscheinen." />
    );
  }

  const daten = stats.daten;

  return (
    <>
      <div className="kennzahlen">
        {KENNZAHLEN.map((kennzahl) => (
          <div key={kennzahl.beschriftung} className="kennzahl">
            <span className="kennzahl-beschriftung">
              {kennzahl.beschriftung}
            </span>
            {/* Farbig nur dort, wo die Farbe eine Aussage traegt. */}
            <span
              className={
                kennzahl.risiko
                  ? "kennzahl-wert kennzahl-risiko"
                  : "kennzahl-wert"
              }
            >
              {stats.laedt ? (
                <Platzhalterbalken breite="100px" />
              ) : (
                kennzahl.lies(daten)
              )}
            </span>
          </div>
        ))}
      </div>

      <section className="diagramm-block">
        <h3 className="abschnitt-titel">Abwanderungsrate nach Vertragsart</h3>
        <Balkendiagramm
          laedt={stats.laedt}
          anzahlPlatzhalter={3}
          zeilen={
            stats.laedt
              ? []
              : rateZeilen(daten.nachVertragsart, formatVertragsart)
          }
        />
        <p className="kernaussage">
          {stats.laedt ? (
            <Platzhalterbalken breite="70%" />
          ) : (
            kernaussageRate(daten.nachVertragsart, formatVertragsart)
          )}
        </p>
      </section>

      <section className="diagramm-block">
        <h3 className="abschnitt-titel">
          Abwanderungsrate nach Zahlungsmethode
        </h3>
        <Balkendiagramm
          laedt={stats.laedt}
          anzahlPlatzhalter={4}
          zeilen={
            stats.laedt
              ? []
              : rateZeilen(daten.nachZahlungsmethode, formatZahlungsart)
          }
        />
        <p className="kernaussage">
          {stats.laedt ? (
            <Platzhalterbalken breite="70%" />
          ) : (
            kernaussageRate(daten.nachZahlungsmethode, formatZahlungsart)
          )}
        </p>
      </section>

      <section className="diagramm-block diagramm-klein">
        <h3 className="abschnitt-titel">Risikostufen der aktiven Kunden</h3>
        {!stats.laedt && daten.risikoverteilung.length === 0 ? (
          <LeerZustand text="Es liegen noch keine Abwanderungsprognosen vor. Führe analytics/predict.py aus, damit die Vorhersagen berechnet und gespeichert werden." />
        ) : (
          <>
            <Balkendiagramm
              laedt={stats.laedt}
              anzahlPlatzhalter={3}
              zeilen={stats.laedt ? [] : risikoZeilen(daten.risikoverteilung)}
            />
            <p className="kernaussage">
              {stats.laedt ? (
                <Platzhalterbalken breite="70%" />
              ) : (
                kernaussageRisiko(daten.risikoverteilung)
              )}
            </p>
          </>
        )}
      </section>
    </>
  );
}

function rateZeilen(gruppen, benenne) {
  return gruppen.map((gruppe) => ({
    name: benenne(gruppe.gruppe),
    wert: gruppe.rate,
    text: formatProzentGenau(gruppe.rate),
    titel: `${formatZahl(gruppe.kunden)} Kunden`,
  }));
}

// Die Farbe traegt hier eine Bedeutung, deshalb sind die Risikofarben erlaubt.
// Der Text der Stufe steht trotzdem an jedem Balken.
function risikoZeilen(verteilung) {
  return verteilung.map((eintrag) => ({
    name: formatRisikostufe(eintrag.stufe),
    wert: eintrag.kunden,
    text: formatZahl(eintrag.kunden),
    farbe: RISIKO_FARBE[eintrag.stufe],
  }));
}

// Der Satz nennt die beiden Enden der Reihe. Weil alle Zahlen darin aus der
// Antwort stammen, kann er dem Diagramm darueber nicht widersprechen.
function kernaussageRate(gruppen, benenne) {
  const hoechste = gruppen[0];
  const niedrigste = gruppen[gruppen.length - 1];
  const zahlen = `${formatProzentGenau(hoechste.rate)} gegenüber ${formatProzentGenau(niedrigste.rate)}`;

  // Ohne Abwanderung in der schwaechsten Gruppe gaebe es keinen sinnvollen Faktor.
  if (niedrigste.rate === 0) {
    return `Bei ${benenne(hoechste.gruppe)} wandern Kunden ab, bei ${benenne(niedrigste.gruppe)} keine: ${zahlen}.`;
  }

  const faktor = Math.round(hoechste.rate / niedrigste.rate);
  return `Bei ${benenne(hoechste.gruppe)} wandern ${formatZahl(faktor)}-mal so viele Kunden ab wie bei ${benenne(niedrigste.gruppe)}: ${zahlen}.`;
}

function kernaussageRisiko(verteilung) {
  const aktive = verteilung.reduce(
    (summe, eintrag) => summe + eintrag.kunden,
    0,
  );
  const hoch = verteilung.find((eintrag) => eintrag.stufe === "HIGH");
  const hochAnzahl = hoch ? hoch.kunden : 0;

  return `${formatZahl(hochAnzahl)} von ${formatZahl(aktive)} noch aktiven Kunden stehen auf hohem Risiko, das sind ${formatProzentGenau(hochAnzahl / aktive)}.`;
}

export default DashboardPage;
