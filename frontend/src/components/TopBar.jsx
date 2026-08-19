import "./TopBar.css";

function TopBar({ titel, benutzer, onAbmelden }) {
  return (
    <header className="kopfzeile">
      <h1 className="kopfzeile-titel">{titel}</h1>
      <div className="kopfzeile-rechts">
        <span className="kopfzeile-benutzer">{benutzer}</span>
        <button type="button" className="kopfzeile-abmelden" onClick={onAbmelden}>
          Abmelden
        </button>
      </div>
    </header>
  );
}

export default TopBar;
