import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApi } from "../api/useApi";
import Risikoabzeichen from "../components/Risikoabzeichen";
import {
  FehlerZustand,
  LeerZustand,
  Platzhalterbalken,
} from "../components/Zustaende";
import {
  formatBetrag,
  formatRisikostufe,
  formatVertragsart,
  formatZahl,
} from "../utils/format";
import "./KundenPage.css";

const SEITENGROESSE = 50;
const WARTEZEIT_MS = 300;

const SPALTEN = [
  { titel: "Kundennummer", zahl: false },
  { titel: "Vertragsart", zahl: false },
  { titel: "Nutzungsdauer (Monate)", zahl: true },
  { titel: "Monatsumsatz", zahl: true },
  { titel: "Risikostufe", zahl: false },
];

const RISIKOSTUFEN = ["HIGH", "MEDIUM", "LOW"];
const VERTRAGSARTEN = ["Month-to-month", "One year", "Two year"];

function KundenPage() {
  // Die URL ist die einzige Quelle fuer Filter und Seitenzahl. Damit bleibt die
  // Seite teilbar, ueberlebt das Neuladen und der Zurueck-Knopf wirkt.
  const [suchParams, setSuchParams] = useSearchParams();
  const suche = suchParams.get("suche") ?? "";
  const stufe = suchParams.get("stufe") ?? "";
  const vertragsart = suchParams.get("vertragsart") ?? "";
  const seite = Math.max(0, Number(suchParams.get("seite")) || 0);

  const abfrage = baueAbfrage(suche, stufe, vertragsart, seite);
  const [pfad, setPfad] = useState(abfrage);
  const navigate = useNavigate();

  // Nicht die Eingabe verzoegern, sondern den Abfragepfad: beim Tippen liefe
  // sonst je Zeichen eine Anfrage.
  useEffect(() => {
    const zeitgeber = setTimeout(() => setPfad(abfrage), WARTEZEIT_MS);
    return () => clearTimeout(zeitgeber);
  }, [abfrage]);

  const kunden = useApi(pfad);
  const treffer = kunden.daten ? kunden.daten.treffer : 0;
  const seitenAnzahl = Math.max(1, Math.ceil(treffer / SEITENGROESSE));

  function aendere(name, wert, ersetzen = false) {
    const naechste = new URLSearchParams(suchParams);
    if (wert) {
      naechste.set(name, wert);
    } else {
      naechste.delete(name);
    }
    // Ein geaenderter Filter faengt wieder auf der ersten Seite an, sonst
    // landet man auf Seite 12 eines Ergebnisses mit drei Seiten.
    if (name !== "seite") {
      naechste.delete("seite");
    }
    setSuchParams(naechste, { replace: ersetzen });
  }

  function oeffneKunde(id) {
    navigate(`/kunden/${id}`);
  }

  // Die drei Zustaende schliessen sich aus: entweder Fehler, oder leer, oder
  // die Tabelle (die beim Laden ihre Platzhalterbalken zeigt).
  function inhalt() {
    if (kunden.fehler) {
      return (
        <FehlerZustand
          text="Die Kundenliste konnte nicht geladen werden."
          onWiederholen={kunden.neuLaden}
        />
      );
    }

    // Der Leerzustand ersetzt nur die Tabelle. Die Blaetterung bleibt stehen,
    // sonst gaebe es bei einer geteilten URL mit zu hoher Seitenzahl keinen
    // Weg zurueck.
    if (!kunden.laedt && kunden.daten.inhalt.length === 0) {
      return (
        <>
          <LeerZustand
            text={
              treffer === 0
                ? "Kein Kunde passt zu dieser Auswahl. Ändere den Suchbegriff oder setze einen der Filter zurück auf Alle."
                : "Diese Seite liegt hinter dem letzten Treffer. Blättere zurück."
            }
          />
          {blaetterung()}
        </>
      );
    }

    return (
      <>
        <table className="tabelle">
          <thead>
            <tr>
              {SPALTEN.map((spalte) => (
                <th
                  key={spalte.titel}
                  scope="col"
                  className={spalte.zahl ? "zahl" : undefined}
                >
                  {spalte.titel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kunden.laedt
              ? Array.from({ length: SEITENGROESSE }, (unbenutzt, zeile) => (
                  <tr key={zeile}>
                    {SPALTEN.map((spalte) => (
                      <td
                        key={spalte.titel}
                        className={spalte.zahl ? "zahl" : undefined}
                      >
                        <Platzhalterbalken breite="70%" />
                      </td>
                    ))}
                  </tr>
                ))
              : kunden.daten.inhalt.map((zeile) => (
                  <tr
                    key={zeile.id}
                    className="tabelle-zeile"
                    tabIndex={0}
                    onClick={() => oeffneKunde(zeile.id)}
                    onKeyDown={(ereignis) => {
                      if (ereignis.key === "Enter") {
                        oeffneKunde(zeile.id);
                      }
                    }}
                  >
                    <td>{zeile.customerId}</td>
                    <td>{formatVertragsart(zeile.contract)}</td>
                    <td className="zahl">{formatZahl(zeile.tenure)}</td>
                    <td className="zahl">
                      {formatBetrag(zeile.monthlyCharges)}
                    </td>
                    <td>
                      {zeile.riskLevel ? (
                        <Risikoabzeichen stufe={zeile.riskLevel} />
                      ) : (
                        <span className="ohne-wert">Keine Prognose</span>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {blaetterung()}
      </>
    );
  }

  function blaetterung() {
    return (
      <div className="blaetterung">
        <p className="blaetterung-treffer">
          {kunden.laedt ? (
            <Platzhalterbalken breite="140px" />
          ) : (
            `${formatZahl(treffer)} ${treffer === 1 ? "Kunde" : "Kunden"}`
          )}
        </p>

        <div className="blaetterung-steuerung">
          <button
            type="button"
            className="schaltflaeche-sekundaer"
            disabled={seite === 0}
            onClick={() => aendere("seite", seite - 1)}
          >
            Zurück
          </button>
          <span className="blaetterung-seite">
            Seite {formatZahl(seite + 1)} von {formatZahl(seitenAnzahl)}
          </span>
          <button
            type="button"
            className="schaltflaeche-sekundaer"
            disabled={kunden.laedt || seite + 1 >= seitenAnzahl}
            onClick={() => aendere("seite", seite + 1)}
          >
            Weiter
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="kunden-filter">
        <label className="feld kunden-filter-suche">
          <span className="feld-beschriftung">Kundennummer</span>
          <input
            className="feld-eingabe"
            type="search"
            value={suche}
            placeholder="z. B. 0002-ORFBO"
            // Beim Tippen ersetzen statt anhaengen, sonst liegt jedes Zeichen
            // als eigener Schritt im Verlauf und der Zurueck-Knopf wird unbrauchbar.
            onChange={(ereignis) =>
              aendere("suche", ereignis.target.value, true)
            }
          />
        </label>

        <label className="feld">
          <span className="feld-beschriftung">Risikostufe</span>
          <select
            className="feld-eingabe"
            value={stufe}
            onChange={(ereignis) => aendere("stufe", ereignis.target.value)}
          >
            <option value="">Alle</option>
            {RISIKOSTUFEN.map((wert) => (
              <option key={wert} value={wert}>
                {formatRisikostufe(wert)}
              </option>
            ))}
          </select>
        </label>

        <label className="feld">
          <span className="feld-beschriftung">Vertragsart</span>
          <select
            className="feld-eingabe"
            value={vertragsart}
            onChange={(ereignis) =>
              aendere("vertragsart", ereignis.target.value)
            }
          >
            <option value="">Alle</option>
            {VERTRAGSARTEN.map((wert) => (
              <option key={wert} value={wert}>
                {formatVertragsart(wert)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {inhalt()}
    </>
  );
}

// Leere Filter kommen gar nicht erst in die Anfrage, damit das Backend sie als
// "kein Filter" behandelt.
function baueAbfrage(suche, stufe, vertragsart, seite) {
  const parameter = new URLSearchParams({ page: seite, size: SEITENGROESSE });
  if (suche) {
    parameter.set("search", suche);
  }
  if (stufe) {
    parameter.set("riskLevel", stufe);
  }
  if (vertragsart) {
    parameter.set("contract", vertragsart);
  }
  return `/api/customers?${parameter}`;
}

export default KundenPage;
