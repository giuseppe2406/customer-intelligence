// Token und Benutzername liegen im sessionStorage: beim Schliessen des Tabs
// ist die Anmeldung weg. Der Kompromiss steht in der Lernnotiz.
const TOKEN_SCHLUESSEL = "ci_token";
const BENUTZER_SCHLUESSEL = "ci_benutzer";

export function tokenLesen() {
  return sessionStorage.getItem(TOKEN_SCHLUESSEL);
}

export function benutzerLesen() {
  return sessionStorage.getItem(BENUTZER_SCHLUESSEL);
}

export function anmeldungSpeichern(token, benutzer) {
  sessionStorage.setItem(TOKEN_SCHLUESSEL, token);
  sessionStorage.setItem(BENUTZER_SCHLUESSEL, benutzer);
}

export function anmeldungLoeschen() {
  sessionStorage.removeItem(TOKEN_SCHLUESSEL);
  sessionStorage.removeItem(BENUTZER_SCHLUESSEL);
}
