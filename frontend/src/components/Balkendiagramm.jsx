import { Platzhalterbalken } from "./Zustaende";
import "./Balkendiagramm.css";

// Der laengste Balken fuellt 85% der Spur. Der Rest bleibt fuer den Wert, der
// direkt am Balkenende steht.
const MAX_ANTEIL = 85;

// Waagerechte Balken, eine Reihe, eine Skala. Jede Zeile braucht name (die
// Achsenbeschriftung), wert (die Zahl, nach der skaliert wird) und text (die
// fertig formatierte Ausgabe am Balkenende). farbe ist optional und nur fuer
// die Risikostufen gesetzt, sonst gilt die Akzentfarbe.
function Balkendiagramm({ zeilen, laedt, anzahlPlatzhalter }) {
  if (laedt) {
    return (
      <div className="diagramm">
        {Array.from({ length: anzahlPlatzhalter }, (unbenutzt, zeile) => (
          <div key={zeile} className="balken-zeile">
            <span className="balken-name">
              <Platzhalterbalken breite="70%" />
            </span>
            <span className="balken-spur">
              <Platzhalterbalken breite="55%" />
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Ohne das Oder waeren alle Balken NaN breit, falls jeder Wert 0 ist.
  const groesster = Math.max(...zeilen.map((zeile) => zeile.wert)) || 1;

  return (
    <div className="diagramm">
      {zeilen.map((zeile) => (
        <div key={zeile.name} className="balken-zeile">
          <span className="balken-name">{zeile.name}</span>
          <span className="balken-spur" title={zeile.titel}>
            <span
              className={
                zeile.farbe ? `balken balken-${zeile.farbe}` : "balken"
              }
              style={{ width: `${(zeile.wert / groesster) * MAX_ANTEIL}%` }}
            />
            <span className="balken-wert">{zeile.text}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default Balkendiagramm;
