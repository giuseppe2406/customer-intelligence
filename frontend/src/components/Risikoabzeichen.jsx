import { formatRisikostufe } from "../utils/format";
import "./Risikoabzeichen.css";

// Farbe steht nie allein: das Abzeichen zeigt immer auch den Text der Stufe.
function Risikoabzeichen({ stufe }) {
  return (
    <span className={`risikoabzeichen stufe-${stufe.toLowerCase()}`}>
      {formatRisikostufe(stufe)}
    </span>
  );
}

export default Risikoabzeichen;
