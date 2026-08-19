package de.bivona.customer_intelligence.model;

import java.util.List;

// Eine Seite der Kundenliste. treffer ist die Gesamtzahl ueber alle Seiten,
// die Blaetterung im Frontend braucht sie fuer "Seite x von y".
public record KundenSeite(
        List<KundenZeile> inhalt,
        long treffer,
        int seite,
        int seitengroesse
) {
}
