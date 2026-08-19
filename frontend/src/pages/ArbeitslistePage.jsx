import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../api/useApi";
import Risikoabzeichen from "../components/Risikoabzeichen";
import {
  FehlerZustand,
  LeerZustand,
  Platzhalterbalken,
} from "../components/Zustaende";
import {
  formatBetrag,
  formatProzent,
  formatVertragsart,
  formatZahl,
} from "../utils/format";
import "./ArbeitslistePage.css";

const LISTENLAENGEN = [20, 50, 100];

const SPALTEN = [
  { titel: "Kunde", zahl: false },
  { titel: "Vertragsart", zahl: false },
  { titel: "Nutzungsdauer (Monate)", zahl: true },
  { titel: "Monatsumsatz", zahl: true },
  { titel: "Abwanderungsrisiko", zahl: true },
  { titel: "Risikostufe", zahl: false },
  { titel: "Umsatzrisiko", zahl: true },
  { titel: "Interaktionen", zahl: true },
];

function ArbeitslistePage() {
  const [laenge, setLaenge] = useState(LISTENLAENGEN[0]);
  const liste = useApi(`/api/action-list?limit=${laenge}`);
  const kennzahlen = useApi("/api/action-list/kennzahlen");
  const navigate = useNavigate();

  function oeffneKunde(id) {
    navigate(`/kunden/${id}`);
  }

  function zusammenfassung() {
    if (kennzahlen.laedt) {
      return <Platzhalterbalken breite="460px" />;
    }
    if (kennzahlen.fehler) {
      return "Die Kennzahlen konnten nicht geladen werden.";
    }
    return `${formatZahl(kennzahlen.daten.highRiskCount)} noch aktive Kunden mit hohem Risiko stehen für ${formatBetrag(kennzahlen.daten.highRiskRevenue)} monatlichen Umsatz.`;
  }

  // Die drei Zustaende schliessen sich aus: entweder Fehler, oder leer,
  // oder die Tabelle (die beim Laden ihre Platzhalterbalken zeigt).
  function inhalt() {
    if (liste.fehler) {
      return (
        <FehlerZustand
          text="Die Arbeitsliste konnte nicht geladen werden."
          onWiederholen={liste.neuLaden}
        />
      );
    }

    if (!liste.laedt && liste.daten.length === 0) {
      return (
        <LeerZustand text="Es liegen noch keine Abwanderungsprognosen vor. Führe analytics/predict.py aus, damit die Vorhersagen berechnet und gespeichert werden." />
      );
    }

    return (
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
          {liste.laedt
            ? Array.from({ length: laenge }, (unbenutzt, zeile) => (
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
            : liste.daten.map((eintrag) => (
                <tr
                  key={eintrag.customer.id}
                  className="tabelle-zeile"
                  tabIndex={0}
                  onClick={() => oeffneKunde(eintrag.customer.id)}
                  onKeyDown={(ereignis) => {
                    if (ereignis.key === "Enter") {
                      oeffneKunde(eintrag.customer.id);
                    }
                  }}
                >
                  <td>{eintrag.customer.customerId}</td>
                  <td>{formatVertragsart(eintrag.customer.contract)}</td>
                  <td className="zahl">{formatZahl(eintrag.customer.tenure)}</td>
                  <td className="zahl">
                    {formatBetrag(eintrag.customer.monthlyCharges)}
                  </td>
                  <td className="zahl">
                    {formatProzent(eintrag.churnProbability)}
                  </td>
                  <td>
                    <Risikoabzeichen stufe={eintrag.riskLevel} />
                  </td>
                  <td className="zahl">{formatBetrag(eintrag.revenueAtRisk)}</td>
                  <td className="zahl">
                    {formatZahl(eintrag.interactionCount)}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    );
  }

  return (
    <>
      <div className="arbeitsliste-kopf">
        <p className="arbeitsliste-zusammenfassung">{zusammenfassung()}</p>
        <p className="arbeitsliste-hinweis">
          Absteigend nach Umsatzrisiko. Bereits abgewanderte Kunden sind
          ausgeschlossen.
        </p>
      </div>

      <div className="arbeitsliste-steuerung">
        <label className="listenlaenge">
          <span className="feld-beschriftung">Einträge</span>
          <select
            className="feld-eingabe listenlaenge-auswahl"
            value={laenge}
            onChange={(ereignis) => setLaenge(Number(ereignis.target.value))}
          >
            {LISTENLAENGEN.map((wert) => (
              <option key={wert} value={wert}>
                {wert}
              </option>
            ))}
          </select>
        </label>
      </div>

      {inhalt()}
    </>
  );
}

export default ArbeitslistePage;
