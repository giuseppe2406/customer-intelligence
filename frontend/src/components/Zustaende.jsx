import "./Zustaende.css";

// Grauer Balken statt Kreisel: die Struktur der Seite bleibt beim Laden
// sichtbar. Wird spaeter in den Zellen der Tabellen verwendet.
export function Platzhalterbalken({ breite = "100%" }) {
  return <span className="platzhalterbalken" style={{ width: breite }} />;
}

export function LeerZustand({ text }) {
  return <p className="leer-zustand">{text}</p>;
}

export function FehlerZustand({ text, onWiederholen }) {
  return (
    <div className="fehler-zustand">
      <p className="fehler-text">{text}</p>
      <button
        type="button"
        className="schaltflaeche-sekundaer"
        onClick={onWiederholen}
      >
        Erneut versuchen
      </button>
    </div>
  );
}
