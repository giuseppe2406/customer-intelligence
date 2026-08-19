package de.bivona.customer_intelligence.model;

import java.math.BigDecimal;

// Kennzahlen ueber alle Kunden, nicht nur ueber die angezeigte Listenlaenge.
public record ActionListSummary(long highRiskCount, BigDecimal highRiskRevenue) {}
