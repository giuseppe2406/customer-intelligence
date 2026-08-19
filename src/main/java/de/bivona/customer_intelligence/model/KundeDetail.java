package de.bivona.customer_intelligence.model;

import java.math.BigDecimal;

// Alles, was die Kundenakte im Kopfbereich braucht: Stammdaten, aktuelle
// Vorhersage und wie viele Interaktionen es gibt. Aufgebaut wie
// ActionListEntry, nur sind die Risikofelder hier null-faehig - ein Kunde
// ohne Vorhersage soll trotzdem anzeigbar sein.
public record KundeDetail(
        Customer customer,
        Double churnProbability,
        RiskLevel riskLevel,
        BigDecimal revenueAtRisk,
        long interactionCount
) {
}
