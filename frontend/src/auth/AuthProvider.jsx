import { useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  anmeldungLoeschen,
  anmeldungSpeichern,
  benutzerLesen,
  tokenLesen,
} from "./auth";

// Stellt den Anmeldezustand bereit, damit Kopfzeile und Routenschutz ihn
// kennen, ohne ihn durch jede Komponente durchreichen zu muessen.
export function AuthProvider({ children }) {
  // Startwert aus dem sessionStorage, damit ein Neuladen der Seite die
  // Anmeldung nicht verliert.
  const [token, setToken] = useState(tokenLesen);
  const [benutzer, setBenutzer] = useState(benutzerLesen);

  function anmelden(neuesToken, neuerBenutzer) {
    anmeldungSpeichern(neuesToken, neuerBenutzer);
    setToken(neuesToken);
    setBenutzer(neuerBenutzer);
  }

  function abmelden() {
    anmeldungLoeschen();
    setToken(null);
    setBenutzer(null);
  }

  return (
    <AuthContext.Provider value={{ token, benutzer, anmelden, abmelden }}>
      {children}
    </AuthContext.Provider>
  );
}
