import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../api/client";
import { useAuth } from "../auth/useAuth";
import "./LoginPage.css";

function LoginPage() {
  const [benutzername, setBenutzername] = useState("");
  const [passwort, setPasswort] = useState("");
  const [meldung, setMeldung] = useState("");
  const [sendet, setSendet] = useState(false);
  const { anmelden } = useAuth();
  const navigate = useNavigate();

  async function handleAbsenden(ereignis) {
    ereignis.preventDefault();
    setSendet(true);
    setMeldung("");

    try {
      const token = await apiLogin(benutzername, passwort);
      if (token === null) {
        setMeldung("Benutzername oder Passwort ist falsch.");
        setSendet(false);
        return;
      }
      anmelden(token, benutzername);
      navigate("/arbeitsliste", { replace: true });
    } catch {
      setMeldung("Die Anwendung ist nicht erreichbar. Bitte später erneut versuchen.");
      setSendet(false);
    }
  }

  return (
    <div className="anmeldung">
      <div className="anmeldung-projekt">Customer Intelligence</div>
      <h1 className="anmeldung-titel">Anmelden</h1>

      <form className="anmeldung-formular" onSubmit={handleAbsenden}>
        <label className="feld">
          <span className="feld-beschriftung">Benutzername</span>
          <input
            className="feld-eingabe"
            type="text"
            autoComplete="username"
            value={benutzername}
            onChange={(e) => setBenutzername(e.target.value)}
          />
        </label>

        <label className="feld">
          <span className="feld-beschriftung">Passwort</span>
          <input
            className="feld-eingabe"
            type="password"
            autoComplete="current-password"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
          />
        </label>

        {/* role="alert" laesst Vorleseprogramme die Meldung sofort ansagen */}
        {meldung && (
          <p className="anmeldung-meldung" role="alert">
            {meldung}
          </p>
        )}

        <button type="submit" className="schaltflaeche-primaer" disabled={sendet}>
          {sendet ? "Wird geprüft …" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
