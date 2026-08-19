import { createContext } from "react";

// Eigene Datei, weil eine Datei entweder Komponenten oder normale Werte
// exportieren sollte - sonst funktioniert der Hot-Reload von Vite nicht sauber.
export const AuthContext = createContext(null);
