package de.bivona.customer_intelligence.model;

import java.math.BigDecimal;

// Eine Zeile der Kundenliste. Nur die Spalten, die die Tabelle zeigt - der
// vollstaendige Customer mit 21 Feldern waere fuer 50 Zeilen unnoetig gross.
// riskLevel und churnProbability sind null, wenn es fuer den Kunden noch
// keine Vorhersage gibt.
public record KundenZeile(
        Long id,
        String customerId,
        String contract,
        Integer tenure,
        BigDecimal monthlyCharges,
        RiskLevel riskLevel,
        Double churnProbability
) {
}
