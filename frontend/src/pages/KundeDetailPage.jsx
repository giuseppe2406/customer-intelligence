import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiPost } from "../api/client";
import { useApi } from "../api/useApi";
import Risikoabzeichen from "../components/Risikoabzeichen";
import {
  FehlerZustand,
  LeerZustand,
  Platzhalterbalken,
} from "../components/Zustaende";
import {
  formatBetrag,
  formatDatum,
  formatDienst,
  formatGeschlecht,
  formatInteraktionstyp,
  formatJaNein,
  formatProzent,
  formatRisikostufe,
  formatVertragsart,
  formatZahl,
  formatZahlungsart,
} from "../utils/format";
import "./KundeDetailPage.css";

const INTERAKTIONSTYPEN = ["CALL", "EMAIL", "MEETING", "NOTE"];

// Beschriftung und die Funktion, die den Wert aus dem Kunden liest. Dadurch
// steht die Struktur der Akte schon fest, bevor die Daten da sind - der
// Ladezustand kann dieselbe Liste mit Platzhalterbalken zeichnen.
const GRUPPEN = [
  {
    titel: "Vertrag",
    felder: [
      ["Vertragsart", (k) => formatVertragsart(k.contract)],
      ["Nutzungsdauer", (k) => `${formatZahl(k.tenure)} Monate`],
      ["Abgewandert", (k) => formatJaNein(k.churn)],
      ["Geschlecht", (k) => formatGeschlecht(k.gender)],
      ["Senior", (k) => formatJaNein(k.seniorCitizen)],
      ["Partner", (k) => formatJaNein(k.partner)],
      ["Angehörige", (k) => formatJaNein(k.dependents)],
    ],
  },
  {
    titel: "Dienste",
    felder: [
      ["Telefonanschluss", (k) => formatJaNein(k.phoneService)],
      ["Mehrfachleitungen", (k) => formatDienst(k.multipleLines)],
      ["Internetanschluss", (k) => formatDienst(k.internetService)],
      ["Online-Sicherheit", (k) => formatDienst(k.onlineSecurity)],
      ["Online-Backup", (k) => formatDienst(k.onlineBackup)],
      ["Geräteschutz", (k) => formatDienst(k.deviceProtection)],
      ["Technischer Support", (k) => formatDienst(k.techSupport)],
      ["Streaming TV", (k) => formatDienst(k.streamingTv)],
      ["Streaming Filme", (k) => formatDienst(k.streamingMovies)],
    ],
  },
  {
    titel: "Zahlung",
    felder: [
      ["Zahlungsart", (k) => formatZahlungsart(k.paymentMethod)],
      ["Papierlose Rechnung", (k) => formatJaNein(k.paperlessBilling)],
      ["Monatsumsatz", (k) => formatBetrag(k.monthlyCharges)],
      // Bei 11 Kunden mit Nutzungsdauer 0 steht hier 0,00 € - der CSV-Import
      // hat die leeren Felder der Quelldatei schon auf 0 gesetzt.
      ["Gesamtumsatz", (k) => formatBetrag(k.totalCharges)],
    ],
  },
];

function KundeDetailPage() {
  const { id } = useParams();
  const kunde = useApi(`/api/customers/${id}`);
  const interaktionen = useApi(`/api/customers/${id}/interactions`);

  const [typ, setTyp] = useState(INTERAKTIONSTYPEN[0]);
  const [inhalt, setInhalt] = useState("");
  const [speichert, setSpeichert] = useState(false);

  // Selbst angelegte Eintraege merken sich, zu welchem Kunden sie gehoeren.
  // Beim Wechsel gelten sie damit von selbst nicht mehr - ohne Zuruecksetzen
  // in einem Effekt, das eine zusaetzliche Renderrunde ausloesen wuerde.
  const [angelegt, setAngelegt] = useState({ id, eintraege: [], fehler: false });
  const eigene = angelegt.id === id ? angelegt : { eintraege: [], fehler: false };

  async function absenden(ereignis) {
    ereignis.preventDefault();
    setSpeichert(true);
    setAngelegt({ id, eintraege: eigene.eintraege, fehler: false });

    try {
      const gespeichert = await apiPost(`/api/customers/${id}/interactions`, {
        type: typ,
        content: inhalt.trim(),
      });
      // Die Antwort bringt Id, Zeitpunkt und Verfasser vom Server mit, die neue
      // Zeile ist also echt und nicht geraten.
      setAngelegt({
        id,
        eintraege: [gespeichert, ...eigene.eintraege],
        fehler: false,
      });
      setInhalt("");
    } catch {
      setAngelegt({ id, eintraege: eigene.eintraege, fehler: true });
    } finally {
      setSpeichert(false);
    }
  }

  if (kunde.status === 404) {
    return (
      <>
        <LeerZustand text="Diesen Kunden gibt es nicht. Vielleicht wurde er gelöscht oder der Verweis ist veraltet." />
        <p className="zurueck-verweis">
          <Link to="/kunden">Zurück zur Kundenliste</Link>
        </p>
      </>
    );
  }

  if (kunde.fehler) {
    return (
      <FehlerZustand
        text="Die Kundenakte konnte nicht geladen werden."
        onWiederholen={kunde.neuLaden}
      />
    );
  }

  const daten = kunde.daten;
  const liste = [...eigene.eintraege, ...(interaktionen.daten ?? [])];

  function verlauf() {
    if (interaktionen.fehler) {
      return (
        <FehlerZustand
          text="Die Interaktionen konnten nicht geladen werden."
          onWiederholen={interaktionen.neuLaden}
        />
      );
    }

    if (!interaktionen.laedt && liste.length === 0) {
      return (
        <LeerZustand text="Zu diesem Kunden ist noch nichts vermerkt. Lege oben die erste Interaktion an." />
      );
    }

    return (
      <table className="tabelle">
        <thead>
          <tr>
            <th scope="col">Typ</th>
            <th scope="col">Datum</th>
            <th scope="col">Verfasser</th>
            <th scope="col">Inhalt</th>
          </tr>
        </thead>
        <tbody>
          {interaktionen.laedt
            ? Array.from({ length: 3 }, (unbenutzt, zeile) => (
                <tr key={zeile}>
                  <td>
                    <Platzhalterbalken breite="70%" />
                  </td>
                  <td>
                    <Platzhalterbalken breite="70%" />
                  </td>
                  <td>
                    <Platzhalterbalken breite="70%" />
                  </td>
                  <td>
                    <Platzhalterbalken breite="90%" />
                  </td>
                </tr>
              ))
            : liste.map((eintrag) => (
                <tr key={eintrag.id}>
                  <td>{formatInteraktionstyp(eintrag.type)}</td>
                  <td className="datum">{formatDatum(eintrag.createdAt)}</td>
                  <td>{eintrag.createdBy}</td>
                  <td>{eintrag.content}</td>
                </tr>
              ))}
        </tbody>
      </table>
    );
  }

  return (
    <>
      <p className="zurueck-verweis">
        <Link to="/kunden">Zurück zur Kundenliste</Link>
      </p>

      <div className="akte-kopf">
        <h2 className="akte-nummer">
          {kunde.laedt ? (
            <Platzhalterbalken breite="120px" />
          ) : (
            daten.customer.customerId
          )}
        </h2>
        {!kunde.laedt && daten.riskLevel && (
          <Risikoabzeichen stufe={daten.riskLevel} />
        )}
      </div>

      <div className="kennzahlen">
        <div className="kennzahl">
          <span className="kennzahl-beschriftung">Abwanderung</span>
          <span className="kennzahl-wert">
            {kunde.laedt ? (
              <Platzhalterbalken breite="80px" />
            ) : (
              wertOderStrich(daten.churnProbability, formatProzent)
            )}
          </span>
        </div>
        <div className="kennzahl">
          <span className="kennzahl-beschriftung">Risikostufe</span>
          <span className="kennzahl-wert">
            {kunde.laedt ? (
              <Platzhalterbalken breite="80px" />
            ) : (
              wertOderStrich(daten.riskLevel, formatRisikostufe)
            )}
          </span>
        </div>
        <div className="kennzahl">
          <span className="kennzahl-beschriftung">Umsatzrisiko</span>
          {/* Die Farbe traegt hier eine Aussage, deshalb ist diese eine
              Kennzahl farbig und die anderen bleiben schwarz. */}
          <span className="kennzahl-wert kennzahl-risiko">
            {kunde.laedt ? (
              <Platzhalterbalken breite="80px" />
            ) : (
              wertOderStrich(daten.revenueAtRisk, formatBetrag)
            )}
          </span>
        </div>
      </div>

      <div className="stammdaten-gruppen">
        {GRUPPEN.map((gruppe) => (
          <section key={gruppe.titel} className="stammdaten-gruppe">
            <h3 className="abschnitt-titel">{gruppe.titel}</h3>
            <dl className="stammdaten">
              {gruppe.felder.map(([beschriftung, lies]) => (
                <div key={beschriftung} className="stammdaten-feld">
                  <dt className="feld-beschriftung">{beschriftung}</dt>
                  <dd className="stammdaten-wert">
                    {kunde.laedt ? (
                      <Platzhalterbalken breite="60%" />
                    ) : (
                      lies(daten.customer)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="interaktionen">
        <h3 className="abschnitt-titel">
          Interaktionen
          {!kunde.laedt &&
            ` (${formatZahl(daten.interactionCount + eigene.eintraege.length)})`}
        </h3>

        <form className="interaktion-formular" onSubmit={absenden}>
          <label className="feld">
            <span className="feld-beschriftung">Typ</span>
            <select
              className="feld-eingabe interaktion-typ"
              value={typ}
              onChange={(ereignis) => setTyp(ereignis.target.value)}
            >
              {INTERAKTIONSTYPEN.map((wert) => (
                <option key={wert} value={wert}>
                  {formatInteraktionstyp(wert)}
                </option>
              ))}
            </select>
          </label>

          <label className="feld interaktion-inhalt">
            <span className="feld-beschriftung">Inhalt</span>
            <textarea
              className="feld-eingabe interaktion-textfeld"
              rows={3}
              value={inhalt}
              onChange={(ereignis) => setInhalt(ereignis.target.value)}
            />
          </label>

          <button
            type="submit"
            className="schaltflaeche-primaer"
            disabled={speichert || inhalt.trim() === ""}
          >
            {speichert ? "Speichert" : "Interaktion anlegen"}
          </button>
        </form>

        {eigene.fehler && (
          <p className="interaktion-fehler">
            Die Interaktion konnte nicht gespeichert werden. Versuche es noch
            einmal.
          </p>
        )}

        {verlauf()}
      </section>
    </>
  );
}

// Ohne Vorhersage bleiben die Risikofelder leer; ein Strich sagt das deutlicher
// als eine 0.
function wertOderStrich(wert, formatiere) {
  if (wert === null || wert === undefined) {
    return "–";
  }
  return formatiere(wert);
}

export default KundeDetailPage;
