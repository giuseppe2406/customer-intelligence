import { useEffect, useState } from "react";
import { apiGet } from "./client";

// Liefert die drei Zustaende aus DESIGN.md, damit jede Seite sie gleich
// behandelt: laedt, Fehler (mit neuLaden zum Wiederholen), sonst Daten -
// wobei eine leere Liste der Leerzustand ist.
export function useApi(pfad) {
  // Das Ergebnis merkt sich, zu welchem Pfad es gehoert. Daraus laesst sich
  // "laedt" ableiten, statt es als eigenen Zustand zu fuehren: sonst bliebe
  // beim Wechsel des Pfads die Liste des alten Pfads stehen, statt den
  // Ladezustand zu zeigen.
  const [ergebnis, setErgebnis] = useState({
    pfad: null,
    daten: null,
    fehler: false,
    status: null,
  });
  const [versuch, setVersuch] = useState(0);

  useEffect(() => {
    let aktuell = true;

    apiGet(pfad)
      .then((daten) => {
        if (aktuell) {
          setErgebnis({ pfad, daten, fehler: false, status: null });
        }
      })
      .catch((fehler) => {
        if (aktuell) {
          setErgebnis({ pfad, daten: null, fehler: true, status: fehler.status ?? null });
        }
      });

    // Verhindert, dass die spaet eintreffende Antwort einer alten Anfrage die
    // Anzeige ueberschreibt, wenn der Pfad inzwischen gewechselt hat.
    return () => {
      aktuell = false;
    };
  }, [pfad, versuch]);

  function neuLaden() {
    setErgebnis({ pfad: null, daten: null, fehler: false, status: null });
    // Hochzaehlen loest den Effekt erneut aus, auch wenn der Pfad gleich bleibt.
    setVersuch((vorher) => vorher + 1);
  }

  return {
    daten: ergebnis.daten,
    laedt: ergebnis.pfad !== pfad,
    fehler: ergebnis.fehler,
    // HTTP-Status des Fehlers, damit die Kundenakte einen unbekannten Kunden
    // erkennen kann statt nur "irgendetwas ging schief".
    status: ergebnis.status,
    neuLaden,
  };
}
