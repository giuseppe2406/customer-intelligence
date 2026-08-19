package de.bivona.customer_intelligence.model;

import java.math.BigDecimal;

// Reine Ausgabe-Struktur fuer GET /api/action-list, kombiniert Daten aus
// Customer, ChurnPrediction und der Interaction-Anzahl - passt zu keiner
// einzelnen Entity, deshalb ein eigener (unveraenderlicher) record.
public record ActionListEntry(
        Customer customer,
        double churnProbability,
        RiskLevel riskLevel,
        BigDecimal revenueAtRisk,
        long interactionCount
) {
}
