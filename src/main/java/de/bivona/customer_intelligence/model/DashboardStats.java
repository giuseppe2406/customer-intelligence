package de.bivona.customer_intelligence.model;

import java.math.BigDecimal;
import java.util.List;

// Alle Zahlen des Dashboards in einer Antwort, damit die Seite mit einer
// einzigen Anfrage auskommt.
public record DashboardStats(
        long kundenGesamt,
        double abwanderungsrate,
        long hohesRisikoAnzahl,
        BigDecimal hohesRisikoUmsatz,
        List<Abwanderungsrate> nachVertragsart,
        List<Abwanderungsrate> nachZahlungsmethode,
        List<Risikoanteil> risikoverteilung
) {
}
